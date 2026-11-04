import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {config} from './coverage-config.mjs';
import {distanceKm} from './municipal-coverage.mjs';
const auditOnly=process.argv.includes('--audit'),root='dist',origin=config.domain;
const coverage=JSON.parse(fs.readFileSync(root+'/coverage-manifest.json','utf8')),settings=JSON.parse(fs.readFileSync('data/seo-review.json','utf8')),services=JSON.parse(fs.readFileSync('data/services.json','utf8'));
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),decode=s=>s.replace(/&(amp|quot|apos|lt|gt|#39);/g,(_,k)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>','#39':"'"}[k]));
const plain=s=>decode(s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()),slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const files=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(path.join(d,x.name)):[path.join(d,x.name)]);
const docs=files(root).filter(f=>f.endsWith('.html')).map(file=>{const route=file===root+'/404.html'?'/404.html':file===root+'/index.html'?'/':'/'+path.relative(root,path.dirname(file)).replaceAll(path.sep,'/')+'/';return {file,route,html:fs.readFileSync(file,'utf8')};}),byRoute=new Map(docs.map(p=>[p.route,p]));
const title=h=>plain(h.match(/<title>([\s\S]*?)<\/title>/)?.[1]||''),description=h=>decode(h.match(/<meta name="description" content="([^"]*)"/)?.[1]||''),h1=h=>plain(h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]||'');
const graph=h=>JSON.parse(h.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]||'[]');
const putGraph=(h,g)=>h.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(g).replaceAll('<','\\u003c')+b);
function incoming(){const map=new Map(docs.map(p=>[p.route,new Set()]));for(const p of docs){if(!coverage.preview&&!coverage.indexableRoutes.includes(p.route))continue;for(const [,raw] of p.html.matchAll(/href="([^"]+)"/g)){let u;try{u=new URL(decode(raw),origin+p.route);}catch{continue;}if(u.origin===origin&&u.pathname!==p.route&&map.has(u.pathname))map.get(u.pathname).add(p.route);}}return map;}
function addLinks(p,links,id){if(p.html.includes(`id="${id}"`))return;const block=`<div class="wrap article" id="${id}"><p class="guide-reference">${links.map(([url,label])=>`<a href="${url}">${e(label)} →</a>`).join('<br>')}</p></div>`;const marker=/(<section\b[^>]*\bid="contacto"[^>]*>)/;assert(marker.test(p.html),'Sin contacto: '+p.route);p.html=p.html.replace(marker,block+'$1');}
if(!auditOnly){
 const districts=JSON.parse(fs.readFileSync('data/madrid-distritos.json','utf8')).districts;
 for(const p of docs){let meta=settings.metadata[p.route]||{};
  const province=config.provinces.find(x=>p.route===x.url);if(province)meta={...meta,description:`Instalación y reparación de antenas, porteros y videoporteros en ${province.name}. Busca tu municipio y consulta disponibilidad para viviendas y comunidades.`};
  const district=districts.find(d=>p.route==='/madrid/distritos/'+slug(d.name)+'/');if(district)meta={title:`Antenista en ${district.name}, Madrid | Antenas Norte 24`,description:`Antenas TDT y parabólicas, porteros y videoporteros en ${district.name}, Madrid. Instalación y reparación para viviendas y comunidades.`};
  if(meta.title)p.html=p.html.replace(/<title>[\s\S]*?<\/title>/,`<title>${e(meta.title)}</title>`);
  for(const [key,value] of Object.entries({description:meta.description,'og:title':meta.title,'og:description':meta.description}))if(value)p.html=p.html.replace(new RegExp('(<meta\\b[^>]*(?:name|property)="'+key+'"[^>]*content=")[^"]*("[^>]*>)','g'),(_,a,b)=>a+e(value)+b);
  const g=graph(p.html),page=g.find(x=>['WebPage','CollectionPage'].includes(x['@type']));if(page){page['@id']=origin+p.route+'#webpage';page.name=title(p.html);page.description=description(p.html);}
  const organization=g.find(x=>x['@type']==='Organization');if(organization){organization.description='Instalación y reparación de antenas, porteros automáticos y videoporteros para viviendas y comunidades.';organization.areaServed=config.provinces.map(p=>({'@type':'AdministrativeArea',name:p.name}));}
  const website=g.find(x=>x['@type']==='WebSite');if(website){website['@id']=origin+'/#website';website.publisher={'@id':origin+'/#organization'};}
  if(p.route==='/guias/'){
   const links=[...new Set([...p.html.matchAll(/href="(\/guias\/[^"#?]+\/)"/g)].map(m=>m[1]))];page['@type']='CollectionPage';page.mainEntity={'@type':'ItemList',itemListElement:links.map((url,i)=>({'@type':'ListItem',position:i+1,url:origin+url,name:h1(byRoute.get(url).html)}))};
  }else if(p.route.startsWith('/guias/')){
   // The publisher is known; no person, publication date or review date is invented.
   const article={'@context':'https://schema.org','@type':'Article','@id':origin+p.route+'#article',headline:h1(p.html),description:description(p.html),inLanguage:'es',url:origin+p.route,mainEntityOfPage:{'@id':origin+p.route+'#webpage'},publisher:{'@id':origin+'/#organization'}};
   const main=p.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'',image=main.match(/<img[^>]*src="([^"]+)"/)?.[1];if(image)article.image=origin+image;g.push(article);page.mainEntity={'@id':article['@id']};
  }
  if(p.route.startsWith('/marcas/'))page.about={'@type':'Brand',name:h1(p.html)};
  p.html=putGraph(p.html,g);
 }
 for(const s of services){const p=byRoute.get('/servicios/'+s.slug+'/');if(!p)continue;
  p.html=p.html.replace(/(<h3>Equipos y marcas<\/h3><p>)([\s\S]*?)(<\/p>)/,(_,a,text,b)=>{for(const name of [...s.brands].sort((a,b)=>b.length-a.length)){const url='/marcas/'+slug(name)+'/';if(byRoute.has(url))text=text.replace(e(name),`<a href="${url}">${e(name)}</a>`);}return a+text+b;});
 }
 const extras={
  '/servicios/amplificacion-tdt-satelite/':[['/guias/amplificador-antena-vivienda-comunidad/','Amplificador de vivienda o cabecera comunitaria: qué cambia'],['/marcas/promax/','Qué aporta la medición de nivel y calidad de señal']],
  '/servicios/instalacion-starlink/':[['/guias/preparar-instalacion-starlink/','Qué preparar antes del montaje de Starlink']]
 };
 for(const [route,links] of Object.entries(extras))addLinks(byRoute.get(route),links,'lecturas-relacionadas');
 const inlinks=incoming(),towns=config.towns.filter(t=>coverage.assignments.some(a=>a.original===t.route&&a.destination===t.route)),repairs=new Map();
 for(const town of towns)if(inlinks.get(town.route).size<2){const source=towns.filter(t=>t.provinceSlug===town.provinceSlug&&t.route!==town.route&&!inlinks.get(town.route).has(t.route)).sort((a,b)=>distanceKm(town,a)-distanceKm(town,b)||a.code.localeCompare(b.code))[0];assert(source,'Sin referencia adicional '+town.name);if(!repairs.has(source.route))repairs.set(source.route,[]);repairs.get(source.route).push([town.route,'Más cobertura en '+town.province+': '+town.name]);}
 for(const [route,links] of repairs)addLinks(byRoute.get(route),links,'otras-referencias-cobertura');
 for(const p of docs)fs.writeFileSync(p.file,p.html);
}
const inlinks=incoming(),seen=new Set(),warnings={titleTooLong:[],descriptionTooLong:[],descriptionTooShort:[],oneIncomingLink:[]};
for(const route of coverage.indexableRoutes){const p=byRoute.get(route),t=title(p.html),d=description(p.html);assert(!seen.has(t),'Título duplicado: '+route);seen.add(t);if(t.length>70)warnings.titleTooLong.push({route,length:t.length});if(d.length>160)warnings.descriptionTooLong.push({route,length:d.length});if(d.length<110)warnings.descriptionTooShort.push({route,length:d.length});if(route!=='/'&&inlinks.get(route).size<2)warnings.oneIncomingLink.push(route);
 const g=graph(p.html);if(route.startsWith('/guias/')&&route!=='/guias/')assert(g.some(x=>x['@type']==='Article'&&x.headline===h1(p.html)),route+': artículo coherente');if(route==='/guias/')assert(g.some(x=>x['@type']==='CollectionPage'&&x.mainEntity?.['@type']==='ItemList'));if(route.startsWith('/marcas/'))assert(!g.some(x=>x['@type']==='Product'),'Ficha de servicio marcada como producto');
}
for(const [key,list] of Object.entries(warnings))assert.equal(list.length,0,key+': '+JSON.stringify(list));
const report={ok:true,indexablePages:coverage.urls,guideArticles:docs.filter(p=>p.route.startsWith('/guias/')&&p.route!=='/guias/').length,reviewedMetadata:Object.keys(settings.metadata).length,warnings,scope:'SEO técnico y semántica; no acredita posiciones ni penalización. Los límites de texto son criterios editoriales, no requisitos de Google.'};fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/seo-review.json',JSON.stringify(report,null,2));console.log('REVISIÓN SEO OK:',JSON.stringify(report));
