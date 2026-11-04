import fs from 'node:fs';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const provinces=read('data/provinces.json');
const geo=read('data/contexto-local.json');
const display=s=>s.replace(/^(.*), (El|La|Los|Las|el|la|los|las)$/,(m,n,a)=>a[0].toUpperCase()+a.slice(1)+' '+n);
const slug=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const config={key:'norte',domain:'https://antenasnorte24.com',label:'Antenas Norte 24',searchPath:'/assets/localidades.json',contactId:'contacto',townInput:'#form-town',provinces:provinces.map(p=>({...p,url:'/'+p.slug+'/'})),source:{population:geo.population_source,geography:geo.geography_source,retrieved:geo.retrieved,populationYear:geo.population_year},towns:read('data/municipios.json').map(t=>{const p=provinces.find(p=>p.id===t.provincia_id);const name=display(t.nombre);return {...geo.municipalities[t.municipio_id],code:t.municipio_id,name,province:p.name,provinceSlug:p.slug,route:'/'+p.slug+'/'+slug(name)+'/'};})};
