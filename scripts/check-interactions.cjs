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
