#!/usr/bin/env python3
"""Crawl the generated site: SEO, links, schemas, contacts and all sitemap entries."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from collections import Counter,deque
import json,xml.etree.ElementTree as ET,re,sys
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';BASE='https://antenasnorte24.com'
errors=[]
preview=json.loads((ROOT/'build-report.json').read_text()).get('preview',False)
def require(ok,msg):
 if not ok: errors.append(msg)
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(convert_charrefs=True);self.links=[];self.images=[];self.ids=[];self.h1=0;self.canonical=[];self.meta={};self.title='';self.scripts=[];self.script=None;self.in_title=False;self.labels=[];self.fields=[];self.html_lang='';self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.html_lang=a.get('lang')
  if 'id' in a:self.ids.append(a['id'])
  if tag=='a':self.links.append(a.get('href',''))
  if tag=='img':self.images.append(a)
  if tag=='h1':self.h1+=1
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if tag=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content')
  if tag=='title':self.in_title=True
  if tag=='script' and a.get('type')=='application/ld+json':self.script=''
  if tag=='label' and a.get('for'):self.labels.append(a['for'])
  if tag in ['input','select','textarea'] and a.get('id'):self.fields.append(a['id'])
 def handle_data(self,data):
  if self.in_title:self.title+=data
  if self.script is not None:self.script+=data
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='script' and self.script is not None:self.scripts.append(self.script);self.script=None
files=list(D.rglob('*.html'));parsed={};routes={};indexable=[];incoming=Counter();total_links=0
for f in files:
 route='/' if f==D/'index.html' else '/'+f.parent.relative_to(D).as_posix()+'/'
 if f.name=='404.html':route='/404.html'
 text=f.read_text();p=Page(text);parsed[f]=p;routes[route]=f
 require(p.h1==1,f'{route}: expected exactly one H1')
 require(p.html_lang=='es',f'{route}: wrong language')
 require(len(p.ids)==len(set(p.ids)),f'{route}: duplicate IDs')
 require(len(p.canonical)==1,f'{route}: canonical missing/duplicate')
 require(bool(p.meta.get('description')),f'{route}: missing description')
 require(all(field in p.labels for field in p.fields),f'{route}: unlabelled form control')
 require('Review' not in text and 'aggregateRating' not in text,f'{route}: unexpected rating markup')
 require('lorem ipsum' not in text.lower(),f'{route}: placeholder')
 for raw in p.scripts:
  try: json.loads(raw)
  except Exception as e: errors.append(f'{route}: invalid JSON-LD {e}')
 for image in p.images:
  src=image.get('src','')
  require(bool(image.get('alt')),f'{route}: image without alt')
  require(src.startswith('/') and (D/src.lstrip('/')).is_file(),f'{route}: missing image {src}')
  require('width' in image and 'height' in image,f'{route}: image missing dimensions')
 if route not in ['/aviso-legal/','/privacidad/','/cookies/','/404/','/404.html']:
  require(('noindex' in p.meta.get('robots',''))==preview,f'{route}: wrong preview/production indexing')
  indexable.append((route,p));require(p.canonical==[BASE+route],f'{route}: incorrect canonical')
  if route.startswith('/madrid/'):
   require('href="tel:+34614789945"' in text,f'{route}: wrong Madrid phone')
   require('data-zone="madrid"' in text,f'{route}: wrong active zone')
   require('value="madrid" selected' in text,f'{route}: wrong form province')
 for u in p.links:
  split=urlsplit(u)
  if split.scheme or split.netloc:continue
  dest=unquote(split.path) or route
  if not dest.startswith('/'):continue
  if dest.endswith('/'):target=D/dest.lstrip('/')/'index.html'
  else:target=D/dest.lstrip('/')
  require(target.is_file(),f'{route}: broken link {u}')
  if target.is_file() and split.fragment and target.suffix=='.html':
   require('id="'+unquote(split.fragment)+'"' in target.read_text(),f'{route}: missing anchor {u}')
  incoming[dest]+=1;total_links+=1
require(len({p.title for r,p in indexable})==len(indexable),'Duplicate indexable titles')
require(len({p.canonical[0] for r,p in indexable})==len(indexable),'Duplicate canonical URLs')
# BFS from home: every municipality should be reachable through its province.
dist={'/':0};queue=deque(['/'])
while queue:
 route=queue.popleft();p=parsed[routes[route]]
 for u in p.links:
  s=urlsplit(u);dest=unquote(s.path)
  if not s.scheme and not s.netloc and dest in routes and dest not in dist:
   dist[dest]=dist[route]+1;queue.append(dest)
for r,p in indexable:require(r in dist,f'{r}: orphan indexable page')
localities=json.loads((D/'assets/localidades.json').read_text())
municipalities=[m for m in localities if m.get('type')=='municipality']
districts=[m for m in localities if m.get('type')=='district']
urban=[m for m in localities if m.get('type')=='urban_zone']
expected_urban=sum(len(c['zones']) for c in json.loads((ROOT/'data/zonas-capitales.json').read_text())['cities'])
require(len(urban)==expected_urban,'Missing urban search entries')
for m in localities:require(dist.get(unquote(urlsplit(m['url']).path),999)<=2,f'{m["url"]}: more than two clicks from home')
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
index=ET.parse(D/'sitemap.xml');urls=[]
for el in index.findall('.//s:loc',ns):
 f=D/urlsplit(el.text).path.lstrip('/');require(f.exists(),f'Missing sitemap {f}')
 urls.extend(e.text for e in ET.parse(f).findall('.//s:loc',ns))
require(set(urls)=={BASE+r for r,p in indexable},'Sitemap / indexable URL mismatch')
require(len(urls)==len(set(urls)),'Duplicate sitemap URLs')
require(('Disallow: /' in (D/'robots.txt').read_text())==preview,'Incorrect preview/production robots policy')
require(all(p.stat().st_size<400000 for p in (D/'assets').glob('*.webp')),'Large WebP image')
print(json.dumps({'html_pages':len(files),'indexable_pages':len(indexable),'municipalities':len(municipalities),'madrid_districts':len(districts),'other_capital_zones':len(urban),'internal_links_checked':total_links,'sitemap_urls':len(urls),'max_municipality_click_depth':max(dist.get(m['url'],999) for m in municipalities),'errors':len(errors)},indent=2))
if errors:
 print('\n'.join(errors[:40]));sys.exit(1)
print('PASS: links, images, forms, contacts, JSON-LD, canonical, crawl paths and sitemaps.')
