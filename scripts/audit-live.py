#!/usr/bin/env python3
"""Read-only crawl of all production sitemap URLs, with bounded concurrency and checkpoints."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from concurrent.futures import ThreadPoolExecutor,as_completed
from collections import Counter
import urllib.request,urllib.error,xml.etree.ElementTree as ET,json,time,hashlib,gzip,re,threading,subprocess,argparse
from datetime import datetime,timezone
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument("--sample",action="store_true",help="Check all central pages and province directories, plus first/last municipality per province and two Madrid districts")
args=parser.parse_args()
ROOT=Path(__file__).resolve().parents[1];BASE='https://antenasnorte24.com';OUT=ROOT/'audit';OUT.mkdir(exist_ok=True)
USER_AGENT='AntenasNorte24-OwnerAudit/1.0'
def fetch(url):
 start=time.monotonic()
 try:
  req=urllib.request.Request(url,headers={'User-Agent':USER_AGENT,'Accept-Encoding':'gzip'})
  with urllib.request.urlopen(req,timeout=25) as r:
   first=time.monotonic();raw=r.read();data=gzip.decompress(raw) if r.headers.get('Content-Encoding')=='gzip' else raw
   return {'status':r.status,'final_url':r.url,'seconds_to_headers':round(first-start,3),'seconds_total':round(time.monotonic()-start,3),'transfer_bytes':len(raw),'decoded_bytes':len(data),'content_type':r.headers.get('Content-Type',''),'x_robots_tag':r.headers.get('X-Robots-Tag',''),'cache_control':r.headers.get('Cache-Control',''),'body':data.decode('utf-8',errors='replace')}
 except urllib.error.HTTPError as e:return {'status':e.code,'error':str(e),'seconds_total':round(time.monotonic()-start,3)}
 except Exception as e:return {'status':None,'error':str(e),'seconds_total':round(time.monotonic()-start,3)}
class Page(HTMLParser):
 def __init__(self,s):
  super().__init__(convert_charrefs=True);self.title='';self.in_title=False;self.h1=0;self.canonical=[];self.robots='';self.description='';self.assets=[];self.ids=[];self.hrefs=[];self.schemas=[];self.script=None;self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if t=='title':self.in_title=True
  if t=='h1':self.h1+=1
  if t=='meta' and a.get('name')=='robots':self.robots=a.get('content','')
  if t=='meta' and a.get('name')=='description':self.description=a.get('content','')
  if t=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if t=='a':self.hrefs.append(a.get('href',''))
  if t=='img':self.assets.append(a.get('src',''))
  if t=='link' and a.get('rel') in ['stylesheet','icon','apple-touch-icon']:self.assets.append(a.get('href',''))
  if t=='script' and a.get('src'):self.assets.append(a['src'])
  if t=='script' and a.get('type')=='application/ld+json':self.script=''
 def handle_endtag(self,t):
  if t=='title':self.in_title=False
  if t=='script' and self.script is not None:self.schemas.append(self.script);self.script=None
 def handle_data(self,s):
  if self.in_title:self.title+=s
  if self.script is not None:self.script+=s
index=fetch(BASE+'/sitemap.xml');assert index.get('status')==200,index
sitemaps=[e.text for e in ET.fromstring(index.pop('body')).findall('.//{*}loc')]
urls=[];sm=[]
with ThreadPoolExecutor(max_workers=8) as ex:
 for url,r in zip(sitemaps,ex.map(fetch,sitemaps)):
  body=r.pop('body','');r['url']=url
  if r.get('status')==200:
   children=[e.text for e in ET.fromstring(body).findall('.//{*}loc')];urls+=children;r['url_count']=len(children)
  sm.append(r)
assert len(urls)==len(set(urls)),'Duplicate sitemap URLs'
sitemap_url_count=len(urls)
if args.sample:
 central=[u for u in urls if len(urlsplit(u).path.strip('/').split('/'))<=1 or urlsplit(u).path.startswith(('/servicios/','/guias/','/marcas/'))]
 localities=json.loads((ROOT/'dist/assets/localidades.json').read_text())
 selected=[]
 for province in ['bizkaia','alava','gipuzkoa','burgos','cantabria','la-rioja','madrid']:
  towns=[m for m in localities if m.get('type')=='municipality' and m['provinceSlug']==province]
  selected += [BASE+towns[0]['url'],BASE+towns[-1]['url']]
 districts=[m for m in localities if m.get('type')=='district'];selected += [BASE+districts[0]['url'],BASE+districts[-1]['url']]
 urls=list(dict.fromkeys(central+selected))
print(json.dumps({'scope':'sample' if args.sample else 'full','urls_to_check':len(urls),'sitemap_url_count':sitemap_url_count}),flush=True)
results=[];assets=set();counter=Counter();lock=threading.Lock();start=time.monotonic()
def check(url):
 r=fetch(url);body=r.pop('body','');r['url']=url;r['issues']=[]
 if r.get('status')!=200:r['issues'].append('http_not_200');return r,[]
 p=Page(body);r.update({'title':p.title,'description':p.description,'h1_count':p.h1,'canonical':p.canonical,'meta_robots':p.robots,'link_count':len(p.hrefs),'body_sha256':hashlib.sha256(body.encode()).hexdigest()})
 if p.h1!=1:r['issues'].append('h1_count')
 if p.canonical!=[url]:r['issues'].append('canonical')
 if not p.title or not p.description:r['issues'].append('metadata_missing')
 if 'noindex' in p.robots.lower() or 'noindex' in r['x_robots_tag'].lower():r['issues'].append('noindex_on_sitemap_url')
 if len(p.ids)!=len(set(p.ids)):r['issues'].append('duplicate_ids')
 for s in p.schemas:
  try:json.loads(s)
  except Exception:r['issues'].append('invalid_jsonld')
 local=ROOT/'dist'/urlsplit(url).path.strip('/')/'index.html' if urlsplit(url).path!='/' else ROOT/'dist/index.html'
 r['matches_local_build']=local.exists() and r['body_sha256']==hashlib.sha256(local.read_bytes()).hexdigest()
 if not r['matches_local_build']:r['issues'].append('differs_from_local_build')
 return r,[BASE+a for a in p.assets if a.startswith('/')]
with ThreadPoolExecutor(max_workers=12) as ex:
 jobs={ex.submit(check,u):u for u in urls}
 for future in as_completed(jobs):
  r,aa=future.result();results.append(r);assets.update(aa);counter[str(r.get('status'))]+=1
  if len(results)%50==0 or len(results)==len(urls):
   progress={'completed':len(results),'total':len(urls),'http_counts':dict(counter),'pages_with_issues':sum(bool(x['issues']) for x in results),'elapsed_seconds':round(time.monotonic()-start)}
   (OUT/'live-progress.json').write_text(json.dumps(progress));print(json.dumps(progress),flush=True)
resources=[]
with ThreadPoolExecutor(max_workers=8) as ex:
 for u,r in zip(sorted(assets),ex.map(fetch,sorted(assets))):
  r.pop('body',None);r['url']=u;resources.append(r)
report={'date':datetime.now(timezone.utc).isoformat(),'scope':'sample' if args.sample else 'full','sitemap_url_count':sitemap_url_count,'base_url':BASE,'source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'sitemaps':sm,'urls_checked':len(results),'http_counts':dict(counter),'pages_with_issues':sum(bool(x['issues']) for x in results),'assets_checked':len(resources),'asset_errors':[r for r in resources if r.get('status')!=200],'elapsed_seconds':round(time.monotonic()-start),'timing_note':'Mediciones desde un único entorno de red; no representan Core Web Vitals ni pruebas móviles.','pages':sorted(results,key=lambda x:x['url']),'assets':resources}
(OUT/'live-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('COMPLETE',json.dumps({k:v for k,v in report.items() if k not in ['pages','assets','sitemaps']},ensure_ascii=False),flush=True)

summary={k:v for k,v in report.items() if k not in ['pages','assets']}
summary['page_issues']=[{'url':p['url'],'issues':p['issues']} for p in results if p['issues']]
summary['pages_matching_local_build']=sum(p.get('matches_local_build',False) for p in results)
summary['duplicate_titles']=[t for t,n in Counter(p.get('title') for p in results).items() if t and n>1]
summary['duplicate_descriptions']=[t for t,n in Counter(p.get('description') for p in results).items() if t and n>1]
summary['note']='El informe detallado live-audit.json se genera localmente. El cotejo SHA256 con dist y el rastreo estático verifican los enlaces de las mismas páginas publicadas.'
(OUT/'live-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
