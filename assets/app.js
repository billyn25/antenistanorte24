'use strict';
const $ = (s, root=document) => root.querySelector(s);
const phones = { norte: {raw:'670042626',label:'670 042 626'}, madrid:{raw:'614789945',label:'614 78 99 45'} };
let zone = document.body.dataset.zone || 'norte';
let activeLocation=null,handleZoneChoice;
const messageURL=(z,text)=>'https://wa.me/34'+phones[z].raw+'?text='+encodeURIComponent(text);
function changeZone(z){
 if(!phones[z])return;zone=z;
 document.querySelectorAll('[data-call]').forEach(a=>{a.href='tel:+34'+phones[z].raw;if(a.dataset.numberPrefix!==undefined)a.textContent=a.dataset.numberPrefix+phones[z].label;else if(a.dataset.number!==undefined)a.textContent=phones[z].label;});
 document.querySelectorAll('[data-whatsapp]').forEach(a=>{
  let text=a.dataset.message||'Hola, quiero consultar un servicio de Antenas Norte 24.';
  const source=document.body.dataset,localMessage=a.dataset.localMessage!==undefined&&source.locationName;
  const samePlace=localMessage&&activeLocation?.province===source.locationProvince&&activeLocation?.name===source.locationName;
  if(localMessage&&!samePlace)text='Hola, quiero consultar un servicio de Antenas Norte 24.';
  if(a.dataset.locationAware!==undefined&&activeLocation&&!samePlace)text+=activeLocation.name?'\nLocalidad: '+activeLocation.name+' ('+activeLocation.provinceLabel+')':'\nProvincia: '+activeLocation.provinceLabel;
  a.href=messageURL(z,text);
 });
 const select=$('#contact-zone');if(select)select.value=z;
 const label=$('#active-phone');if(label)label.textContent=phones[z].label;
}
$('#contact-zone')?.addEventListener('change',e=>handleZoneChoice?handleZoneChoice(e.target.value):changeZone(e.target.value));
$('.menu-button')?.addEventListener('click',e=>{const open=$('.nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));e.currentTarget.textContent=open?'Cerrar ×':'Menú ☰';});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{$('.nav').classList.remove('open');$('.menu-button').setAttribute('aria-expanded','false');$('.menu-button').textContent='Menú ☰';}));
let townsPromise;
function getTowns(){return townsPromise ||= fetch('/assets/localidades.json').then(r=>{if(!r.ok)throw Error('No se ha podido cargar el listado');return r.json()});}
const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const search=$('#town-search'), province=$('#town-province'), results=$('#town-results'), status=$('#search-status');
const searchServiceAnchors=new Set(['antenas-tdt','porteros-automaticos','videoporteros']);
let searchSequence=0;
async function findTowns(){
 const seq=++searchSequence;
 if(!search.value.trim()&&!province?.value){results.replaceChildren();status.textContent=province?'Escribe una localidad o elige una provincia para buscar.':'Escribe una localidad para buscar en todas las provincias.';return;}
 try{
 const data=await getTowns();if(seq!==searchSequence)return;
 const query=fold(search.value),p=province?.value||'';
 const serviceAnchor=searchServiceAnchors.has(search.dataset.serviceAnchor)?search.dataset.serviceAnchor:'';
 const hits=data.filter(t=>(!p||t.provinceSlug===p)&&(!query||fold(t.name+' '+(t.searchText||'')).includes(query)));
 results.replaceChildren();
 hits.slice(0,18).forEach(t=>{const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');a.href=serviceAnchor?t.url.split(/[?#]/)[0]+'#'+serviceAnchor:t.url;a.textContent=t.name;small.textContent=t.province;a.appendChild(small);li.appendChild(a);results.appendChild(li)});
 status.textContent=hits.length?`${hits.length} resultados. ${hits.length>18?'Mostrando las primeras 18; escribe para afinar la búsqueda.':''}`:'No encontramos esa localidad. Consulta por WhatsApp indicando el pueblo y la provincia.';
 }catch(e){status.textContent='No se ha podido cargar el buscador. Puedes acceder a los pueblos desde los enlaces de provincia.';}
}
if(search){search.addEventListener('input',findTowns);province?.addEventListener('change',findTowns);findTowns();}
const form=$('#contact-form');
if(form){
 const p=$('#form-province',form),town=$('#form-town',form),list=$('#form-town-list',form),destination=$('#form-destination',form);
 let locationContext,listSequence=0;
 function setDestination(){
  if(!p.value){destination.textContent='Elige tu provincia para dirigir la consulta a su zona.';changeZone(zone);return;}
  const z=p.value==='madrid'?'madrid':'norte';destination.textContent='Tu consulta se preparará para '+(z==='madrid'?'Madrid':'Zona norte')+' · '+phones[z].label;changeZone(z);
 }
 async function refreshTownList(){
  const sequence=++listSequence,selected=p.value;if(!list)return;list.replaceChildren();if(!selected)return;
  try{
   const data=await getTowns();if(sequence!==listSequence||selected!==p.value)return;
   data.filter(t=>t.provinceSlug===selected&&t.type!=='urban_zone').forEach(t=>{const option=document.createElement('option');option.value=t.enquiryName||t.name;list.appendChild(option);});
  }catch(e){/* Free text remains available. */}
 }
 p.addEventListener('change',async()=>{town.value='';locationContext?.provinceChanged();setDestination();await refreshTownList();});
 if(Array.from(p.options||[]).some(option=>option.value))locationContext=enableLocationContext(form,p,town,setDestination,refreshTownList);
 setDestination();
 const serviceSelect=$('#form-service',form),messageField=$('#form-message',form);
 if(serviceSelect&&messageField){
  const updateMessageHint=()=>{
   const service=serviceSelect.value;
   messageField.placeholder=service==='Porteros automáticos'?'Indica si falla la llamada, el audio o la apertura, si afecta a más vecinos y la marca si la conoces.':service==='Videoporteros'?'Indica si falla la imagen, la llamada o la apertura, o si quieres renovar el sistema.':service==='Montaje de ventiladores de techo'?'Indica si ya tienes el ventilador o necesitas suministro, y cómo es el techo.':/antena|tdt|sintoniz|televisi/i.test(service)?'Por ejemplo: fallan varios canales en todo el edificio.':'Describe lo que necesitas y el equipo, si lo conoces.';
  };
  serviceSelect.addEventListener('change',updateMessageHint);updateMessageHint();
 }
 form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;if(form.elements.website.value)return;
 const data=new FormData(form),z=data.get('province')==='madrid'?'madrid':'norte';
 const tvDetails=[['channels','Canales afectados'],['timing','Cuándo ocurre'],['tv_scope','Alcance del fallo']].filter(([key])=>data.get(key)).map(([key,label])=>`\n${label}: ${data.get(key)}`).join('');
 const text=`Hola, quiero consultar un servicio de Antenas Norte 24.\nServicio: ${data.get('service')}\nProvincia: ${p.options[p.selectedIndex].text}\nLocalidad: ${data.get('town')}\nInmueble: ${data.get('property')}\nNombre: ${data.get('name')}\nTeléfono de contacto: ${data.get('phone')}\nConsulta: ${data.get('message')||'Prefiero explicarlo por WhatsApp.'}${data.get('nucleus')?'\nNúcleo o barrio: '+data.get('nucleus'):''}${tvDetails}`;
 window.location.assign(messageURL(z,text));
 });
}
changeZone(zone);

// Retain only a public province/locality identifier for this browser tab.
// Names, telephone numbers, addresses and message contents are never stored.
function enableLocationContext(form,p,town,setDestination,refreshTownList){
 const key='an24-location-v1',options=Array.from(p.options),provinces=new Set(options.map(option=>option.value).filter(Boolean));
 let revision=0,formEdited=false;
 const initialProvince=p.value,initialTown=town.value,metadata=document.body.dataset;
 const remove=()=>{try{window.sessionStorage.removeItem(key);}catch(e){/* Storage is optional. */}};
 const remember=(province,path='')=>{
  if(!provinces.has(province)){remove();return;}
  try{window.sessionStorage.setItem(key,JSON.stringify({version:1,province,path}));}catch(e){/* Storage is optional. */}
 };
 const setPublicLocation=(province,name='',path='')=>{
  activeLocation=provinces.has(province)?{province,name,path,provinceLabel:options.find(option=>option.value===province).text}:null;
 };
 const isPublicPath=(province,path)=>path===''||new RegExp('^/'+province+'/[a-z0-9-]+/$').test(path)||(province==='madrid'&&/^\/madrid\/distritos\/[a-z0-9-]+\/$/.test(path));
 const read=()=>{
  try{
   const raw=window.sessionStorage.getItem(key);if(!raw)return null;
   if(raw.length>512)throw Error('Invalid location context');
   const value=JSON.parse(raw);
   if(!value||Array.isArray(value)||Object.keys(value).some(name=>!['version','province','path'].includes(name))||value.version!==1||!provinces.has(value.province)||typeof value.path!=='string'||!isPublicPath(value.province,value.path))throw Error('Invalid location context');
   return value;
  }catch(e){remove();return null;}
 };
 const publicRecord=(data,province,path)=>Array.isArray(data)?data.find(item=>item&&item.url===path&&item.provinceSlug===province&&['municipality','district'].includes(item.type)&&typeof item.name==='string'):null;
 const recordName=record=>record.enquiryName||record.name;
 form.addEventListener('input',()=>{formEdited=true;});
 form.addEventListener('change',()=>{formEdited=true;});
 const provinceChanged=()=>{
  revision++;formEdited=true;setPublicLocation(p.value);remember(p.value);
 };
 town.addEventListener?.('input',()=>{
  revision++;formEdited=true;setPublicLocation(p.value);remember(p.value);setDestination();
 });
 town.addEventListener?.('change',async()=>{
  const sequence=++revision,province=p.value,name=town.value;formEdited=true;
  setPublicLocation(province);remember(province);setDestination();
  if(!provinces.has(province)||!name.trim())return;
  try{
   const data=await getTowns();if(sequence!==revision||p.value!==province||town.value!==name)return;
   const record=Array.isArray(data)?data.find(item=>item&&item.provinceSlug===province&&['municipality','district'].includes(item.type)&&typeof item.name==='string'&&[item.name,item.enquiryName].filter(Boolean).some(label=>fold(label)===fold(name))):null;
   if(record&&isPublicPath(province,record.url)){setPublicLocation(province,recordName(record),record.url);remember(province,record.url);setDestination();}
  }catch(e){/* An unverified/free-text locality is never stored. */}
 });
 handleZoneChoice=z=>{
  if(!phones[z])return;revision++;formEdited=true;
  let locationChanged=false;
  if(z==='madrid'&&p.value!=='madrid'){p.value='madrid';town.value='';setPublicLocation('madrid');remember('madrid');locationChanged=true;}
  else if(z==='norte'&&p.value==='madrid'){p.value='';town.value='';activeLocation=null;remove();locationChanged=true;}
  if(locationChanged){
   const nucleus=$('#form-nucleus',form);if(nucleus){nucleus.value='';nucleus.removeAttribute('list');}
   refreshTownList();
  }
  changeZone(z);setDestination();
 };
 if(provinces.has(metadata.locationProvince)){
  // The URL's explicit location wins over any previous tab context. Values
  // already changed before the script loaded are not replaced.
  const matches=p.value===metadata.locationProvince&&town.value===(metadata.locationName||'');
  const path=matches&&(metadata.locationName||'')&&isPublicPath(p.value,metadata.locationPath||'')?metadata.locationPath:'';
  setPublicLocation(p.value,matches?metadata.locationName:'',path);remember(p.value,path);
 }else if(metadata.locationInherit!==undefined){
  const saved=read();
  if(saved){
   const apply=record=>{
    if(formEdited||revision!==0||p.value!==initialProvince||town.value!==initialTown)return;
    p.value=saved.province;town.value=record?recordName(record):'';
    setPublicLocation(saved.province,record?recordName(record):'',record?saved.path:'');setDestination();refreshTownList();
   };
   if(!saved.path)apply(null);
   else getTowns().then(data=>{
    const record=publicRecord(data,saved.province,saved.path);
    if(record)apply(record);else if(!formEdited&&revision===0)remove();
   }).catch(()=>{apply(null);}); // The validated province still routes correctly if locality lookup fails.
  }
 }
 return {provinceChanged};
}

// Open the city area reached from a province link or the locality search.
function openUrbanArea(){
 if(typeof window==='undefined')return;
 let id;try{id=decodeURIComponent((window.location.hash||'').slice(1))}catch(e){return}
 if(!id.startsWith('zona-'))return;
 const area=document.getElementById?.(id);
 if(area?.matches?.('details.urban-zone'))area.open=true;
}
openUrbanArea();
if(typeof window!=='undefined')window.addEventListener?.('hashchange',openUrbanArea);
// Keep locality and province when choosing a service on a local page.
document.querySelectorAll('[data-service-choice]').forEach(link=>{
 link.addEventListener('click',()=>{
  const select=document.querySelector('#form-service');
  if(select&&Array.from(select.options).some(option=>option.value===link.dataset.serviceChoice)){
   select.value=link.dataset.serviceChoice;
   select.dispatchEvent(new Event('change',{bubbles:true}));
  }
 });
});
// The diagnostic shortcut opens optional TV details; the visitor fills their own case.
document.querySelectorAll('[data-tv-incident]').forEach(link=>link.addEventListener('click',()=>{
 const details=document.querySelector('#tv-incident-fields');
 if(details)details.open=true;
}));
// Progressive local filters: all service content exists and is visible without JS.
const localServiceGrid=document.querySelector('#servicios-locales');
if(localServiceGrid){
 const cards=Array.from(localServiceGrid.querySelectorAll('[data-service-group]'));
 const filters=Array.from(document.querySelectorAll('[data-service-filter]'));
 const filterServices=group=>{
  cards.forEach(card=>{card.hidden=group!=='todos'&&card.dataset.serviceGroup!==group;});
  filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.serviceFilter===group)));
 };
 filters.forEach(button=>button.addEventListener('click',()=>filterServices(button.dataset.serviceFilter)));
 const revealAnchor=()=>{
  let id='';try{id=decodeURIComponent(window.location.hash.slice(1));}catch{return;}
  if(cards.some(card=>card.id===id))filterServices('todos');
 };
 window.addEventListener('hashchange',revealAnchor);
 revealAnchor();
}

// A reviewed residential area fills only the optional address detail.
const addressNucleus=document.querySelector('#form-nucleus');
if(addressNucleus){
 const addressTown=document.querySelector('#form-town'),addressProvince=document.querySelector('#form-province');
 const originalList=addressNucleus.getAttribute('list');
 const samePlace=()=>fold(addressTown?.value||'')===fold(addressNucleus.dataset.municipality)&&addressProvince?.value===addressNucleus.dataset.province;
 let wasSamePlace=samePlace();
 const syncNucleus=()=>{
  const matches=samePlace();
  if(!matches||!wasSamePlace)addressNucleus.value='';
  if(matches&&originalList)addressNucleus.setAttribute('list',originalList);else addressNucleus.removeAttribute('list');
  wasSamePlace=matches;
 };
 addressTown?.addEventListener('input',syncNucleus);addressProvince?.addEventListener('change',syncNucleus);
 document.querySelectorAll('[data-nucleus-choice]').forEach(link=>link.addEventListener('click',()=>{
  if(samePlace()){addressNucleus.value=link.dataset.nucleusChoice;addressNucleus.focus();}
 }));
}

// Deep links open their matching technical answer without hiding other services.
if(typeof window!=='undefined' && window.location){
 const revealConsultation=()=>{
  let id='';try{id=decodeURIComponent((window.location.hash||'').slice(1));}catch{return;}
  if(!/^consulta-[a-z0-9-]+$/.test(id))return;
  const answer=document.querySelector('#'+id);
  if(answer?.tagName==='DETAILS')answer.open=true;
 };
 window.addEventListener?.('hashchange',revealConsultation);
 revealConsultation();
}
