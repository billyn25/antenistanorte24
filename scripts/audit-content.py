from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
from itertools import combinations
import re,json,statistics,hashlib,socket
from datetime import date
root=Path(__file__).resolve().parents[1];dist=root/'dist'
class Text(HTMLParser):
 def __init__(self,s):super().__init__();self.bits=[];self.feed(s)
 def handle_data(self,s):self.bits.append(s)
def extract(path):
 s=path.read_text();main=re.search(r'<main[^>]*>(.*?)</main>',s,re.S).group(1)
 for ident in ['contacto','mapa']:main=re.sub(r'<section[^>]*id="'+ident+r'"[^>]*>.*?</section>',' ',main,flags=re.S)
 main=re.sub(r'<(?:script|style|svg|nav|form)\b[^>]*>.*?</(?:script|style|svg|nav|form)>',' ',main,flags=re.S)
 return ' '.join(Text(main).bits)
def words(s):return re.findall(r'\w+',s.lower())
def normal(s,t):
 for v in sorted([t['name'],t['province']],key=len,reverse=True):s=re.sub(re.escape(v),'LOCALIDAD',s,flags=re.I)
 s=re.sub(r'\b\d{5}\b','INE',s);s=s.replace('670 042 626','TELEFONO').replace('614 78 99 45','TELEFONO');return words(s)
def shingle(w):return {tuple(w[i:i+5]) for i in range(len(w)-4)}
local=[m for m in json.loads((dist/'assets/localidades.json').read_text()) if m.get('type')=='municipality'];service=json.loads((root/'data/services.json').read_text());counts=[];texts={}
for t in local:
 text=extract(dist/t['url'].strip('/')/'index.html');counts.append(len(words(text)));texts[t['url']]=text
service_counts={s['title']:len(words(extract(dist/'servicios'/s['slug']/'index.html'))) for s in service}
selected=[]
for name in ['Zalla','Balmaseda','Güeñes','Logroño','Haro','Calahorra','Madrid','Torrelaguna','Lerma']:
 selected += [t for t in local if t['name']==name][:1]
pairs=[]
for a,b in combinations(selected,2):
 A=shingle(normal(texts[a['url']],a));B=shingle(normal(texts[b['url']],b));pairs.append({'a':a['name'],'b':b['name'],'same_province':a['province']==b['province'],'jaccard_5word_percent':round(100*len(A&B)/len(A|B),1)})
# Broader independent sample: preserve the original nine-town comparison above.
expanded={t['url']:t for t in selected}
for province in sorted({t['province'] for t in local}):
 towns=sorted([t for t in local if t['province']==province],key=lambda t:t['url'])
 for t in [towns[0],towns[len(towns)//2],towns[-1]]:expanded[t['url']]=t
expanded=list(expanded.values())
shingles={t['url']:shingle(normal(texts[t['url']],t)) for t in expanded}
expanded_pairs=[]
for a,b in combinations(expanded,2):
 A=shingles[a['url']];B=shingles[b['url']]
 expanded_pairs.append({'a':a['name'],'b':b['name'],'same_province':a['province']==b['province'],'jaccard_5word_percent':round(100*len(A&B)/len(A|B),1)})
values=[x['jaccard_5word_percent'] for x in expanded_pairs]
expanded_summary={'municipalities':len(expanded),'pairs':len(values),'provinces':len({t['province'] for t in expanded}),'selection':'Original nine plus first, middle and last municipality by URL in each province; same extraction and normalization. Independent broader sample, not a before/after comparison.','median_percent':statistics.median(values),'min_percent':min(values),'max_percent':max(values),'pairs_at_least_80_percent':sum(v>=80 for v in values),'most_similar_pairs':sorted(expanded_pairs,key=lambda p:-p['jaccard_5word_percent'])[:10]}
metadata=[]
for p in dist.rglob('index.html'):
 s=p.read_text()
 if '<meta name="robots" content="noindex' in s:continue
 metadata.append({'title':re.search(r'<title>(.*?)</title>',s).group(1),'description':re.search(r'<meta name="description" content="([^"]*)',s).group(1)})
r={'date':date.today().isoformat(),'municipal_pages':len(local),'indexable_pages':len(metadata),'content_words_excluding_contact_map_nav':{'municipal_min':min(counts),'municipal_median':statistics.median(counts),'municipal_max':max(counts),'services':service_counts},'metadata':{'duplicate_titles':sum(v-1 for v in Counter(x['title'] for x in metadata).values()),'duplicate_descriptions':sum(v-1 for v in Counter(x['description'] for x in metadata).values()),'titles_over_65_characters':sum(len(x['title'])>65 for x in metadata),'descriptions_over_170_characters':sum(len(x['description'])>170 for x in metadata)},'similarity_method':'Jaccard sobre conjuntos de secuencias de 5 palabras del contenido principal, excluyendo contacto, mapa, navegación y SVG; nombres propios de municipio/provincia, teléfono e INE normalizados. Muestra de 9 municipios; 36 pares. Indicador editorial, no evaluación ni umbral de Google.','expanded_sample':expanded_summary,'sample_pairs':pairs,'sample_similarity_median':statistics.median(x['jaccard_5word_percent'] for x in pairs),'map_rioja':'La Rioja' in (root/'assets/mapa-cobertura.svg').read_text()}
(root/'audit/content-audit.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in r.items() if k!='sample_pairs'},ensure_ascii=False,indent=2))
