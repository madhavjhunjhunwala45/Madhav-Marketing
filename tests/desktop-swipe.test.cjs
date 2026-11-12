const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../website.js'),'utf8');
const start=code.indexOf('window.MadhavSwipe='),end=code.indexOf(';const catalogue=',start);
assert(start>=0&&end>start);const c={window:{}};vm.createContext(c);vm.runInContext(code.slice(start,end+1),c);
function setup(){const listeners={},result={previous:0,next:0,prevented:0,moves:[]};const stage={clientWidth:500,classList:{add(){},remove(){}},addEventListener(type,fn){listeners[type]=fn;},removeEventListener(){},setPointerCapture(){},releasePointerCapture(){}};const api=c.window.MadhavSwipe(stage,()=>result.previous++,()=>result.next++,{stableWheel:true,onMove:(dx,type)=>result.moves.push([dx,type])});const wheel=(t,x,y=0,extra={})=>listeners.wheel({timeStamp:t,deltaX:x,deltaY:y,deltaMode:0,cancelable:true,preventDefault(){result.prevented++;},...extra});return{listeners,result,api,wheel};}
let t=setup();t.wheel(0,70);t.wheel(100,3);t.wheel(300,30);t.wheel(310,35);assert.equal(t.result.next,1,'Momentum tail must not select a second product');
t=setup();t.wheel(0,70);t.wheel(150,-65);assert.equal(t.result.next,1);assert.equal(t.result.previous,0,'Trackpad rebound must not reverse a committed gesture');t.wheel(500,-70);assert.equal(t.result.previous,1,'A fresh gesture after the quiet interval remains responsive');
t=setup();t.wheel(0,0,60);t.wheel(150,1,3);t.wheel(300,30);t.wheel(310,40);assert.equal(t.result.next,0);assert.equal(t.result.prevented,0,'Vertical scrolling stays native even with a sideways tail');
t=setup();t.wheel(0,70);const prevented=t.result.prevented;t.wheel(80,0,100);assert.equal(t.result.prevented,prevented,'Switching to vertical scroll must bypass an active horizontal lock');assert.equal(t.result.next,1);
t=setup();for(let i=0;i<20;i++)t.wheel(i*10,3);assert.equal(t.result.next,1,'Slow horizontal input accumulates reliably');
t=setup();t.wheel(0,70,0,{ctrlKey:true});t.wheel(20,70,0,{metaKey:true});assert.equal(t.result.next,0);assert.equal(t.result.prevented,0,'Browser zoom shortcuts remain native');
t=setup();t.wheel(0,0,70,{shiftKey:true});assert.equal(t.result.next,1,'Shift+wheel works on a mouse');
t=setup();t.wheel(0,70);t.api.reset();t.wheel(10,70);assert.equal(t.result.next,2,'Reset clears the gesture lock');
t=setup();t.listeners.pointerdown({isPrimary:true,pointerType:'mouse',button:0,pointerId:1,clientX:100,clientY:50});t.listeners.pointermove({pointerType:'mouse',buttons:1,pointerId:1,clientX:30,clientY:50});assert.deepEqual(t.result.moves[0],[-70,'mouse']);t.listeners.pointerup({pointerId:1,clientX:30,clientY:50,timeStamp:100});assert.equal(t.result.next,1);
t=setup();t.listeners.pointerdown({isPrimary:true,pointerType:'touch',pointerId:2,clientX:100,clientY:50});t.listeners.pointermove({pointerType:'touch',pointerId:2,clientX:103,clientY:150});t.listeners.pointerup({pointerId:2,clientX:103,clientY:150,timeStamp:100});assert.equal(t.result.next,0,'Mobile vertical scrolling is preserved');
assert(code.includes('stableWheel:true'),'The range must opt into the stable gesture path');
console.log('Passed: desktop trackpad momentum, rebound, fresh gestures, slow input, vertical scrolling, browser zoom, Shift+wheel, reset, mouse drag feedback and unchanged mobile vertical gestures.');
