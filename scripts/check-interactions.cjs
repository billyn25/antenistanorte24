'use strict';
// Execute the shipped script in a minimal DOM and verify real phone routing.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function run(initial){
 const events={},call={dataset:{},href:''},wa={dataset:{},href:''},select={value:initial,addEventListener:(k,f)=>events[k]=f},label={};
 const map={'#contact-zone':select,'#active-phone':label};
 const document={body:{dataset:{zone:initial}},querySelector:s=>map[s]||null,querySelectorAll:s=>s==='[data-call]'?[call]:s==='[data-whatsapp]'?[wa]:[]};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document,fetch:()=>{throw Error('Unexpected fetch')}});
 return {call,wa,select,label,change:z=>events.change({target:{value:z}})};
}
const north=run('norte');assert.equal(north.call.href,'tel:+34670042626');assert.match(north.wa.href,/wa.me\/34670042626/);north.change('madrid');assert.equal(north.call.href,'tel:+34614789945');assert.match(north.wa.href,/wa.me\/34614789945/);
const madrid=run('madrid');assert.equal(madrid.call.href,'tel:+34614789945');madrid.change('norte');assert.equal(madrid.call.href,'tel:+34670042626');
console.log('PASS: initial North/Madrid contacts and bidirectional zone changes.');
{
 const events={},field={value:'',dataset:{municipality:'Zalla',province:'bizkaia'},removeAttribute:k=>events.removed=k,focus:()=>events.focus=true};
 const town={value:'Zalla',addEventListener:(type,fn)=>events.input=fn},province={value:'bizkaia',addEventListener:(type,fn)=>events.change=fn};
 const link={dataset:{nucleusChoice:'ARANGUREN'},addEventListener:(type,fn)=>events.choose=fn};
 const document={body:{dataset:{zone:'norte'}},querySelector:s=>({'#form-nucleus':field,'#form-town':town,'#form-province':province}[s]||null),querySelectorAll:s=>s==='[data-nucleus-choice]'?[link]:[]};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document});
 events.choose();assert.equal(field.value,'ARANGUREN');assert.equal(town.value,'Zalla');assert.equal(events.focus,true);
 town.value='Madrid';events.input();assert.equal(field.value,'');assert.equal(events.removed,'list');events.choose();assert.equal(field.value,'');
 console.log('PASS: reviewed residential choice preserves municipality and clears stale suggestions on location changes.');
}
{
 const cards=['senal','acceso','red'].map((group,i)=>({id:['antenas-tdt','control-accesos','domotica-shelly'][i],dataset:{serviceGroup:group},hidden:false}));
 const filters=['todos','senal','acceso','red'].map(group=>({dataset:{serviceFilter:group},attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(event,fn){this.click=fn;}}));
 const grid={querySelectorAll:()=>cards},handlers={};
 const window={location:{hash:''},addEventListener:(type,fn)=>(handlers[type]||=[]).push(fn)};
 const document={body:{dataset:{zone:'norte'}},querySelector:s=>s==='#servicios-locales'?grid:null,querySelectorAll:s=>s==='[data-service-filter]'?filters:[]};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document,window});
 filters[2].click();assert.deepEqual(cards.map(c=>c.hidden),[true,false,true]);assert.equal(filters[2].attrs['aria-pressed'],'true');
 filters[3].click();assert.deepEqual(cards.map(c=>c.hidden),[true,true,false]);
 window.location.hash='#antenas-tdt';handlers.hashchange.forEach(fn=>fn());assert(cards.every(c=>!c.hidden));assert.equal(filters[0].attrs['aria-pressed'],'true');
 console.log('PASS: local filters, pressed states and anchor navigation reveal the requested service.');
}
// A local service choice must keep locality/province and update only the service.
{
 let click,change;
 const select={value:'Antenas TDT',options:[{value:'Antenas TDT'},{value:'Domótica con Shelly'},{value:'Iluminación LED y sensores'},{value:'Cámaras CCTV para casas, garajes y fincas'},{value:'Alarmas para viviendas, garajes y fincas'}],dispatchEvent:event=>change=event.type};
 const link={dataset:{serviceChoice:'Domótica con Shelly'},addEventListener:(event,fn)=>click=fn};
 const document={body:{dataset:{zone:'madrid'}},querySelector:s=>s==='#form-service'?select:null,querySelectorAll:s=>s==='[data-service-choice]'?[link]:[]};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document,Event:class{constructor(type){this.type=type;}}});
 click();assert.equal(select.value,'Domótica con Shelly');assert.equal(change,'change');assert.equal(document.body.dataset.zone,'madrid');
 link.dataset.serviceChoice='Iluminación LED y sensores';click();assert.equal(select.value,'Iluminación LED y sensores');assert.equal(document.body.dataset.zone,'madrid');
 for(const title of ['Cámaras CCTV para casas, garajes y fincas','Alarmas para viviendas, garajes y fincas']){link.dataset.serviceChoice=title;click();assert.equal(select.value,title);assert.equal(document.body.dataset.zone,'madrid');}
 console.log('PASS: local service choices preserve zone and select Shelly or LED lighting without sending a message.');
}
// Run the actual form handler without opening or sending WhatsApp messages.
function submitForm(province,valid=true,trap='',tv={}){
 const handlers={},changes={},destination={},town={value:'Carabanchel'},p={value:province,options:[{text:province==='madrid'?'Madrid':'La Rioja'}],selectedIndex:0,addEventListener:(k,f)=>changes[k]=f};
 const fields={nucleus:'Zona de prueba',province,town:town.value,service:'Reparación de videoportero',property:'Vivienda individual',name:'Prueba',phone:'600000000',message:'No abre la cerradura',...tv};
 const form={reportValidity:()=>valid,elements:{website:{value:trap}},addEventListener:(k,f)=>handlers[k]=f,querySelector:s=>({'#form-province':p,'#form-town':town,'#form-destination':destination}[s]||null)};
 const document={body:{dataset:{zone:'norte'}},querySelector:s=>s==='#contact-form'?form:null,querySelectorAll:()=>[]};
 let target;
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document,FormData:class{get(k){return fields[k]}},window:{location:{assign:u=>target=u}}});
 handlers.submit({preventDefault(){}});return {target,destination};
}
for(const [province,phone] of [['madrid','34614789945'],['la-rioja','34670042626']]){
 const r=submitForm(province);assert.ok(r.target.startsWith('https://wa.me/'+phone+'?text='));const message=decodeURIComponent(r.target.split('?text=')[1]);assert.match(message,/Reparación de videoportero/);assert.match(message,/Vivienda individual/);assert.match(message,/No abre la cerradura/);assert.match(message,/Núcleo o barrio: Zona de prueba/);
}
assert.equal(submitForm('madrid',false).target,undefined);assert.equal(submitForm('madrid',true,'bot').target,undefined);
console.log('PASS: form routing, accented message fields, validation and honeypot. No message sent.');
// Optional diagnostic fields must reach the right zone without replacing location.
for(const [province,phone] of [['madrid','34614789945'],['bizkaia','34670042626']]){
 const result=submitForm(province,true,'',{service:'Antenas TDT',channels:'Telecinco y Antena 3',timing:'Por la noche',tv_scope:'También les pasa a otros vecinos'});
 assert.ok(result.target.startsWith('https://wa.me/'+phone+'?text='));
 const message=decodeURIComponent(result.target.split('?text=')[1]);
 for(const line of ['Canales afectados: Telecinco y Antena 3','Cuándo ocurre: Por la noche','Alcance del fallo: También les pasa a otros vecinos','Localidad: Carabanchel']) assert.ok(message.includes(line));
}
assert.ok(!decodeURIComponent(submitForm('madrid').target).includes('Canales afectados:'));
{
 let click;
 const details={open:false},link={addEventListener:(event,fn)=>click=fn};
 const document={body:{dataset:{zone:'madrid'}},querySelector:s=>s==='#tv-incident-fields'?details:null,querySelectorAll:s=>s==='[data-tv-incident]'?[link]:[]};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document});
 click();assert.equal(details.open,true);assert.equal(document.body.dataset.zone,'madrid');
}
console.log('PASS: TV enquiry details, optional empty values, local routing and diagnostic shortcut. No message sent.');
{
 const answer={tagName:'DETAILS',open:false},handlers={};
 const window={location:{hash:'#consulta-diseqc-multisatelite'},addEventListener:(event,fn)=>handlers[event]=fn};
 const document={body:{dataset:{zone:'norte'}},querySelector:s=>s==='#consulta-diseqc-multisatelite'?answer:null,querySelectorAll:()=>[]};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document,window});
 assert.equal(answer.open,true);answer.open=false;window.location.hash='#consulta-missing';handlers.hashchange();assert.equal(answer.open,false);
 window.location.hash='#consulta-%E0%A4%A';handlers.hashchange();assert.equal(answer.open,false);
 window.location.hash='#consulta-diseqc-multisatelite';handlers.hashchange();assert.equal(answer.open,true);
 console.log('PASS: technical deep links reveal only the matching answer and tolerate malformed hashes.');
}

// Changing province must not offer neighborhoods as independent municipalities.
(async()=>{
 let provinceChange;
 const options=[],province={value:'bizkaia',addEventListener:(event,fn)=>{if(event==='change')provinceChange=fn;}},town={value:'Bilbao'},list={replaceChildren(){options.length=0;},appendChild(option){options.push(option.value);}},destination={};
 const form={querySelector:s=>({'#form-province':province,'#form-town':town,'#form-town-list':list,'#form-destination':destination}[s]||null),addEventListener(){}};
 const document={body:{dataset:{zone:'norte'}},querySelector:s=>s==='#contact-form'?form:null,querySelectorAll:()=>[],createElement:()=>({})};
 const data=[{name:'Santurtzi',provinceSlug:'bizkaia',type:'municipality'},{name:'Mamariga (Santurtzi)',provinceSlug:'bizkaia',type:'urban_zone'},{name:'Madrid',provinceSlug:'madrid',type:'municipality'}];
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document,fetch:async()=>({ok:true,json:async()=>data})});
 await provinceChange();assert.deepEqual(options,['Santurtzi']);assert.equal(town.value,'');
 console.log('PASS: neighborhoods stay searchable but do not replace municipalities in the enquiry form.');
})().catch(error=>{console.error(error);process.exitCode=1;});

// Service-page searches retain the locality route and target its matching service.
(async()=>{
 const data=[
  {name:'Coslada',searchText:'Madrid',province:'Madrid',provinceSlug:'madrid',type:'municipality',url:'/madrid/coslada/'},
  {name:'Centro, Madrid',province:'Madrid',provinceSlug:'madrid',type:'district',url:'/madrid/distritos/centro/'},
  {name:'Valleaguado (Coslada)',searchText:'Madrid',province:'Madrid',provinceSlug:'madrid',type:'urban_zone',url:'/madrid/coslada/#zona-valleaguado'}
 ];
 for(const serviceAnchor of [undefined,'antenas-tdt','porteros-automaticos','videoporteros','unrecognized-service']){
  const handlers={},search={value:'',dataset:serviceAnchor===undefined?{}:{serviceAnchor},addEventListener:(event,fn)=>handlers[event]=fn};
  const results={children:[],replaceChildren(){this.children=[];},appendChild(child){this.children.push(child);}},status={};
  const document={body:{dataset:{zone:'madrid'}},querySelector:s=>({'#town-search':search,'#town-results':results,'#search-status':status}[s]||null),querySelectorAll:()=>[],createElement:()=>({children:[],appendChild(child){this.children.push(child);}})};
  vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document,fetch:async()=>({ok:true,json:async()=>data})});
  search.value='Madrid';await handlers.input();
  const urls=results.children.map(li=>li.children[0].href);
  const active=['antenas-tdt','porteros-automaticos','videoporteros'].includes(serviceAnchor);
  assert.deepEqual(urls,active?['/madrid/coslada/#'+serviceAnchor,'/madrid/distritos/centro/#'+serviceAnchor,'/madrid/coslada/#'+serviceAnchor]:data.map(t=>t.url));
  assert.ok(urls.every(url=>!url.includes('?')));assert.match(status.textContent,/3 resultados/);
 }
 console.log('PASS: service search anchors preserve municipality/district routes, replace neighborhood anchors and leave ordinary or unknown contexts unchanged.');
})().catch(error=>{console.error(error);process.exitCode=1;});
