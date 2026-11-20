/* Achernar — 저장 화면: 저장·메모·묶음이 놓이는 캔버스 */
const SaveBoard=(()=>{
let st=null;const CW=300,GAP=40,COLS=4,CH=CW*.75+92;
const fmt=t=>new Date(t).toLocaleString('ko-KR',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
const NC={y:'#FFF1A8',p:'#FFD6E2',m:'#CFF3E0',s:'#D6EBFF',l:'#E6DEFF'};const TAGS=[['','없음'],['#E5484D','빨강'],['#F5A524','주황'],['#30A46C','초록'],['#3E8EED','파랑'],['#8E4EC6','보라']];
async function meta(){try{return(await tx('kv','readonly',s=>s.get('sboard')))||{notes:[],groups:[]}}catch(e){return{notes:[],groups:[]}}}
async function putMeta(){await tx('kv','readwrite',s=>s.put({notes:st.notes,groups:st.groups},'sboard'))}
function place(l){const taken=[...l.filter(x=>x.bx!=null),...(st?.groups||[]).map(g=>({bx:g.x,by:g.y,w:g.w,h:g.h}))];let k=0;
  l.forEach(x=>{if(x.bx!=null)return;while(k<2000){const c=k%COLS,r=Math.floor(k/COLS);const px=c*(CW+GAP),py=r*(CH+GAP);k++;if(!taken.some(o=>px<o.bx+(o.w||CW)&&px+CW>o.bx&&py<o.by+(o.h||CH)&&py+CH>o.by)){x.bx=px;x.by=py;taken.push(x);break}}})}
async function open(){if(st)return;One.home();const el=document.createElement('div');el.id='osb';
  el.innerHTML=`<div class="osbbar"><button class="w3b" data-a="back">${ic('back')}캔버스로</button>
   <div class="osbnew"><input class="inp" id="osName" placeholder="이 저장의 이름 (예: 아이디어 1차)" maxlength="40"><button class="btn pr" data-a="save">${ic('save')}지금 저장</button></div><span class="sp"></span>
   <div class="osbsr">${ic('search')}<input id="osFind" placeholder="저장 찾기" aria-label="저장 찾기"></div>
   <button class="w3b" data-a="note" title="메모 붙이기 (N)">${ic('sticky')}<span>메모</span></button><button class="w3b" data-a="sort">${ic('grid')}<span>정리</span></button><button class="w3b" data-a="cmp">${ic('history')}<span>비교</span></button><button class="w3b" data-a="ex">${ic('dl')}<span>내보내기</span></button></div>
   <div class="osbvp"><div class="osbw"></div><div class="osbbox" hidden></div></div>
   <div class="osbzm"><button data-a="zo" aria-label="축소">−</button><button data-a="fit" class="zv">100%</button><button data-a="zi" aria-label="확대">+</button></div>
   <div class="osbhint">더블클릭: 불러오기 · Ctrl+드래그: 여러 개 선택 · Ctrl+G: 묶기 · Delete: 지우기 · 빈 곳 더블클릭: 메모</div>`;
  document.body.appendChild(el);document.body.classList.add('osbopen');const m=await meta();st={el,vp:el.querySelector('.osbvp'),w:el.querySelector('.osbw'),px:0,py:0,z:1,sel:new Set(),l:[],notes:m.notes||[],groups:m.groups||[],q:''};
  el.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,r=b.getBoundingClientRect();if(a==='back')close();if(a==='save')snapNow();if(a==='fit')fit(true);if(a==='zi')zoomBy(1.25);if(a==='zo')zoomBy(.8);if(a==='note')addNote();
    if(a==='cmp'){const ss=[...st.sel].filter(k=>k[0]==='s');close();Feat.compare(ss.length===1?ss[0].slice(2):undefined)}if(a==='ex')exportMenu(r.right-260,r.bottom+6);
    if(a==='sort')menu(r.right-240,r.bottom+6,[{t:'최신 순서로 줄 맞추기',i:'date',fn:()=>arrange('new')},{t:'오래된 순서로',i:'history',fn:()=>arrange('old')},{t:'이름 순서로',i:'list',fn:()=>arrange('name')},{t:'색 표시끼리 모으기',i:'color',fn:()=>arrange('tag')}])});
  const nm=el.querySelector('#osName');nm.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing)snapNow()};
  el.querySelector('#osFind').oninput=e=>{st.q=e.target.value.trim().toLowerCase();filter()};el.querySelector('#osFind').onkeydown=e=>{if(e.key==='Enter'){const c=st.w.querySelector('.osbc:not(.dim)');if(c)flyTo(c)}};
  bind();st.onK=key;addEventListener('keydown',st.onK,true);await render();fit(false)}
async function snapNow(){const nm=st.el.querySelector('#osName');const it=await One.snap(nm.value.trim());nm.value='';const l=await One.list();place(l);await One.put(l);await render();st.sel=new Set(['s:'+it.id]);paint();const c=st.w.querySelector(`[data-k="s:${it.id}"]`);c&&flyTo(c);toast(`‘${it.name}’ 저장 완료`)}
async function render(){const l=await One.list();const need=l.some(x=>x.bx==null);place(l);if(need)await One.put(l);st.l=l;
  const G=st.groups.map(g=>`<div class="osbg" data-k="g:${g.id}" style="left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px;--gc:${g.c||'#2563EB'}"><div class="osbgl" contenteditable="plaintext-only" spellcheck="false" data-gl="${g.id}">${esc(g.name||'묶음')}</div></div>`).join('');
  const N=st.notes.map(n=>`<div class="osbn" data-k="n:${n.id}" style="left:${n.x}px;top:${n.y}px;width:${n.w||220}px;background:${NC[n.c]||NC.y}"><div class="osbnh"></div><div class="osbnt" contenteditable="plaintext-only" data-nt="${n.id}" data-ph="메모">${esc(n.text||'')}</div></div>`).join('');
  const S=l.map(x=>`<div class="osbc" data-k="s:${x.id}" style="left:${x.bx}px;top:${x.by}px;width:${CW}px">${x.tag?`<i class="osbtag" style="background:${x.tag}"></i>`:''}
    <div class="osbth">${x.thumb?`<img src="${x.thumb}" alt="" draggable="false">`:ic('canvas')}</div>
    <div class="osbin"><b>${esc(x.name)}</b><small>${fmt(x.t)} · 카드 ${x.n}개</small>${x.memo?`<p>${esc(x.memo)}</p>`:''}</div>
    <div class="osbbt"><button class="btn sm pr" data-b="load">불러오기</button><button class="ib sm" data-b="ren" aria-label="이름 바꾸기">${ic('edit')}</button><button class="ib sm" data-b="more" aria-label="더 보기">${ic('more')}</button></div></div>`).join('');
  st.w.innerHTML=G+S+N+(l.length||st.notes.length?'':`<div class="osbempty">${ic('save')}<b>아직 저장한 게 없어요</b><span>위에서 이름을 쓰고 ‘지금 저장’을 누르면 여기 카드로 놓여요</span></div>`);
  st.w.querySelectorAll('[data-nt]').forEach(t=>{t.oninput=()=>{const n=st.notes.find(o=>o.id===t.dataset.nt);if(n){n.text=t.textContent;clearTimeout(st.nsv);st.nsv=setTimeout(putMeta,400)}}});
  st.w.querySelectorAll('[data-gl]').forEach(t=>{t.oninput=()=>{const g=st.groups.find(o=>o.id===t.dataset.gl);if(g){g.name=t.textContent;clearTimeout(st.nsv);st.nsv=setTimeout(putMeta,400)}};t.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();t.blur()}}});
  paint();filter();view()}
function filter(){const q=st.q;st.w.querySelectorAll('.osbc').forEach(c=>{const x=st.l.find(y=>'s:'+y.id===c.dataset.k);c.classList.toggle('dim',!!q&&!(x&&(x.name+' '+(x.memo||'')+' '+fmt(x.t)).toLowerCase().includes(q)))})}
function paint(){st.w.querySelectorAll('[data-k]').forEach(c=>c.classList.toggle('on',st.sel.has(c.dataset.k)))}
function view(){st.w.style.transform=`translate(${st.px}px,${st.py}px) scale(${st.z})`;st.vp.style.backgroundPosition=`${st.px}px ${st.py}px`;st.vp.style.backgroundSize=`${24*st.z}px ${24*st.z}px`;const zv=st.el.querySelector('.zv');if(zv)zv.textContent=Math.round(st.z*100)+'%'}
function zoomBy(k,mx,my){const r=st.vp.getBoundingClientRect();mx??=r.width/2;my??=r.height/2;const nz=Math.max(.15,Math.min(3,st.z*k));st.px=mx-(mx-st.px)*nz/st.z;st.py=my-(my-st.py)*nz/st.z;st.z=nz;view()}
function anim(){st.w.style.transition='transform .35s ease';setTimeout(()=>st&&(st.w.style.transition=''),400)}
function flyTo(c){const r=st.vp.getBoundingClientRect();st.z=Math.max(st.z,.9);st.px=r.width/2-(c.offsetLeft+c.offsetWidth/2)*st.z;st.py=r.height/2-(c.offsetTop+c.offsetHeight/2)*st.z;anim();view()}
function fit(an){const els=[...st.w.querySelectorAll('[data-k]')];const r=st.vp.getBoundingClientRect();if(!els.length){st.z=1;st.px=r.width/2;st.py=r.height/2-60;return view()}
  const x0=Math.min(...els.map(c=>c.offsetLeft)),y0=Math.min(...els.map(c=>c.offsetTop)),x1=Math.max(...els.map(c=>c.offsetLeft+c.offsetWidth)),y1=Math.max(...els.map(c=>c.offsetTop+c.offsetHeight));
  st.z=Math.max(.2,Math.min(1.1,(r.width-120)/(x1-x0),(r.height-170)/(y1-y0)));st.px=(r.width-(x1-x0)*st.z)/2-x0*st.z;st.py=(r.height-(y1-y0)*st.z)/2-y0*st.z+20;if(an)anim();view()}
const rectOf=c=>({x:c.offsetLeft,y:c.offsetTop,w:c.offsetWidth,h:c.offsetHeight});
function objOf(k){const[t,id]=[k[0],k.slice(2)];return t==='s'?st.l.find(x=>x.id===id):t==='n'?st.notes.find(x=>x.id===id):st.groups.find(x=>x.id===id)}
const getXY=(k,o)=>k[0]==='s'?[o.bx,o.by]:[o.x,o.y];const setXY=(k,o,x,y)=>{if(k[0]==='s'){o.bx=x;o.by=y}else{o.x=x;o.y=y}};
function bind(){const vp=st.vp;let M=null;const toW=(cx,cy)=>{const r=vp.getBoundingClientRect();return[(cx-r.left-st.px)/st.z,(cy-r.top-st.py)/st.z]};
  vp.addEventListener('pointerdown',e=>{if(e.button===2||e.target.closest('button'))return;const ed=e.target.closest('[contenteditable]');if(ed&&document.activeElement===ed)return;const c=e.target.closest('[data-k]');
    if(e.ctrlKey||e.metaKey||(e.shiftKey&&!c)){e.preventDefault();vp.setPointerCapture(e.pointerId);M={m:'box',sx:e.clientX,sy:e.clientY,base:new Set(st.sel),toggle:c?.dataset.k};return}
    if(c){e.preventDefault();document.activeElement?.blur?.();const k=c.dataset.k;if(e.shiftKey){st.sel.has(k)?st.sel.delete(k):st.sel.add(k)}else if(!st.sel.has(k))st.sel=new Set([k]);paint();vp.setPointerCapture(e.pointerId);
      const keys=new Set(st.sel);[...st.sel].filter(x=>x[0]==='g').forEach(gk=>{const gr=rectOf(st.w.querySelector(`[data-k="${gk}"]`));st.w.querySelectorAll('.osbc,.osbn').forEach(o=>{const q=rectOf(o);if(q.x>=gr.x-4&&q.y>=gr.y-4&&q.x+q.w<=gr.x+gr.w+4&&q.y+q.h<=gr.y+gr.h+4)keys.add(o.dataset.k)})});
      M={m:'drag',sx:e.clientX,sy:e.clientY,moved:false,ed:ed&&k[0]==='n'?ed:null,mv:[...keys].map(k=>{const o=objOf(k);const[x,y]=getXY(k,o);return{k,o,x,y,el:st.w.querySelector(`[data-k="${k}"]`)}}).filter(g=>g.o)};return}
    e.preventDefault();document.activeElement?.blur?.();st.sel.clear();paint();vp.setPointerCapture(e.pointerId);M={m:'pan',sx:e.clientX,sy:e.clientY,px:st.px,py:st.py}});
  vp.addEventListener('pointermove',e=>{if(!M)return;const dx=e.clientX-M.sx,dy=e.clientY-M.sy;getSelection()?.removeAllRanges();
    if(M.m==='pan'){st.px=M.px+dx;st.py=M.py+dy;view();vp.classList.add('panning')}
    if(M.m==='drag'){if(!M.moved&&Math.hypot(dx,dy)<5)return;M.moved=true;M.mv.forEach(g=>{const nx=Math.round(g.x+dx/st.z),ny=Math.round(g.y+dy/st.z);setXY(g.k,g.o,nx,ny);g.el.style.left=nx+'px';g.el.style.top=ny+'px'})}
    if(M.m==='box'){if(Math.hypot(dx,dy)<5)return;M.moved=true;const r=vp.getBoundingClientRect(),bx=st.el.querySelector('.osbbox');bx.hidden=false;Object.assign(bx.style,{left:Math.min(e.clientX,M.sx)-r.left+'px',top:Math.min(e.clientY,M.sy)-r.top+'px',width:Math.abs(dx)+'px',height:Math.abs(dy)+'px'});
      const[ax,ay]=toW(Math.min(e.clientX,M.sx),Math.min(e.clientY,M.sy)),[bx2,by2]=toW(Math.max(e.clientX,M.sx),Math.max(e.clientY,M.sy));st.sel=new Set(M.base);st.w.querySelectorAll('.osbc,.osbn').forEach(c=>{const q=rectOf(c);if(q.x<bx2&&q.x+q.w>ax&&q.y<by2&&q.y+q.h>ay)st.sel.add(c.dataset.k)});paint()}});
  const up=async()=>{if(!M)return;const m=M;M=null;vp.classList.remove('panning');st.el.querySelector('.osbbox').hidden=true;
    if(m.m==='box'&&!m.moved&&m.toggle){st.sel.has(m.toggle)?st.sel.delete(m.toggle):st.sel.add(m.toggle);paint()}
    if(m.m==='box'&&m.moved&&st.sel.size>1)toast(`${st.sel.size}개 골랐어요 · 끌어서 옮기기 · Ctrl+G 묶기 · Delete 지우기`,{ms:1800});
    if(m.m==='drag'&&!m.moved&&m.ed){m.ed.focus()}
    if(m.m==='drag'&&m.moved){if(m.mv.some(g=>g.k[0]==='s')){const l=await One.list();m.mv.filter(g=>g.k[0]==='s').forEach(g=>{const o=l.find(y=>y.id===g.o.id);if(o){o.bx=g.o.bx;o.by=g.o.by}});await One.put(l)}if(m.mv.some(g=>g.k[0]!=='s'))putMeta()}};
  vp.addEventListener('pointerup',up);vp.addEventListener('pointercancel',up);
  vp.addEventListener('wheel',e=>{if(e.target.closest('.osbnt'))return;e.preventDefault();const r=vp.getBoundingClientRect();if(e.shiftKey){st.px-=e.deltaY;return view()}const dy=e.deltaY*(e.deltaMode===1?33:e.deltaMode===2?400:1);if(!dy){st.px-=e.deltaX;return view()}zoomBy(Math.exp(-Math.max(-300,Math.min(300,dy))*(e.ctrlKey?.012:.0016)),e.clientX-r.left,e.clientY-r.top)},{passive:false});
  vp.addEventListener('dblclick',e=>{const c=e.target.closest('.osbc');if(c&&!e.target.closest('button'))return load(c.dataset.k.slice(2));if(!e.target.closest('[data-k]')){const[x,y]=toW(e.clientX,e.clientY);addNote(x-110,y-40)}});
  vp.addEventListener('click',e=>{const b=e.target.closest('[data-b]');if(!b)return;const k=b.closest('[data-k]').dataset.k,id=k.slice(2);if(b.dataset.b==='load')load(id);if(b.dataset.b==='ren')ren(id);if(b.dataset.b==='more'){st.sel=new Set([k]);paint();const r=b.getBoundingClientRect();ctxMenu(r.left,r.bottom+4)}});
  vp.addEventListener('contextmenu',e=>{e.preventDefault();const c=e.target.closest('[data-k]');if(c&&!st.sel.has(c.dataset.k)){st.sel=new Set([c.dataset.k]);paint()}if(!c){st.sel.clear();paint();const[x,y]=toW(e.clientX,e.clientY);return menu(e.clientX,e.clientY,[{t:'여기에 메모',i:'sticky',fn:()=>addNote(x-110,y-40)},{t:'지금 캔버스 저장',i:'save',fn:snapNow},{t:'전체 보기',i:'fit',fn:()=>fit(true)}])}ctxMenu(e.clientX,e.clientY)})}
function ctxMenu(x,y){const ks=[...st.sel];const n=ks.length;const ss=ks.filter(k=>k[0]==='s'),ns=ks.filter(k=>k[0]==='n'),gs=ks.filter(k=>k[0]==='g');const one=n===1?ks[0]:null;const out=[];
  if(one&&one[0]==='s'){const id=one.slice(2);out.push({t:'불러오기',i:'restore',fn:()=>load(id)},{t:'이름 바꾸기',i:'edit',fn:()=>ren(id)},{t:'설명 메모 달기',i:'text',fn:()=>memo(id)},{t:'색 표시',i:'color',sub:TAGS.map(([c,t])=>({t,fn:()=>tag([id],c)}))},{t:'복제',i:'copy',fn:()=>dupSave(id)},{t:'지금 캔버스와 비교',i:'history',fn:()=>{close();Feat.compare(id)}},{t:'새 캔버스로 열기 (지금 것 유지)',i:'plus',fn:()=>openAsNew(id)},{t:'이 저장만 백업 파일로',i:'dl',fn:()=>exportOne(id)},'-')}
  if(ss.length>1)out.push({t:`색 표시 (${ss.length}개)`,i:'color',sub:TAGS.map(([c,t])=>({t,fn:()=>tag(ss.map(k=>k.slice(2)),c)}))});
  if(ns.length)out.push({t:'메모 색',i:'color',sub:Object.keys(NC).map(c=>({t:{y:'노랑',p:'분홍',m:'초록',s:'하늘',l:'보라'}[c],fn:()=>{ns.forEach(k=>{const o=objOf(k);if(o)o.c=c});putMeta();render()}}))});
  if(gs.length===1)out.push({t:'묶음 색',i:'color',sub:TAGS.slice(1).map(([c,t])=>({t,fn:()=>{objOf(gs[0]).c=c;putMeta();render()}}))},{t:'묶음 풀기',i:'grid',fn:()=>{st.groups=st.groups.filter(g=>'g:'+g.id!==gs[0]);putMeta();st.sel.clear();render()}});
  if(n>1)out.push({t:'묶기 (Ctrl+G)',i:'frame',fn:group},{t:'줄 맞추기',i:'layout',fn:()=>alignSel()});
  out.push({t:n>1?`${n}개 지우기`:'지우기',i:'trash',fn:del});menu(x,y,out)}
function key(e){if(!st||!$('#modal').hidden)return;const a=document.activeElement;if(a&&(a.isContentEditable||/INPUT|TEXTAREA/.test(a.tagName))){if(e.key==='Escape'){a.blur();e.stopPropagation()}return}const k=e.key,mod=e.ctrlKey||e.metaKey;
  const stop=()=>{e.preventDefault();e.stopPropagation()};
  if(k==='Escape'){stop();if(st.sel.size){st.sel.clear();return paint()}return close()}
  if((k==='Delete'||k==='Backspace')&&st.sel.size){stop();del()}
  if(mod&&k.toLowerCase()==='a'){stop();st.sel=new Set([...st.w.querySelectorAll('.osbc,.osbn')].map(c=>c.dataset.k));paint()}
  if(mod&&k.toLowerCase()==='g'){stop();group()}if(mod&&k.toLowerCase()==='f'){stop();st.el.querySelector('#osFind').focus()}if(mod&&k.toLowerCase()==='s'){stop();snapNow()}
  if(mod&&k==='0'||k==='0'&&!mod){stop();fit(true)}if(k==='+'||k==='='){stop();zoomBy(1.25)}if(k==='-'){stop();zoomBy(.8)}if(!mod&&k.toLowerCase()==='n'){stop();addNote()}
  if(st.sel.size&&/^Arrow/.test(k)){stop();const d=e.shiftKey?40:8;const dx=k==='ArrowLeft'?-d:k==='ArrowRight'?d:0,dy=k==='ArrowUp'?-d:k==='ArrowDown'?d:0;moveSel(dx,dy)}}
async function moveSel(dx,dy){const l=await One.list();[...st.sel].forEach(k=>{if(k[0]==='s'){const o=l.find(y=>'s:'+y.id===k);if(o){o.bx+=dx;o.by+=dy}}else{const o=objOf(k);if(o){o.x+=dx;o.y+=dy}}});await One.put(l);await putMeta();render()}
async function load(id){const l=await One.list(),x=l.find(y=>y.id===id);if(!x)return;if(!await confirmDlg('이 저장을 불러올까요?','지금 캔버스는 ‘불러오기 전 자동 저장’으로 먼저 보관해 둘게요.','불러오기'))return;
  await One.snap('불러오기 전 자동 저장');const mm=One.main();mm.cv=JSON.parse(JSON.stringify(x.cv));touch(mm);flush();close();render0();setTimeout(()=>Canvas.cmd('fit'),200);toast(`‘${x.name}’을(를) 불러왔어요`)}
async function openAsNew(id){const l=await One.list(),x=l.find(y=>y.id===id);if(!x)return;await One.snap('새 캔버스로 열기 전 자동 저장');const mm=One.main();mm.cv=JSON.parse(JSON.stringify(x.cv));mm.title=x.name;touch(mm);flush();close();render0();setTimeout(()=>Canvas.cmd('fit'),200);toast(`‘${x.name}’을(를) 열었어요 · 원래 캔버스는 저장 화면에 보관돼 있어요`)}
const render0=()=>window.render?window.render():0;
async function ren(id){const l=await One.list(),x=l.find(y=>y.id===id);if(!x)return;const n=await ask('이름 바꾸기',{val:x.name});if(n&&n.trim()){x.name=n.trim();await One.put(l);render()}}
async function memo(id){const l=await One.list(),x=l.find(y=>y.id===id);if(!x)return;const n=await ask('설명 메모',{val:x.memo||'',multi:true,ph:'이 저장에 대한 짧은 설명'});if(n!=null){x.memo=n.trim();await One.put(l);render()}}
async function tag(ids,c){const l=await One.list();l.forEach(x=>{if(ids.includes(x.id))x.tag=c||undefined});await One.put(l);render()}
async function dupSave(id){const l=await One.list(),x=l.find(y=>y.id===id);if(!x)return;const n={...JSON.parse(JSON.stringify(x)),id:uid(),name:x.name+' 복사본',bx:x.bx+30,by:x.by+30};l.unshift(n);await One.put(l.slice(0,60));render()}
function exportOne(id){const x=st.l.find(y=>y.id===id);if(x)saveFile(x.name+'.achernar.json',new Blob([JSON.stringify({mindspaceSave:1,...x})],{type:'application/json'}))}
async function del(){const ks=[...st.sel];if(!ks.length)return;const ss=ks.filter(k=>k[0]==='s').map(k=>k.slice(2));const l=await One.list();
  if(ss.length&&!await confirmDlg(ss.length>1?`저장 ${ss.length}개를 지울까요?`:'이 저장을 지울까요?',`${esc(l.filter(x=>ss.includes(x.id)).map(x=>x.name).slice(0,3).join(', '))}${ss.length>3?' 외':''} · 지금 캔버스는 그대로예요.`,'지우기',1))return;
  if(ss.length)await One.put(l.filter(x=>!ss.includes(x.id)));st.notes=st.notes.filter(n=>!st.sel.has('n:'+n.id));st.groups=st.groups.filter(g=>!st.sel.has('g:'+g.id));await putMeta();st.sel.clear();render()}
function addNote(x,y){const r=st.vp.getBoundingClientRect();if(x==null){x=(r.width/2-st.px)/st.z-110;y=(r.height/2-st.py)/st.z-60}const n={id:uid(),x:Math.round(x),y:Math.round(y),w:220,text:'',c:'y'};st.notes.push(n);putMeta();render().then(()=>{st.sel=new Set(['n:'+n.id]);paint();st.w.querySelector(`[data-nt="${n.id}"]`)?.focus()})}
function group(){const els=[...st.sel].filter(k=>k[0]!=='g').map(k=>st.w.querySelector(`[data-k="${k}"]`)).filter(Boolean);if(els.length<1)return toast('묶을 것을 먼저 골라 주세요 · Ctrl+드래그');const rs=els.map(rectOf);const p=24;
  const g={id:uid(),x:Math.min(...rs.map(r=>r.x))-p,y:Math.min(...rs.map(r=>r.y))-p-30,w:0,h:0,name:'묶음 '+(st.groups.length+1),c:'#2563EB'};g.w=Math.max(...rs.map(r=>r.x+r.w))+p-g.x;g.h=Math.max(...rs.map(r=>r.y+r.h))+p-g.y;st.groups.push(g);putMeta();render().then(()=>{st.sel=new Set(['g:'+g.id]);paint();const t=st.w.querySelector(`[data-gl="${g.id}"]`);if(t){t.focus();const rg=document.createRange();rg.selectNodeContents(t);getSelection().removeAllRanges();getSelection().addRange(rg)}})}
async function alignSel(){const ks=[...st.sel].filter(k=>k[0]==='s');if(!ks.length)return;const l=await One.list();const its=ks.map(k=>l.find(y=>'s:'+y.id===k)).filter(Boolean).sort((a,b)=>a.bx-b.bx||a.by-b.by);const x0=Math.min(...its.map(i=>i.bx)),y0=Math.min(...its.map(i=>i.by));its.forEach((it,i)=>{it.bx=x0+(i%COLS)*(CW+GAP);it.by=y0+Math.floor(i/COLS)*(CH+GAP)});await One.put(l);render()}
async function arrange(by){const l=await One.list();const s=[...l];if(by==='new')s.sort((a,b)=>b.t-a.t);if(by==='old')s.sort((a,b)=>a.t-b.t);if(by==='name')s.sort((a,b)=>a.name.localeCompare(b.name,'ko'));if(by==='tag')s.sort((a,b)=>(a.tag||'~').localeCompare(b.tag||'~')||b.t-a.t);
  const gy=st.groups.length?Math.max(...st.groups.map(g=>g.y+g.h))+60:0;st.groups.length&&toast('묶음은 그대로 두고 저장 카드만 다시 놓았어요',{ms:1600});s.forEach((x,i)=>{x.bx=(i%COLS)*(CW+GAP);x.by=gy+Math.floor(i/COLS)*(CH+GAP)});if(!st.groups.length)st.notes.forEach((n,i)=>{n.x=COLS*(CW+GAP)+20;n.y=i*180});await One.put(l);await putMeta();await render();fit(true)}
function exportMenu(x,y){const m=One.main();const run=async k=>{close();One.home();await new Promise(r=>setTimeout(r,150));if(k==='png')return Canvas.api.png().then(b=>saveFile((m.title||'캔버스')+'.png',b),()=>toast('캔버스가 비어 있어요'));if(k==='md')return exportMD(m);if(k==='json')return backupAll();return importBackup()};
  menu(x,y,[{t:'인쇄 · PDF',i:'page',fn:()=>{close();setTimeout(()=>Print.open('all'),150)}},{t:'그림 (PNG, 고화질)',i:'image',fn:()=>run('png')},{t:'글 (마크다운)',i:'page',fn:()=>run('md')},'-',{t:'백업 파일 만들기',i:'restore',fn:()=>run('json')},{t:'백업 불러오기',i:'ul',fn:()=>run('imp')}])}
function close(){if(!st)return;removeEventListener('keydown',st.onK,true);st.el.remove();st=null;document.body.classList.remove('osbopen')}
return{open,close,isOpen:()=>!!st}})();
