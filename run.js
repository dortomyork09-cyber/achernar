/* Achernar — 코드 카드 실행 (JavaScript · Python · HTML)
   코드는 출처가 없는(sandbox) iframe 안의 Worker에서 돌아가서, 내 캔버스 데이터에 접근할 수 없어요. */
const Run=(()=>{
let fr=null,ready=null,seq=0;const wait=new Map();
const PYO='https://cdn.jsdelivr.net/pyodide/v0.27.2/full/';
function kind(it){const l=String(it.lang||'').toLowerCase().trim(),c=String(it.code||'');
  if(/^(py|python|python3|파이썬)$/.test(l))return 'py';if(/^(js|javascript|자바스크립트|node)$/.test(l))return 'js';if(/^(html|htm|웹)$/.test(l))return 'html';
  if(/^\s*<(!doctype|html|div|body|h1|p|style|script)/i.test(c))return 'html';if(/^\s*(def |import |print\(|for .+ in .+:|from \w+ import)/m.test(c))return 'py';return 'js'}
const RUNNER=`<!doctype html><script>
const PYO=${JSON.stringify(PYO)};let wk={};
const W={js:\`self.onmessage=e=>{const out=[];const fmt=v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch(x){return String(v)}};
 const send=(k,a)=>postMessage({k,t:a.map(fmt).join(' ')});console.log=(...a)=>send('log',a);console.info=console.log;console.warn=(...a)=>send('warn',a);console.error=(...a)=>send('err',a);
 try{const r=(0,eval)(e.data);if(r!==undefined)send('ret',[r]);postMessage({k:'done'})}catch(x){postMessage({k:'err',t:String(x&&x.name?x.name+': '+x.message:x)});postMessage({k:'done'})}}\`,
 py:\`importScripts(PYO+'pyodide.js');let py=null;const boot=loadPyodide({indexURL:PYO}).then(p=>{py=p;p.setStdout({batched:t=>postMessage({k:'log',t})});p.setStderr({batched:t=>postMessage({k:'err',t})});postMessage({k:'ready'})});
 self.onmessage=async e=>{await boot;try{await py.loadPackagesFromImports(e.data);const r=await py.runPythonAsync(e.data);if(r!==undefined&&r!==null)postMessage({k:'ret',t:String(r)})}catch(x){postMessage({k:'err',t:String(x.message||x).split('\\\\n').slice(-4).join('\\\\n')})}postMessage({k:'done'})}\`};
function mk(l){const src=(l==='py'?'const PYO='+JSON.stringify(PYO)+';':'')+W[l];const w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));w.onmessage=e=>parent.postMessage({id:w._id,l,...e.data},'*');w.onerror=e=>{parent.postMessage({id:w._id,l,k:'err',t:e.message||'오류'},'*');parent.postMessage({id:w._id,l,k:'done'},'*')};return w}
onmessage=e=>{const d=e.data;if(d.kill){if(wk[d.l]){wk[d.l].terminate();wk[d.l]=null}return}if(!wk[d.l])wk[d.l]=mk(d.l);wk[d.l]._id=d.id;wk[d.l].postMessage(d.code)};
parent.postMessage({k:'boot'},'*');<\/script>`;
function ensure(){if(ready)return ready;ready=new Promise(res=>{fr=document.createElement('iframe');fr.setAttribute('sandbox','allow-scripts');fr.style.cssText='position:absolute;width:0;height:0;border:0;left:-9999px';fr.srcdoc=RUNNER;
  addEventListener('message',e=>{if(e.source!==fr.contentWindow)return;const d=e.data||{};if(d.k==='boot')return res();const w=wait.get(d.id);if(w)w(d)});document.body.appendChild(fr)});return ready}
async function exec(it,onLine){const l=kind(it);if(l==='html')return {l,html:true};await ensure();const id=++seq,lines=[];let to=0,first=true;
  return new Promise(res=>{const fin=(why)=>{clearTimeout(to);wait.delete(id);if(why)lines.push({k:'err',t:why});res({l,lines})};
    const arm=ms=>{clearTimeout(to);to=setTimeout(()=>{fr.contentWindow.postMessage({kill:1,l},'*');fin(l==='py'&&first?'Python을 준비하지 못했어요 (인터넷 연결을 확인해 주세요)':'시간이 너무 오래 걸려서 멈췄어요 (무한 반복이 있는지 확인해 보세요)')},ms)};
    wait.set(id,d=>{if(d.k==='ready'){first=false;arm(15000);return}if(d.k==='done')return fin();first=false;lines.push({k:d.k,t:d.t});if(lines.length>400){fr.contentWindow.postMessage({kill:1,l},'*');return fin('출력이 너무 많아서 멈췄어요')}onLine&&onLine(lines)});
    arm(l==='py'?60000:8000);fr.contentWindow.postMessage({id,l,code:String(it.code||'')},'*')})}
const LBL={js:'JavaScript',py:'Python',html:'HTML'};
addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){const ed=document.activeElement;const c=ed&&ed.closest&&ed.closest('.card');if(c&&ed.classList.contains('code')){e.preventDefault();e.stopPropagation();c.querySelector('[data-act=crun]')?.click()}}},true);
return {exec,kind,LBL};
})();
