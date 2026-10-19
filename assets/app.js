'use strict';
const $ = (s, root=document) => root.querySelector(s);
const phones = { norte: {raw:'670042626',label:'670 042 626'}, madrid:{raw:'614789945',label:'614 78 99 45'} };
let zone = document.body.dataset.zone || 'norte';
const messageURL=(z,text)=>'https://wa.me/34'+phones[z].raw+'?text='+encodeURIComponent(text);
function changeZone(z){
 if(!phones[z])return;zone=z;
 document.querySelectorAll('[data-call]').forEach(a=>{a.href='tel:+34'+phones[z].raw;if(a.dataset.number!==undefined)a.textContent=phones[z].label;});
 document.querySelectorAll('[data-whatsapp]').forEach(a=>{a.href=messageURL(z,a.dataset.message||'Hola, quiero consultar un servicio de Antenas Norte 24.');});
 const select=$('#contact-zone');if(select)select.value=z;
 const label=$('#active-phone');if(label)label.textContent=phones[z].label;
}
$('#contact-zone')?.addEventListener('change',e=>changeZone(e.target.value));
$('.menu-button')?.addEventListener('click',e=>{const open=$('.nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));e.currentTarget.textContent=open?'Cerrar ×':'Menú ☰';});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{$('.nav').classList.remove('open');$('.menu-button').setAttribute('aria-expanded','false');$('.menu-button').textContent='Menú ☰';}));
let townsPromise;
function getTowns(){return townsPromise ||= fetch('/assets/localidades.json').then(r=>{if(!r.ok)throw Error('No se ha podido cargar el listado');return r.json()});}
const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const search=$('#town-search'), province=$('#town-province'), results=$('#town-results'), status=$('#search-status');
let searchSequence=0;
async function findTowns(){
 const seq=++searchSequence;
 try{
 const data=await getTowns();if(seq!==searchSequence)return;
 const query=fold(search.value),p=province.value;
 const hits=data.filter(t=>(!p||t.provinceSlug===p)&&(!query||fold(t.name+' '+(t.searchText||'')).includes(query)));
 results.replaceChildren();
 hits.slice(0,18).forEach(t=>{const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');a.href=t.url;a.textContent=t.name;small.textContent=t.province;a.appendChild(small);li.appendChild(a);results.appendChild(li)});
 status.textContent=hits.length?`${hits.length} localidades. ${hits.length>18?'Mostrando las primeras 18; escribe para afinar la búsqueda.':''}`:'No encontramos esa localidad. Consulta por WhatsApp indicando el pueblo y la provincia.';
 }catch(e){status.textContent='No se ha podido cargar el buscador. Puedes acceder a los pueblos desde los enlaces de provincia.';}
}
if(search){search.addEventListener('input',findTowns);province.addEventListener('change',findTowns);findTowns();}
const form=$('#contact-form');
if(form){
 const p=$('#form-province',form),town=$('#form-town',form),list=$('#form-town-list',form),destination=$('#form-destination',form);
 function setDestination(){const z=p.value==='madrid'?'madrid':'norte';destination.textContent='Tu consulta se preparará para '+(z==='madrid'?'Madrid':'Zona norte')+' · '+phones[z].label;changeZone(z);}
 p.addEventListener('change',async()=>{setDestination();town.value='';if(list){list.replaceChildren();try{(await getTowns()).filter(t=>t.provinceSlug===p.value).forEach(t=>{const option=document.createElement('option');option.value=t.name;list.appendChild(option)});}catch(e){/* Free text remains available. */}}});
 setDestination();
 form.addEventListener('submit',e=>{
 e.preventDefault();if(!form.reportValidity())return;if(form.elements.website.value)return;
 const data=new FormData(form),z=data.get('province')==='madrid'?'madrid':'norte';
 const text=`Hola, quiero consultar un servicio de Antenas Norte 24.\nServicio: ${data.get('service')}\nProvincia: ${p.options[p.selectedIndex].text}\nLocalidad: ${data.get('town')}\nInmueble: ${data.get('property')}\nNombre: ${data.get('name')}\nTeléfono de contacto: ${data.get('phone')}\nConsulta: ${data.get('message')||'Prefiero explicarlo por WhatsApp.'}`;
 window.location.assign(messageURL(z,text));
 });
}
changeZone(zone);

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
