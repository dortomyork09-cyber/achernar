/* Achernar — 한글(HWP·HWPX) 문서를 쪽 모양 그대로 보기 (rhwp, MIT) */
const Hwp=(()=>{
let mod=null,loading=null;const mem=new Map(),busy=new Set();
const isHwp=it=>it&&it.type==='file'&&/\.hwpx?$/i.test(it.name||'');
async function lib(){if(mod)return mod;if(loading)return loading;
  loading=(async()=>{toast('한글 뷰어를 불러오고 있어요 · 처음 한 번만 조금 걸려요',{ms:4000});
    let ctx=null,lf='';globalThis.measureTextWidth=(font,text)=>{if(!ctx)ctx=document.createElement('canvas').getContext('2d');if(font!==lf){ctx.font=font;lf=font}return ctx.measureText(text).width};
    const m=await import('./vendor/rhwp/rhwp.js');await m.default({module_or_path:'vendor/rhwp/rhwp_bg.wasm'});mod=m;return m})();
  try{return await loading}catch(e){loading=null;throw e}}
const getBlob=id=>tx('blobs','readonly',s=>s.get(id));
const putSvg=(id,pages)=>tx('blobs','readwrite',s=>s.put(new Blob([JSON.stringify(pages)],{type:'application/json'}),'hwpsvg:'+id));
async function pages(it){if(mem.has(it.blob))return mem.get(it.blob);
  try{const c=await getBlob('hwpsvg:'+it.blob);if(c){const p=JSON.parse(await c.text());mem.set(it.blob,p);return p}}catch(e){}
  const b=await getBlob(it.blob);if(!b)throw new Error('파일 없음');const m=await lib();
  const doc=new m.HwpDocument(new Uint8Array(await b.arrayBuffer()));const n=doc.pageCount(),out=[];for(let i=0;i<n;i++)out.push(doc.renderPageSvg(i));try{doc.free&&doc.free()}catch(e){}
  mem.set(it.blob,out);putSvg(it.blob,out).catch(()=>{});return out}
const url=svg=>URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
function inner(it){return `<div class="hwpv" data-hb="${esc(it.blob||'')}"><div class="hwph"><span class="hwpi">한</span><b>${esc(it.name)}</b><small data-hn></small></div><div class="hwpp"><div class="hwpl">한글 문서를 펼치는 중…</div></div><div class="hwpa"><button class="mini" data-act="hwpall">모든 쪽 보기</button><button class="mini" data-act="dl">내려받기</button></div></div>`}
function fill(root){(root||document).querySelectorAll('.hwpv:not([data-ok])').forEach(async el=>{const card=el.closest('.card');if(!card)return;const it=Canvas.api.I(card.dataset.id);if(!it||busy.has(it.id))return;busy.add(it.id);
  try{const p=await pages(it);el.dataset.ok=1;const box=el.querySelector('.hwpp');box.innerHTML=`<img alt="1쪽" src="${url(p[0]||'<svg xmlns="http://www.w3.org/2000/svg"/>')}">`;el.querySelector('[data-hn]').textContent=p.length+'쪽'}
  catch(e){console.warn(e);el.dataset.ok=1;el.querySelector('.hwpp').innerHTML=`<div class="hwpl">${/파일 없음/.test(e.message)?'이 기기에 파일이 없어요 (공유받은 문서는 아직 볼 수 없어요)':'이 한글 파일은 열지 못했어요 · 내려받아 한컴오피스로 열어 주세요'}</div>`}
  finally{busy.delete(it.id)}})}
async function viewAll(it){let p;try{p=await pages(it)}catch(e){return toast('한글 파일을 열지 못했어요')}
  const ov=document.createElement('div');ov.id='hwpov';ov.innerHTML=`<header><b>${esc(it.name)}</b><span>${p.length}쪽</span><button class="btn" data-z="-">−</button><button class="btn" data-z="+">+</button><button class="btn" data-x>닫기 (Esc)</button></header><div class="hwps">${p.map((s,i)=>`<figure><img loading="lazy" alt="${i+1}쪽" src="${url(s)}"><figcaption>${i+1} / ${p.length}</figcaption></figure>`).join('')}</div>`;
  document.body.appendChild(ov);let z=1;const S=ov.querySelector('.hwps');const set=()=>S.style.setProperty('--hz',z);
  ov.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{z=Math.max(.5,Math.min(2.5,z+(b.dataset.z==='+'?.25:-.25)));set()});
  const close=()=>{ov.remove();removeEventListener('keydown',k,true)};const k=e=>{if(e.key==='Escape'){e.stopPropagation();close()}};addEventListener('keydown',k,true);ov.querySelector('[data-x]').onclick=close}
return {isHwp,inner,fill,viewAll,pages};
})();
