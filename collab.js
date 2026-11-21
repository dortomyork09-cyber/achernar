/* Achernar — 같이 쓰기 · 링크 공유 · 댓글 (Firebase Realtime Database) */
const Collab=(()=>{
const CFG={apiKey:"AIzaSyA5xPuGdyg0NfxBqVykzSvqM_VJEv38TjQ",authDomain:"achernar-d08da.firebaseapp.com",databaseURL:"https://achernar-d08da-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"achernar-d08da",storageBucket:"achernar-d08da.firebasestorage.app",messagingSenderId:"957609839237",appId:"1:957609839237:web:c42ad3c68337b09724b7ec"};
const COLS=['items','links','strokes','comments'],EDIT=['items','links','strokes'];
const PAL=['#E5484D','#F76B15','#E2A400','#30A46C','#0090FF','#6E56CF','#D6409F','#12A594'];
const ROLE={owner:'만든 사람',e:'편집 가능',c:'댓글 가능',v:'보기만'};
let alive=true,fb=null,db=null,uid=null,room=null,boundCv=null,last={},tick=0,peers={},members={},roomRef=null,pres=null,moveT=0,rafOn=false,roWarn=0,pendRender=0,saveT=0;
const A=()=>Canvas.api;
const rid=(n=20)=>{const a='abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';const r=crypto.getRandomValues(new Uint8Array(n));for(const x of r)s+=a[x%a.length];return s};
const colorOf=u=>{let h=0;for(const ch of String(u||''))h=(h*31+ch.charCodeAt(0))>>>0;return PAL[h%PAL.length]};
const myName=()=>{try{return localStorage.getItem('ach-name')||''}catch(e){return ''}};
const setName=n=>{try{localStorage.setItem('ach-name',n)}catch(e){}};
const canEdit=()=>!room||room.role==='owner'||room.role==='e';
const canComment=()=>!room||room.role!=='v';
async function needName(){let n=myName();if(n)return n;n=(await ask('이름을 알려 주세요',{sub:'같이 쓰는 사람과 댓글에 이 이름이 보여요',ph:'예) 김민준',ok:'시작하기'})||'').trim().slice(0,20);if(!n)return '';setName(n);return n}

/* ---------- Firebase 불러오기 ---------- */
function js(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s)})}
async function connect(){if(db)return;
  if(window.__FBMOCK){fb=window.__FBMOCK}else{if(!window.firebase){await js('vendor/firebase-app-compat.js');await js('vendor/firebase-auth-compat.js');await js('vendor/firebase-database-compat.js')}fb=window.firebase;if(!fb.apps.length)fb.initializeApp(CFG)}
  const au=fb.auth();if(!au.currentUser)await au.signInAnonymously();uid=au.currentUser.uid;db=fb.database()}

/* ---------- 직렬화 ---------- */
function colArr(c,k){if(k==='comments'){if(!c.comments)c.comments=[];return c.comments}return c[k]||(c[k]=[])}
function snapshot(c){const o={};COLS.forEach(k=>{const m={};colArr(c,k).forEach(x=>{if(x&&x.id)m[x.id]=JSON.stringify(x)});o[k]=m});return o}

/* ---------- 방 만들기 · 들어가기 ---------- */
async function create(){const n=await needName();if(!n)return;
  try{await connect()}catch(e){console.warn(e);return toast('서버에 연결하지 못했어요. 인터넷을 확인해 주세요')}
  const m=One.main(),c=A().C(),r=rid(),keys={e:rid(16),c:rid(16)};
  try{await db.ref().update({['keys/'+r]:keys,['rooms/'+r+'/meta']:{owner:uid,title:m.title||'내 캔버스',at:Date.now()}});
    const s=snapshot(c),up={};COLS.forEach(k=>Object.entries(s[k]).forEach(([id,v])=>up[k+'/'+id]=v));up['members/'+uid]={n,c:colorOf(uid),r:'owner',at:Date.now()};
    await db.ref('rooms/'+r).update(up);
  }catch(e){console.warn(e);return toast('공유를 시작하지 못했어요: '+(e.code||e.message))}
  m.room={id:r,role:'owner',keys};touch(m);flush();await start(m);toast('공유를 시작했어요 · 링크를 복사해 보내세요');return true}
function linkOf(kind){if(!room)return '';const base=location.origin+location.pathname;if(kind==='v')return `${base}#r=${room.id}`;if(!room.keys)return '';return `${base}#r=${room.id}&${kind}=${room.keys[kind]}`}

async function join(r,kind,key){const n=await needName();if(!n)return;
  try{await connect()}catch(e){return toast('서버에 연결하지 못했어요. 인터넷을 확인해 주세요')}
  let meta=null;try{meta=(await db.ref('rooms/'+r+'/meta').once('value')).val()}catch(e){console.warn(e)}
  if(!meta)return toast('공유가 끝났거나 없는 링크예요',{ms:4000});
  let role=meta.owner===uid?'owner':'v';
  if(key&&role!=='owner'){try{await db.ref('access/'+r+'/'+uid).set(key);role=kind}catch(e){toast('링크의 권한 열쇠가 맞지 않아 보기 전용으로 열어요',{ms:4000})}}
  try{await db.ref('rooms/'+r+'/members/'+uid).set({n,c:colorOf(uid),r:role,at:Date.now()})}catch(e){}
  const all=(await db.ref('rooms/'+r).once('value')).val()||{};
  const m=One.main();
  if(!(m.room&&m.room.id===r)){One.home();await new Promise(z=>setTimeout(z,60));const cv=A().C();if(cv&&cv.items&&cv.items.length)await One.snap(m.title||'내 캔버스')}
  const cv={items:[],links:[],strokes:[],comments:[],view:null,grid:true};
  COLS.forEach(k=>{const o=all[k]||{};cv[k]=Object.values(o).map(v=>{try{return JSON.parse(v)}catch(e){return null}}).filter(Boolean)});
  cv.items.sort((a,b)=>(a.z||0)-(b.z||0));
  m.cv=cv;m.title=meta.title||'공유 캔버스';m.room={id:r,role,keys:m.room&&m.room.id===r?m.room.keys:null};touch(m);flush();if(window.render)render();
  setTimeout(()=>{try{A().fit()}catch(e){}},200);await start(m);
  toast(`‘${m.title}’에 들어왔어요 · ${ROLE[role]}`,{ms:2600})}

async function start(m){stop(true);room=m.room;await connect();
  boundCv=A().C();last=snapshot(boundCv);roomRef=db.ref('rooms/'+room.id);
  COLS.forEach(k=>{const ref=roomRef.child(k);
    ref.on('child_added',s=>remote(k,s.key,s.val()));ref.on('child_changed',s=>remote(k,s.key,s.val()));ref.on('child_removed',s=>remote(k,s.key,null))});
  alive=true;roomRef.child('meta').on('value',s=>{const v=s.val();if(!v){alive=false;rmQ=[];if(room)ended();return}const m=One.main();if(v.title&&v.title!==m.title&&room.role!=='owner'){m.title=v.title;touch(m);const t=document.querySelector('#otitle');if(t&&document.activeElement!==t)t.textContent=v.title}});
  roomRef.child('members').on('value',s=>{members=s.val()||{};ui()});
  pres=roomRef.child('presence/'+uid);pres.onDisconnect().remove();pres.set({n:myName(),c:colorOf(uid),t:Date.now()});
  roomRef.child('presence').on('value',s=>{const v=s.val()||{};delete v[uid];peers=v;drawCursors();ui()});
  clearInterval(tick);tick=setInterval(loop,180);
  document.body.classList.toggle('ach-ro',!canEdit());document.body.classList.add('ach-room');roObs();ui();Cm.refresh()}
function stop(quiet){clearInterval(tick);tick=0;if(roomRef){COLS.forEach(k=>roomRef.child(k).off());['meta','members','presence'].forEach(k=>roomRef.child(k).off())}
  if(pres){try{pres.remove()}catch(e){}}pres=null;roomRef=null;room=null;peers={};members={};boundCv=null;drawCursors();document.body.classList.remove('ach-ro','ach-room');ui();if(!quiet)Cm.refresh()}
function ended(){const m=One.main();m.room=null;touch(m);stop();toast('공유가 끝났어요 · 지금 내용은 내 캔버스로 남아 있어요',{ms:4000})}
function leave(){const m=One.main();m.room=null;touch(m);flush();stop();toast('공유 캔버스에서 나왔어요 · 내용은 이 기기에 남아 있어요')}
async function endShare(){if(!room||room.role!=='owner')return;const ok=await confirmDlg('공유를 끝낼까요?','링크로 들어온 사람들은 더 이상 이 캔버스를 볼 수 없어요. 내 캔버스 내용은 그대로 남아요.','공유 끝내기');if(!ok)return;
  const r=room.id;const m0=One.main();m0.room=null;touch(m0);stop(true);try{await db.ref().update({['rooms/'+r]:null,['keys/'+r]:null})}catch(e){console.warn(e);return toast('공유를 끝내지 못했어요')}flush();Cm.refresh();closeModal();toast('공유를 끝냈어요')}

/* ---------- 원격 → 내 화면 ---------- */
function editingId(){const a=document.activeElement;const c=a&&a.closest&&a.closest('.card');return c?c.dataset.id:null}
function remote(k,id,val){if(!room||!boundCv)return;if(last[k]&&last[k][id]===val)return;if(!last[k])last[k]={};
  const arr=colArr(boundCv,k),i=arr.findIndex(x=>x.id===id);
  if(val==null){rmQ.push([k,id]);clearTimeout(rmT);rmT=setTimeout(flushRm,450);return}
  else{let o;try{o=JSON.parse(val)}catch(e){return}last[k][id]=val;
    if(i<0)arr.push(o);else if(k==='items'&&editingId()===id){const cur=arr[i];['x','y','w','h','rot','z','c'].forEach(p=>{if(p in o)cur[p]=o[p]})}else arr[i]=o}
  if(k==='comments'&&val){let o=null;try{o=JSON.parse(val)}catch(e){}if(o)Cm.notify(o)}
  schedule()}
let rmQ=[],rmT=0;function flushRm(){const q=rmQ;rmQ=[];if(!room||!boundCv||!alive)return;q.forEach(([k,id])=>{if(!last[k]||!(id in last[k]))return;delete last[k][id];const arr=colArr(boundCv,k),i=arr.findIndex(x=>x.id===id);if(i>=0)arr.splice(i,1)});schedule()}
function schedule(){if(pendRender)return;pendRender=requestAnimationFrame(()=>{pendRender=0;if(A().C()!==boundCv)return;try{A().render()}catch(e){console.warn(e)}Cm.refresh();clearTimeout(saveT);saveT=setTimeout(()=>{const m=One.main();touch(m)},800)})}

/* ---------- 내 화면 → 원격 ---------- */
function loop(){if(!room||document.hidden)return;
  if(A().C()!==boundCv){const m=One.main();if(m.room)m.room=null;touch(m);stop();toast('다른 캔버스를 열어서 공유 캔버스에서 나왔어요',{ms:3000});return}
  const cur=snapshot(boundCv),up={};let bad=false;
  COLS.forEach(k=>{const a=cur[k],b=last[k]||{};const allowed=EDIT.includes(k)?canEdit():canComment();
    for(const id in a)if(a[id]!==b[id]){if(allowed)up[k+'/'+id]=a[id];else bad=true}
    for(const id in b)if(!(id in a)){if(allowed)up[k+'/'+id]=null;else bad=true}});
  if(bad)revert();
  const n=Object.keys(up).length;if(n){Object.entries(up).forEach(([p,v])=>{const[k,id]=p.split('/');if(v==null)delete last[k][id];else last[k][id]=v});
    roomRef.update(up).catch(e=>{console.warn(e);toast('저장하지 못한 변경이 있어요 (권한 또는 인터넷 확인)',{ms:3000})})}
  if(room.role==='owner'){const m=One.main();if(m.title&&m.title!==room._t){room._t=m.title;roomRef.child('meta/title').set(m.title).catch(()=>{})}}}
function revert(){COLS.forEach(k=>{const allowed=EDIT.includes(k)?canEdit():canComment();if(allowed)return;const arr=colArr(boundCv,k);arr.length=0;Object.values(last[k]||{}).forEach(v=>{try{arr.push(JSON.parse(v))}catch(e){}})});
  boundCv.items.sort((a,b)=>(a.z||0)-(b.z||0));try{A().render()}catch(e){}
  if(Date.now()-roWarn>4000){roWarn=Date.now();toast(room.role==='c'?'댓글만 달 수 있는 링크예요 · 내용은 바꿀 수 없어요':'보기 전용 링크예요 · 내용은 바꿀 수 없어요',{ms:2600})}}
let mo=null;function roObs(){if(mo){mo.disconnect();mo=null}if(canEdit())return;const vp=A().vpEl();const lock=()=>vp.querySelectorAll('[contenteditable="true"],[contenteditable=""]').forEach(e=>e.setAttribute('contenteditable','false'));lock();mo=new MutationObserver(lock);mo.observe(vp,{subtree:true,childList:true,attributes:true,attributeFilter:['contenteditable']})}

/* ---------- 커서 · 접속자 ---------- */
function onMove(e){if(!room||!pres)return;const now=Date.now();if(now-moveT<70)return;moveT=now;const[x,y]=A().toWorld(e.clientX,e.clientY);pres.update({x:Math.round(x),y:Math.round(y),t:now,n:myName()}).catch(()=>{})}
function drawCursors(){const vp=A()?.vpEl?.();if(!vp)return;let L=vp.querySelector('#curs');if(!L){L=document.createElement('div');L.id='curs';vp.appendChild(L)}
  const ids=Object.keys(peers);L.querySelectorAll('.cur').forEach(el=>{if(!peers[el.dataset.u])el.remove()});
  ids.forEach(u=>{let el=L.querySelector(`.cur[data-u="${u}"]`);const p=peers[u];if(!el){el=document.createElement('div');el.className='cur';el.dataset.u=u;el.innerHTML=`<svg viewBox="0 0 16 16" width="18" height="18"><path d="M2 1l11 6-5 1.4L5.6 14z" fill="currentColor" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg><span></span>`;L.appendChild(el)}
    el.style.color=p.c||'#333';el.querySelector('span').textContent=p.n||'손님';el.style.setProperty('--cc',p.c||'#333')});
  if(ids.length&&!rafOn){rafOn=true;requestAnimationFrame(posCursors)}}
function posCursors(){const vp=A()?.vpEl?.(),L=vp&&vp.querySelector('#curs');if(!L||!Object.keys(peers).length){rafOn=false;return}const{px,py,z}=A().cam();
  L.querySelectorAll('.cur').forEach(el=>{const p=peers[el.dataset.u];if(!p)return;el.style.transform=`translate(${(p.x||0)*z+px}px,${(p.y||0)*z+py}px)`;el.classList.toggle('idle',Date.now()-(p.t||0)>60000);el.style.display=p.x==null?'none':''});requestAnimationFrame(posCursors)}
function ui(){const box=document.querySelector('#achpeers');if(!box)return;
  if(!room){box.innerHTML='';box.hidden=true;return}box.hidden=false;
  const on=new Set(Object.keys(peers));const list=[[uid,{n:myName()+' (나)',c:colorOf(uid)}],...Object.entries(peers).map(([u,p])=>[u,p])];
  const show=list.slice(0,4),more=list.length-show.length;
  box.innerHTML=show.map(([u,p])=>`<span class="av" style="--ac:${p.c||colorOf(u)}" title="${esc(p.n||'손님')}">${esc((p.n||'?').trim().slice(0,1))}</span>`).join('')+(more>0?`<span class="av more">+${more}</span>`:'')+`<em class="rl">${ROLE[room.role]}</em>`}

/* ---------- 공유 창 ---------- */
async function open(){
  if(!room){const ok=await confirmDlg('이 캔버스를 공유할까요?','링크를 받은 사람과 같이 보고 쓸 수 있어요. 사진·영상 파일은 아직 공유되지 않고, 내 기기에서만 보여요.','공유 링크 만들기');if(!ok)return;const r=await create();if(!r)return}
  const row=(k,t,d)=>`<div class="shr"><div><b>${t}</b><small>${d}</small></div><input class="inp" readonly value="${esc(linkOf(k))}"><button class="btn" data-cp="${k}">복사</button></div>`;
  const ppl=Object.entries(members).map(([u,p])=>`<li><span class="av" style="--ac:${p.c||colorOf(u)}">${esc((p.n||'?').slice(0,1))}</span>${esc(p.n||'손님')}${u===uid?' (나)':''}<em>${ROLE[p.r]||''}</em>${peers[u]||u===uid?'<i class="onl" title="접속 중"></i>':''}</li>`).join('');
  const owner=room.role==='owner';
  modal({title:'공유',cls:'mid',html:`${owner?`${row('v','보기만','내용을 볼 수만 있어요')}${row('c','댓글 가능','보면서 댓글을 달 수 있어요')}${row('e','편집 가능','같이 고치고 만들 수 있어요')}`:`<p class="note" style="margin:0 0 12px">나는 <b>${ROLE[room.role]}</b>(으)로 들어와 있어요.</p>${row('v','보기 링크','다른 사람에게 보여 줄 때')}`}
    <h4 class="shh">같이 있는 사람</h4><ul class="shp">${ppl||'<li class="note">아직 아무도 없어요</li>'}</ul>
    <div class="shf"><span class="note">이름: <b>${esc(myName())}</b> <button class="lnk" data-nm>바꾸기</button></span>${owner?'<button class="btn dang" data-end>공유 끝내기</button>':'<button class="btn" data-leave>나가기</button>'}</div>`,
   onOpen:()=>{const b=document.querySelector('#mbody');b.querySelectorAll('[data-cp]').forEach(x=>x.onclick=()=>{const v=linkOf(x.dataset.cp);(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast('링크를 복사했어요'),()=>{x.previousElementSibling.select();document.execCommand('copy');toast('링크를 복사했어요')})});
     b.querySelector('[data-end]')?.addEventListener('click',endShare);b.querySelector('[data-leave]')?.addEventListener('click',()=>{closeModal();leave()});
     b.querySelector('[data-nm]')?.addEventListener('click',async()=>{const n=(await ask('이름 바꾸기',{val:myName(),ok:'바꾸기'})||'').trim().slice(0,20);if(!n)return;setName(n);if(room){roomRef.child('members/'+uid+'/n').set(n).catch(()=>{});pres&&pres.update({n})}ui();toast('이름을 바꿨어요')})}})}

/* ---------- 댓글 ---------- */
const Cm=(()=>{let panel=null,tab='open',focusCard=null;
  const C=()=>A().C();const list=()=>{const c=C();if(!c)return[];if(!c.comments)c.comments=[];return c.comments};
  const ago=t=>{const s=(Date.now()-t)/1000;return s<60?'방금':s<3600?Math.floor(s/60)+'분 전':s<86400?Math.floor(s/3600)+'시간 전':new Date(t).toLocaleDateString()};
  const fmt=t=>esc(t).replace(/@([^\s@]{1,20})/g,'<b class="mn">@$1</b>').replace(/\n/g,'<br>');
  const cardName=id=>{const it=id&&A().I(id);if(!it)return '캔버스';const tx=(it.title||it.text||it.name||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();return tx?tx.slice(0,24):({shape:'도형',image:'사진',frame:'프레임',node:'노드'}[it.type]||'카드')};
  function names(){const s=new Set();Object.values(members).forEach(p=>p.n&&s.add(p.n));Object.values(peers).forEach(p=>p.n&&s.add(p.n));list().forEach(c=>{s.add(c.n);(c.rep||[]).forEach(r=>s.add(r.n))});s.delete(myName());return[...s].filter(Boolean)}
  function ensure(){if(panel)return panel;panel=document.createElement('aside');panel.id='cmp';panel.hidden=true;document.body.appendChild(panel);
    panel.addEventListener('pointerdown',e=>e.stopPropagation());panel.addEventListener('keydown',e=>e.stopPropagation());return panel}
  function render(){if(!panel||panel.hidden)return;const all=list(),open=all.filter(c=>!c.res),done=all.filter(c=>c.res),show=(tab==='open'?open:done).slice().sort((a,b)=>b.at-a.at);
    const can=canComment();
    panel.innerHTML=`<header><b>댓글</b><nav><button data-tab="open" class="${tab==='open'?'on':''}">열림 ${open.length}</button><button data-tab="done" class="${tab==='done'?'on':''}">해결됨 ${done.length}</button></nav><button class="x" data-close aria-label="닫기">✕</button></header>
    ${can?`<div class="cnew">${focusCard?`<div class="cfor">‘${esc(cardName(focusCard))}’에 댓글 <button class="lnk" data-unfor>캔버스 전체로</button></div>`:'<div class="cfor">카드를 오른쪽 클릭 → 댓글 달기로 카드에 달 수 있어요</div>'}<textarea class="inp" rows="3" placeholder="댓글 쓰기 · @이름으로 부르기" data-new></textarea><div class="crow"><span class="note">Ctrl+Enter로 보내기</span><button class="btn pr" data-send>보내기</button></div></div>`:'<p class="note cro">보기 전용 링크라 댓글을 달 수 없어요</p>'}
    <div class="clist">${show.length?show.map(c=>`<article class="cth${c.id===panel._hl?' hl':''}" data-cid="${c.id}"><div class="cmeta"><span class="av" style="--ac:${c.c||'#888'}">${esc((c.n||'?').slice(0,1))}</span><b>${esc(c.n||'손님')}</b><time>${ago(c.at)}</time>${c.card?`<button class="lnk" data-go="${c.card}">${esc(cardName(c.card))}</button>`:''}</div><p>${fmt(c.t)}</p>
      ${(c.rep||[]).map(r=>`<div class="crep"><div class="cmeta"><span class="av" style="--ac:${r.c||'#888'}">${esc((r.n||'?').slice(0,1))}</span><b>${esc(r.n)}</b><time>${ago(r.at)}</time></div><p>${fmt(r.t)}</p></div>`).join('')}
      ${can?`<div class="cact"><input class="inp" placeholder="답글…" data-rep="${c.id}"><button class="lnk" data-res="${c.id}">${c.res?'다시 열기':'✓ 해결'}</button>${c.u===uid||!room||room.role==='owner'?`<button class="lnk dang" data-del="${c.id}">삭제</button>`:''}</div>`:''}</article>`).join(''):`<p class="note cempty">${tab==='open'?'열린 댓글이 없어요':'해결된 댓글이 없어요'}</p>`}</div>`;
    wire()}
  function wire(){const P=panel;P.querySelector('[data-close]').onclick=close;P.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
    P.querySelector('[data-unfor]')?.addEventListener('click',()=>{focusCard=null;render()});
    const ta=P.querySelector('[data-new]');if(ta){ta.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();send(ta.value)}};mention(ta)}
    P.querySelector('[data-send]')?.addEventListener('click',()=>send(ta.value));
    P.querySelectorAll('[data-rep]').forEach(i=>{mention(i);i.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'&&!e.isComposing&&i.value.trim()){e.preventDefault();reply(i.dataset.rep,i.value)}}});
    P.querySelectorAll('[data-res]').forEach(b=>b.onclick=()=>{const c=list().find(x=>x.id===b.dataset.res);if(!c)return;c.res=!c.res;commit();toast(c.res?'해결로 표시했어요':'다시 열었어요',{ms:1200})});
    P.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{const ok=await confirmDlg('댓글을 지울까요?','답글도 함께 지워져요.','삭제');if(!ok)return;const L=list(),i=L.findIndex(x=>x.id===b.dataset.del);if(i>=0)L.splice(i,1);commit()});
    P.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{A().focus(b.dataset.go);A().setSel([b.dataset.go])})}
  function mention(el){let box=null;const hide=()=>{box&&box.remove();box=null};
    el.addEventListener('input',()=>{const v=el.value.slice(0,el.selectionStart);const m=v.match(/@([^\s@]{0,20})$/);if(!m){hide();return}const q=m[1],ns=names().filter(n=>n.includes(q)).slice(0,5);if(!ns.length){hide();return}
      if(!box){box=document.createElement('div');box.className='cmn';el.parentElement.appendChild(box)}box.innerHTML=ns.map(n=>`<button data-n="${esc(n)}">@${esc(n)}</button>`).join('');
      box.querySelectorAll('button').forEach(b=>b.onmousedown=e=>{e.preventDefault();const s=el.selectionStart,before=el.value.slice(0,s).replace(/@([^\s@]{0,20})$/,'@'+b.dataset.n+' ');el.value=before+el.value.slice(s);el.selectionStart=el.selectionEnd=before.length;hide();el.focus()})});
    el.addEventListener('blur',()=>setTimeout(hide,150))}
  async function who(){const n=await needName();return n}
  async function send(t){t=(t||'').trim();if(!t)return;if(!canComment())return;const n=await who();if(!n)return;
    const c={id:uid_(),t:t.slice(0,2000),n,u:uid||'me',c:colorOf(uid||n),at:Date.now(),res:false,rep:[]};if(focusCard)c.card=focusCard;list().push(c);focusCard=null;tab='open';commit();toast('댓글을 남겼어요',{ms:1200})}
  async function reply(id,t){t=(t||'').trim();if(!t)return;const n=await who();if(!n)return;const c=list().find(x=>x.id===id);if(!c)return;(c.rep||(c.rep=[])).push({id:uid_(),t:t.slice(0,2000),n,u:uid||'me',c:colorOf(uid||n),at:Date.now()});commit()}
  const uid_=()=>typeof window.uid==='function'?window.uid():rid(10);
  function commit(){A().save();render();pins()}
  function open(card){ensure();panel.hidden=false;document.body.classList.add('cmopen');if(card)focusCard=card;render();setTimeout(()=>panel.querySelector('[data-new]')?.focus(),30)}
  function close(){if(!panel)return;panel.hidden=true;document.body.classList.remove('cmopen');focusCard=null}
  function toggle(){ensure();panel.hidden?open():close()}
  function pins(){const w=A()?.worldEl?.();if(!w)return;let L=w.querySelector('#cpins');if(!L){L=document.createElement('div');L.id='cpins';w.appendChild(L)}
    const by={};list().filter(c=>!c.res&&c.card).forEach(c=>{(by[c.card]=by[c.card]||[]).push(c)});
    L.innerHTML=Object.entries(by).map(([id,cs])=>{const b=A().box(id);if(!b)return '';return `<button class="cpin" data-pc="${id}" style="left:${b.x+b.w-6}px;top:${b.y-18}px" title="댓글 ${cs.length}개"><svg viewBox="0 0 20 20" width="14" height="14"><path d="M3 4h14v9H8l-4 3v-3H3z" fill="currentColor"/></svg>${cs.length}</button>`}).join('');
    L.querySelectorAll('[data-pc]').forEach(b=>{b.onpointerdown=e=>e.stopPropagation();b.onclick=e=>{e.stopPropagation();ensure();panel._hl=null;open();const first=list().find(c=>c.card===b.dataset.pc&&!c.res);if(first){panel._hl=first.id;render();panel.querySelector(`[data-cid="${first.id}"]`)?.scrollIntoView({block:'center'})}}})}
  function badge(){const b=document.querySelector('#achcm em');if(b){const n=list().filter(c=>!c.res).length;b.textContent=n||'';b.hidden=!n}}
  function refresh(){render();pins();badge()}
  const seen=new Set();function notify(c){if(seen.has(c.id+':'+(c.rep||[]).length))return;const k=c.id+':'+(c.rep||[]).length;seen.add(k);const me=myName();if(!me)return;
    const hit=[c,...(c.rep||[])].slice(-1)[0];if(!hit||hit.u===uid||Date.now()-hit.at>60000)return;if(hit.t.includes('@'+me))toast(`${hit.n}님이 댓글에서 회원님을 불렀어요`,{ms:4000,act:'보기',fn:()=>open()})}
  return {open,close,toggle,refresh,pins,notify}})();

/* ---------- 메뉴 · 시작 ---------- */
function cardMenu(its){if(!its||!its.length)return[];return[{t:'댓글 달기',i:'note',fn:()=>Cm.open(its[0].id)}]}
function mountUI(){const bar=document.querySelector('#obar');if(!bar||document.querySelector('#achshare'))return;
  const anchor=document.querySelector('#onew');
  const peersEl=document.createElement('div');peersEl.id='achpeers';peersEl.hidden=true;
  const cm=document.createElement('button');cm.id='achcm';cm.className='onew';cm.title='댓글';cm.innerHTML=`<svg viewBox="0 0 20 20" width="16" height="16"><path d="M3.5 4.5h13v8.5h-8l-4 3v-3h-1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span>댓글</span><em hidden></em>`;cm.onclick=()=>Cm.toggle();
  const sh=document.createElement('button');sh.id='achshare';sh.className='onew achsh';sh.title='공유 · 같이 쓰기';sh.innerHTML=`<svg viewBox="0 0 20 20" width="16" height="16"><circle cx="7" cy="7" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 16c.6-2.8 2.6-4.2 5-4.2s4.4 1.4 5 4.2M13 6.5a2.6 2.6 0 1 1 0 5.2M15 12.4c1.6.5 2.6 1.7 3 3.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>공유</span>`;sh.onclick=open;
  anchor.parentElement.insertBefore(peersEl,anchor);anchor.parentElement.insertBefore(cm,anchor);anchor.parentElement.insertBefore(sh,anchor);
  document.addEventListener('pointermove',e=>{const vp=A().vpEl();if(vp&&vp.contains(e.target))onMove(e)},{passive:true})}
async function boot(){let tries=0;while((!document.querySelector('#obar')||typeof Canvas==='undefined'||!A()?.vpEl?.()||!A().C())&&tries++<100)await new Promise(r=>setTimeout(r,100));
  mountUI();setInterval(()=>{mountUI();if(!room)Cm.pins()},2000);setInterval(()=>{const L=A()?.worldEl?.()?.querySelector('#cpins');if(L)L.style.setProperty('--z',A().cam().z)},250);
  const h=new URLSearchParams(location.hash.slice(1)),r=h.get('r');
  if(r){const kind=h.get('e')?'e':h.get('c')?'c':'v';await join(r,kind,h.get(kind)||null);return}
  const m=One.main();if(m&&m.room&&m.room.id){try{await start(m)}catch(e){console.warn(e);toast('공유 캔버스에 다시 연결하지 못했어요',{ms:3000})}}
  Cm.refresh()}
addEventListener('hashchange',()=>{const h=new URLSearchParams(location.hash.slice(1));if(h.get('r')&&(!room||room.id!==h.get('r')))boot()});
if(document.readyState==='loading')addEventListener('DOMContentLoaded',()=>setTimeout(boot,300));else setTimeout(boot,300);
return {open,join,leave,cardMenu,comments:Cm,state:()=>({room,uid,peers,members}),_last:()=>last};
})();
