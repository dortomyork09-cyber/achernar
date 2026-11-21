/* Achernar — 제출 모드 (캔버스 → A4 보고서) · 참고 자료 자동 정리 */
const Submit=(()=>{
const A=()=>Canvas.api;
const strip=h=>{const d=document.createElement('div');d.innerHTML=String(h||'');return d.textContent.replace(/\s+/g,' ').trim()};
const byPos=(a,b)=>(Math.round(a.y/120)-Math.round(b.y/120))||(a.x-b.x);
function box(it){return A().box(it.id)||{x:it.x,y:it.y,w:it.w||200,h:it.h||100}}
function inFrame(it,f){const b=box(it),c=box(f);const cx=b.x+b.w/2,cy=b.y+b.h/2;return cx>c.x&&cx<c.x+c.w&&cy>c.y&&cy<c.y+c.h}
function hostOf(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return ''}}
/* 참고 자료 */
function refs(){const c=A().C();const L=(c.items||[]).filter(i=>i.type==='link'&&i.url).sort(byPos).map(i=>({t:strip(i.title)||hostOf(i.url),u:i.url,h:hostOf(i.url),d:i.at||i.ct||Date.now()}));if(typeof Src!=='undefined')Src.webRefs().forEach(r=>{if(!L.some(x=>x.u===r.u))L.push(r)});return L}
function refsHTML(list){return list.length?`<ol>${list.map(r=>`<li>${esc(r.t)}. ${esc(r.h)}. <span style="color:#555">${esc(r.u)}</span> (${new Date(r.d).toLocaleDateString('ko-KR')} 확인)</li>`).join('')}</ol>`:''}
function makeRefs(){const L=refs();if(!L.length)return toast('링크 카드가 없어요 · 자료 주소를 캔버스에 붙여 넣으면 링크 카드가 돼요',{ms:3200});const a=A();a.push();const[x,y]=a.center();const n=a.mk('doc',x-300,y-160,{w:600,text:`<h2>참고 자료</h2>${refsHTML(L)}`});a.render();a.setSel([n.id]);a.save();toast(`링크 ${L.length}개로 참고 자료 문서를 만들었어요`)}
/* 마인드맵 → 목록 */
function mindList(root,c,seen=new Set()){seen.add(root.id);const kids=(c.links||[]).filter(l=>l.k==='mm'&&l.a===root.id).map(l=>c.items.find(i=>i.id===l.b)).filter(x=>x&&!seen.has(x.id));
  return `<li>${esc(strip(root.text))}${kids.length?`<ul>${kids.map(k=>mindList(k,c,seen)).join('')}</ul>`:''}</li>`}
async function imgData(it){try{const b=await tx('blobs','readonly',s=>s.get(it.blob));if(!b)return '';return await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)})}catch(e){return ''}}
async function cardHTML(it,c,used){used.add(it.id);switch(it.type){
  case 'doc':return `<div class="doc">${it.text||''}</div>`;
  case 'text':case 'sticky':case 'shape':return strip(it.text)?`<p>${it.text}</p>`:'';
  case 'node':{const isRoot=!(c.links||[]).some(l=>l.k==='mm'&&l.b===it.id);if(!isRoot)return '';const walk=n=>{used.add(n.id);(c.links||[]).filter(l=>l.k==='mm'&&l.a===n.id).forEach(l=>{const k=c.items.find(i=>i.id===l.b);if(k&&!used.has(k.id))walk(k)})};walk(it);return `<ul class="mm">${mindList(it,c)}</ul>`}
  case 'check':return `<p><b>${esc(it.title||'할 일')}</b></p><ul class="chk">${(it.checks||[]).filter(x=>x.t).map(x=>`<li>${x.d?'☑':'☐'} ${esc(x.t)}</li>`).join('')}</ul>`;
  case 'table':return `<table>${(it.rows||[]).map((r,i)=>`<tr>${r.map(v=>i===0?`<th>${esc(strip(v))}</th>`:`<td>${esc(strip(v))}</td>`).join('')}</tr>`).join('')}</table>`;
  case 'image':{const u=await imgData(it);return u?`<figure><img src="${u}">${it.cap?`<figcaption>${esc(strip(it.cap))}</figcaption>`:''}</figure>`:''}
  case 'chart':{try{const b=await A().png(box(it),2);const u=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)});return `<figure><img src="${u}"></figure>`}catch(e){return ''}}
  case 'code':return `<pre>${esc(it.code||'')}</pre>`;
  default:return ''}}
async function build(opt){const c=A().C(),m=One.main();const items=(c.items||[]).slice();const frames=items.filter(i=>i.type==='frame'&&!i.slide).sort(byPos);const used=new Set();
  const who=(()=>{try{return localStorage.getItem('ach-name')||''}catch(e){return ''}})();let html=`<header class="cover"><h1>${esc(opt.title||m.title||'보고서')}</h1><p>${esc(opt.who||who)}${opt.who||who?' · ':''}${new Date().toLocaleDateString('ko-KR')}</p></header>`;
  const docs=items.filter(i=>i.type==='doc'&&!/^\s*참고 자료/.test(strip(i.text))).sort(byPos);
  if(docs.length&&opt.docs!==false){for(const d of docs){html+=await cardHTML(d,c,used)}}
  if(opt.canvas!==false){let sec='';const skip=i=>i.type==='frame'||i.type==='link'||used.has(i.id)||i.slide;
    for(const f of frames){const inside=items.filter(i=>!skip(i)&&inFrame(i,f)).sort(byPos);let body='';for(const it of inside)body+=await cardHTML(it,c,used);if(body.trim())sec+=`<section><h2>${esc(strip(f.text)||'구역')}</h2>${body}</section>`}
    const rest=items.filter(i=>!skip(i)&&!frames.some(f=>inFrame(i,f))&&!(c.items.filter(x=>x.slide).some(s=>inFrame(i,s)))).sort(byPos);let body='';for(const it of rest)body+=await cardHTML(it,c,used);if(body.trim())sec+=`<section><h2>그 밖의 메모</h2>${body}</section>`;
    if(sec)html+=docs.length?`<h2 class="ap">부록 · 캔버스 정리</h2>${sec}`:sec}
  if(opt.refs!==false){const L=refs();if(L.length)html+=`<section><h2>참고 자료</h2>${refsHTML(L)}</section>`}
  if(typeof Src!=='undefined'){const R=Src.rows();if(R.length)html+=`<section><h2>AI 활용 내역</h2>${Src.tableHTML(R)}</section>`}
  return html}
const CSS=`@page{size:A4;margin:20mm 18mm}body{font:11pt/1.75 "Malgun Gothic","Noto Sans KR",sans-serif;color:#111;margin:0}h1{font-size:22pt;margin:0 0 6px}h2{font-size:14pt;margin:22px 0 8px;padding-bottom:4px;border-bottom:1px solid #ccc}h3{font-size:12pt}.cover{text-align:center;padding:50px 0 30px;border-bottom:2px solid #141C33;margin-bottom:24px}.cover p{color:#555}
table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #999;padding:5px 8px;text-align:left;font-size:10pt}th{background:#eee}figure{margin:10px 0;text-align:center;page-break-inside:avoid}figure img{max-width:100%;max-height:110mm}figcaption{font-size:9pt;color:#555}pre{background:#f4f4f4;padding:8px;font-size:9pt;white-space:pre-wrap}ul.chk{list-style:none;padding-left:4px}section{page-break-inside:auto}.ap{margin-top:36px}.doc h1{font-size:18pt}`;
async function open(){const m=One.main();const docs=(A().C().items||[]).some(i=>i.type==='doc');
  modal({title:'제출용으로 만들기',cls:'mid',html:`<p class="note" style="margin:0 0 12px">캔버스를 A4 보고서로 정리해요. 문서 카드는 본문으로, 프레임(구역)은 제목이 붙은 단락으로, 링크 카드는 참고 자료로 들어가요.</p>
   <label class="sbf"><small>제목</small><input class="inp" data-t value="${esc(m.title||'')}"></label><label class="sbf"><small>이름 · 학번 (표지에 들어가요)</small><input class="inp" data-w placeholder="예) 2학년 3반 12번 김민준" value="${esc((()=>{try{return localStorage.getItem('ach-who')||''}catch(e){return ''}})())}"></label>
   <div class="sbo">${docs?'<label><input type="checkbox" data-docs checked> 문서 카드를 본문으로</label>':''}<label><input type="checkbox" data-cv checked> 캔버스 구역 정리 넣기</label><label><input type="checkbox" data-refs checked> 참고 자료 넣기 (링크 ${refs().length}개)</label></div>
   <div class="sbb"><button class="btn" data-pv>미리 보기</button><button class="btn" data-hwp>한글(HWP)로 저장</button><button class="btn pr" data-pdf>PDF로 저장 · 인쇄</button></div><div class="sbp" hidden><iframe></iframe></div>`,
   onOpen:()=>{const B=document.querySelector('#mbody');const opt=()=>{const w=B.querySelector('[data-w]').value.trim();try{localStorage.setItem('ach-who',w)}catch(e){}return{title:B.querySelector('[data-t]').value.trim(),who:w,docs:B.querySelector('[data-docs]')?B.querySelector('[data-docs]').checked:false,canvas:B.querySelector('[data-cv]').checked,refs:B.querySelector('[data-refs]').checked}};
     B.querySelector('[data-pv]').onclick=async()=>{const h=await build(opt());const P=B.querySelector('.sbp');P.hidden=false;P.querySelector('iframe').srcdoc=`<!doctype html><meta charset="utf-8"><style>${CSS}body{padding:24px;max-width:720px;margin:auto}</style>${h}`};
     B.querySelector('[data-pdf]').onclick=async()=>{const o=opt(),h=await build(o);closeModal();DocPPT.printHTML(h,CSS,o.title||m.title||'보고서')};
     B.querySelector('[data-hwp]').onclick=async()=>{const o=opt(),h=await build(o);toast('한글 파일을 만드는 중…',{ms:2500});Hwp.toHwp(h,o.title||m.title||'보고서')}}})}
return {open,makeRefs,refs,build,moreMenu:()=>[{t:'제출용으로 만들기 (A4 보고서)',i:'page',fn:open},{t:'참고 자료 자동 정리',i:'link',fn:makeRefs}]};
})();
