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
for(const withSuggestions of [true,false]){
 const events={},attributes=withSuggestions?{list:'form-nuclei'}:{};
 const field={value:'',dataset:{municipality:'Zalla',province:'bizkaia'},getAttribute:key=>attributes[key]??null,setAttribute:(key,value)=>attributes[key]=value,removeAttribute:key=>{delete attributes[key];},focus:()=>events.focus=true};
 const town={value:'Zalla',addEventListener:(type,fn)=>events.input=fn},province={value:'bizkaia',addEventListener:(type,fn)=>events.change=fn};
 const link={dataset:{nucleusChoice:'ARANGUREN'},addEventListener:(type,fn)=>events.choose=fn};
 const document={body:{dataset:{zone:'norte'}},querySelector:s=>({'#form-nucleus':field,'#form-town':town,'#form-province':province}[s]||null),querySelectorAll:s=>s==='[data-nucleus-choice]'&&withSuggestions?[link]:[]};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document});
 if(withSuggestions){events.choose();assert.equal(field.value,'ARANGUREN');assert.equal(town.value,'Zalla');assert.equal(events.focus,true);}
 field.value='Detalle de Zalla';events.input();assert.equal(field.value,'Detalle de Zalla','an unchanged locality must preserve its address detail');
 town.value='Madrid';events.input();assert.equal(field.value,'');assert.equal(attributes.list,undefined);
 if(withSuggestions){events.choose();assert.equal(field.value,'');}
 field.value='Detalle de otro municipio';town.value='Zalla';events.input();
 assert.equal(field.value,'','returning must discard the other municipality address detail');
 assert.equal(attributes.list,withSuggestions?'form-nuclei':undefined,'restore only a datalist that existed initially');
 if(withSuggestions){events.choose();assert.equal(field.value,'ARANGUREN');}
 province.value='madrid';events.change();assert.equal(field.value,'');assert.equal(attributes.list,undefined);
 field.value='Detalle de otra provincia';events.input();assert.equal(field.value,'');assert.equal(attributes.list,undefined,'matching town text alone must not restore suggestions');
 field.value='Otro detalle';province.value='bizkaia';events.change();
 assert.equal(field.value,'');assert.equal(attributes.list,withSuggestions?'form-nuclei':undefined);
}
console.log('PASS: residential choices preserve municipality; returning to the original town/province restores only existing suggestions and clears foreign address details.');
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

// Follow the actual generated local/guide/service pages with tab-scoped storage.
// Only public locality identifiers may survive navigation; enquiry data must not.
(async()=>{
 const path=require('node:path'),root=path.join(__dirname,'..','dist'),source=fs.readFileSync(__dirname+'/../assets/app.js','utf8');
 const towns=JSON.parse(fs.readFileSync(path.join(root,'assets/localidades.json'),'utf8'));
 const storageKey='an24-location-v1';
 const decode=value=>value.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
 const attrs=text=>Object.fromEntries(Array.from(text.matchAll(/([a-z][a-z0-9-]*)(?:="([^"]*)")?/gi),match=>[match[1],decode(match[2]||'')]));
 const dataset=attributes=>Object.fromEntries(Object.entries(attributes).filter(([key])=>key.startsWith('data-')).map(([key,value])=>[key.slice(5).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase()),value]));
 const settle=()=>new Promise(resolve=>setImmediate(resolve));
 const store=()=>{
  const values=new Map();
  return {values,getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 };
 function page(route,storage,{delayed=false,blocked=false,failed=false}={}){
  const html=fs.readFileSync(path.join(root,route.slice(1),'index.html'),'utf8');
  const events=node=>Object.assign(node,{handlers:{},addEventListener(type,fn){(this.handlers[type]||=[]).push(fn);},dispatchEvent(event){return Promise.all((this.handlers[event.type]||[]).map(fn=>fn(event)));}});
  function select(id){
   const markup=html.match(new RegExp('<select[^>]*id="'+id+'"[^>]*>([\\s\\S]*?)</select>'))[1];
   const options=Array.from(markup.matchAll(/<option([^>]*)>([\s\S]*?)<\/option>/g),match=>{
    const attributes=attrs(match[1]),text=decode(match[2]);return {value:attributes.value===undefined?text:attributes.value,text,selected:'selected' in attributes};
   });
   const selected=options.findIndex(option=>option.selected),node=events({options,value:options[Math.max(0,selected)].value});
   Object.defineProperty(node,'selectedIndex',{get(){return options.findIndex(option=>option.value===this.value);}});
   return node;
  }
  const province=select('form-province'),service=select('form-service'),zone=select('contact-zone');
  const town=events({value:attrs(html.match(/<input[^>]*id="form-town"[^>]*>/)[0]).value||''});
  const nucleusMarkup=html.match(/<input[^>]*id="form-nucleus"[^>]*>/),nucleusAttributes=nucleusMarkup?attrs(nucleusMarkup[0]):null;
  const nucleus=nucleusAttributes?{value:'',dataset:dataset(nucleusAttributes),attributes:nucleusAttributes,getAttribute(key){return this.attributes[key]??null;},setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];}}:null;
  const message=events({value:'',placeholder:''}),name=events({value:''}),phone=events({value:''});
  const destination={},label={},list={children:[],replaceChildren(){this.children=[];},appendChild(child){this.children.push(child);}};
  const anchors=Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g),match=>{
   const attributes=attrs(match[1]);return {dataset:dataset(attributes),href:attributes.href,textContent:decode(match[2].replace(/<[^>]*>/g,'')),className:attributes.class||''};
  });
  const fields={'#form-province':province,'#form-town':town,'#form-town-list':list,'#form-destination':destination,'#form-service':service,'#form-message':message};
  if(nucleus)fields['#form-nucleus']=nucleus;
  const form=events({querySelector:selector=>fields[selector]||null,reportValidity:()=>Boolean(province.value&&town.value),elements:{website:{value:''}}});
  const document={body:{dataset:dataset(attrs(html.match(/<body\b[^>]*>/)[0]))},querySelector:selector=>({'#contact-form':form,'#contact-zone':zone,'#active-phone':label}[selector]||fields[selector]||null),querySelectorAll:selector=>selector==='[data-call]'?anchors.filter(a=>'call' in a.dataset):selector==='[data-whatsapp]'?anchors.filter(a=>'whatsapp' in a.dataset):[],createElement:()=>({})};
  let resolveFetch,target;
  const response={ok:!failed,json:async()=>towns},pending=delayed?new Promise(resolve=>resolveFetch=()=>resolve(response)):null;
  const window={location:{pathname:route,hash:'',assign:url=>target=url},addEventListener(){}};
  Object.defineProperty(window,'sessionStorage',{get(){if(blocked)throw Error('Storage disabled');return storage;}});
  const values=key=>({province:province.value,town:town.value,service:service.value,property:'Vivienda individual',name:name.value,phone:phone.value,message:message.value}[key]||'');
  vm.runInNewContext(source,{document,window,fetch:()=>pending||Promise.resolve(response),FormData:class{get(key){return values(key);}}});
  return {html,province,service,zone,town,nucleus,message,name,phone,form,anchors,destination,label,resolveFetch,get target(){return target;},async emit(node,type){await node.dispatchEvent({type,target:node});if(node!==form)await form.dispatchEvent({type,target:node});}};
 }
 function assertContacts(current,raw,minCalls=3){
  const calls=current.anchors.filter(a=>'call' in a.dataset),whatsapp=current.anchors.filter(a=>'whatsapp' in a.dataset);
  assert(calls.some(a=>a.className==='urgent-link'),'urgent header must follow contact routing');
  assert(calls.length>=minCalls,'all generic call links must follow contact routing');
  assert(calls.every(a=>a.href==='tel:+34'+raw));
  assert(whatsapp.every(a=>a.href.startsWith('https://wa.me/34'+raw+'?text=')));
 }
 const session=store();
 let current=page('/madrid/coslada/',session);assertContacts(current,'614789945');
 assert.equal(JSON.parse(session.getItem(storageKey)).path,'/madrid/coslada/');
 const localMessage=current.anchors.find(a=>'localMessage' in a.dataset);
 assert.equal(decodeURIComponent(localMessage.href.split('?text=')[1]),localMessage.dataset.message,'keep the original local button message once');
 current=page('/guias/portero-no-funciona/',session);await settle();assertContacts(current,'614789945');
 assert.equal(current.province.value,'madrid');assert.equal(current.town.value,'Coslada');assert.equal(current.service.value,'Porteros automáticos');
 current=page('/servicios/videoporteros/',session);await settle();assertContacts(current,'614789945');
 assert.equal(current.town.value,'Coslada');assert.equal(current.service.value,'Videoporteros','the destination service must win');
 current.name.value='Nombre de prueba';current.phone.value='600000000';current.message.value='Mi texto no se sustituye';
 await current.form.dispatchEvent({type:'submit',preventDefault(){}});
 assert(current.target.startsWith('https://wa.me/34614789945?text='));assert.match(decodeURIComponent(current.target),/Localidad: Coslada/);
 assert.deepEqual(Object.keys(JSON.parse(session.getItem(storageKey))).sort(),['path','province','version']);
 assert(!/Nombre de prueba|600000000|Mi texto/.test(session.getItem(storageKey)));
 for(const [choice,hint] of [['Porteros automáticos','audio'],['Videoporteros','imagen'],['Montaje de ventiladores de techo','ventilador'],['Antenas TDT','canales'],['Domótica con Shelly','Describe']]){
  current.service.value=choice;await current.emit(current.service,'change');assert(current.message.placeholder.includes(hint));assert.equal(current.message.value,'Mi texto no se sustituye');
 }
 current=page('/bizkaia/bilbao/',session);assertContacts(current,'670042626');assert.equal(current.town.value,'Bilbao');
 current=page('/servicios/videoporteros/',session);await settle();assertContacts(current,'670042626');assert.equal(current.town.value,'Bilbao');
 current=page('/madrid/distritos/carabanchel/',session);assertContacts(current,'614789945');
 current=page('/servicios/videoporteros/',session);await settle();assert.equal(current.town.value,'Carabanchel (Madrid capital)');assertContacts(current,'614789945');
 current.zone.value='norte';await current.zone.dispatchEvent({type:'change',target:current.zone});
 assert.equal(current.province.value,'');assert.equal(current.town.value,'');assertContacts(current,'670042626');assert.equal(session.getItem(storageKey),null);
 current.province.value='la-rioja';await current.emit(current.province,'change');current.town.value='Logroño';await current.emit(current.town,'input');await current.emit(current.town,'change');
 current=page('/comunidades/',session);await settle();assert.equal(current.province.value,'la-rioja');assert.equal(current.town.value,'Logroño');assertContacts(current,'670042626');
 current.zone.value='madrid';await current.zone.dispatchEvent({type:'change',target:current.zone});assert.equal(current.province.value,'madrid');assert.equal(current.town.value,'');assertContacts(current,'614789945');
 const fault=page('/servicios/porteros-automaticos/',session);await settle();
 const faultLink=fault.anchors.find(a=>a.dataset.message?.includes('no abre'));
 assert(faultLink);const prepared=decodeURIComponent(faultLink.href.split('?text=')[1]);assert(prepared.startsWith(faultLink.dataset.message));assert.equal((prepared.match(/Provincia: Madrid/g)||[]).length,1);
 await fault.zone.dispatchEvent({type:'change',target:fault.zone});assert.equal(decodeURIComponent(faultLink.href.split('?text=')[1]),prepared,'rerouting must not append context twice');
 for(const broken of ['{bad',JSON.stringify({version:1,province:'unknown',path:''}),JSON.stringify({version:1,province:'madrid',path:'https://example.test/'}),JSON.stringify({version:1,province:'madrid',path:'/madrid/not-a-real-place/'}),JSON.stringify({version:1,province:'madrid',path:'',name:'Do not store personal fields'})]){
  const invalid=store();invalid.setItem(storageKey,broken);const result=page('/servicios/videoporteros/',invalid);await settle();assert.equal(result.town.value,'');assert.equal(result.province.value,'');assert.equal(invalid.getItem(storageKey),null);assertContacts(result,'670042626');
 }
 const disabled=page('/madrid/coslada/',store(),{blocked:true});assertContacts(disabled,'614789945');
 const disabledGuide=page('/guias/portero-no-funciona/',store(),{blocked:true});assert.equal(disabledGuide.province.value,'');assertContacts(disabledGuide,'670042626');
 for(const [route,zone] of [['/madrid/coslada/','norte'],['/bizkaia/zalla/','madrid']]){
  const local=page(route,store());assert(local.nucleus&&local.nucleus.attributes.list);local.nucleus.value='Detalle anterior';
  local.zone.value=zone;await local.zone.dispatchEvent({type:'change',target:local.zone});
  assert.equal(local.town.value,'');assert.equal(local.nucleus.value,'');assert.equal(local.nucleus.attributes.list,undefined,'a zone change must detach stale residential suggestions');
 }
 const offlineStore=store();page('/madrid/coslada/',offlineStore);
 const offline=page('/guias/portero-no-funciona/',offlineStore,{failed:true});await settle();
 assert.equal(offline.province.value,'madrid');assert.equal(offline.town.value,'','failed lookup must not guess a locality');assertContacts(offline,'614789945');
 for(const failed of [false,true]){
 const delayedStore=store();page('/madrid/coslada/',delayedStore);
 const delayed=page('/servicios/videoporteros/',delayedStore,{delayed:true,failed});
 delayed.province.value='la-rioja';const change=delayed.emit(delayed.province,'change');delayed.town.value='Ubicación escrita';delayed.message.value='Consulta escrita';await delayed.emit(delayed.town,'input');
 delayed.resolveFetch();await change;await settle();assert.equal(delayed.province.value,'la-rioja');assert.equal(delayed.town.value,'Ubicación escrita');assert.equal(delayed.message.value,'Consulta escrita');assertContacts(delayed,'670042626');
 assert.equal(JSON.parse(delayedStore.getItem(storageKey)).path,'','unverified free text must not enter storage');
 }
 const sharedContext=store();page('/madrid/coslada/',sharedContext);
 for(const route of ['/marcas/fermax/','/','/cobertura/']){
  const shared=page(route,sharedContext);await settle();assert.equal(shared.province.value,'madrid');assert.equal(shared.town.value,'Coslada');assertContacts(shared,'614789945',route==='/'?2:3);
 }
 const directoryContext=store();page('/bizkaia/bilbao/',directoryContext);page('/madrid/distritos/',directoryContext);
 assert.equal(JSON.parse(directoryContext.getItem(storageKey)).province,'madrid');assert.equal(JSON.parse(directoryContext.getItem(storageKey)).path,'');
 const afterDirectory=page('/servicios/videoporteros/',directoryContext);await settle();assert.equal(afterDirectory.province.value,'madrid');assert.equal(afterDirectory.town.value,'');assertContacts(afterDirectory,'614789945');
 console.log('PASS: generated Madrid→guide→service routing; shared brand/home/coverage context; explicit North/Madrid/district-directory locations; voluntary zone/province changes clear stale address details; custom CTA messages; service hints; malformed/blocked storage; failed/delayed lookups and no personal fields stored.');
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
