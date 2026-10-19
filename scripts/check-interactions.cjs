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
// A local service choice must keep locality/province and update only the service.
{
 let click,change;
 const select={value:'Antenas TDT',options:[{value:'Antenas TDT'},{value:'Domótica con Shelly'}],dispatchEvent:event=>change=event.type};
 const link={dataset:{serviceChoice:'Domótica con Shelly'},addEventListener:(event,fn)=>click=fn};
 const document={body:{dataset:{zone:'madrid'}},querySelector:s=>s==='#form-service'?select:null,querySelectorAll:s=>s==='[data-service-choice]'?[link]:[]};
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document,Event:class{constructor(type){this.type=type;}}});
 click();assert.equal(select.value,'Domótica con Shelly');assert.equal(change,'change');assert.equal(document.body.dataset.zone,'madrid');
 console.log('PASS: local service choices preserve zone and select Shelly without sending a message.');
}
// Run the actual form handler without opening or sending WhatsApp messages.
function submitForm(province,valid=true,trap=''){
 const handlers={},changes={},destination={},town={value:'Carabanchel'},p={value:province,options:[{text:province==='madrid'?'Madrid':'La Rioja'}],selectedIndex:0,addEventListener:(k,f)=>changes[k]=f};
 const fields={province,town:town.value,service:'Reparación de videoportero',property:'Vivienda individual',name:'Prueba',phone:'600000000',message:'No abre la cerradura'};
 const form={reportValidity:()=>valid,elements:{website:{value:trap}},addEventListener:(k,f)=>handlers[k]=f,querySelector:s=>({'#form-province':p,'#form-town':town,'#form-destination':destination}[s]||null)};
 const document={body:{dataset:{zone:'norte'}},querySelector:s=>s==='#contact-form'?form:null,querySelectorAll:()=>[]};
 let target;
 vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/app.js','utf8'),{document,FormData:class{get(k){return fields[k]}},window:{location:{assign:u=>target=u}}});
 handlers.submit({preventDefault(){}});return {target,destination};
}
for(const [province,phone] of [['madrid','34614789945'],['la-rioja','34670042626']]){
 const r=submitForm(province);assert.ok(r.target.startsWith('https://wa.me/'+phone+'?text='));const message=decodeURIComponent(r.target.split('?text=')[1]);assert.match(message,/Reparación de videoportero/);assert.match(message,/Vivienda individual/);assert.match(message,/No abre la cerradura/);
}
assert.equal(submitForm('madrid',false).target,undefined);assert.equal(submitForm('madrid',true,'bot').target,undefined);
console.log('PASS: form routing, accented message fields, validation and honeypot. No message sent.');
