/* Achernar — 기기 간 저장
   로그인하면 지금 캔버스와 저장 화면의 캔버스를 Firebase(cloud/내 uid)에 올리고, 다른 기기와 맞춰요.
   - 지금 캔버스: 계정마다 하나(cloud/uid/main). 다른 기기에서 고치면 바로 받아요.
   - 저장 화면 목록: 기기끼리 합쳐요. 지우면 다른 기기에서도 지워져요.
   - 두 기기에서 동시에 고친 경우: 덮어쓰지 않고 상대 쪽 내용을 저장 화면에 사본으로 남겨요.
   - 사진: 작게 줄여서(JPEG) 같이 올려요. 동영상·큰 파일은 이 기기에만. */
const Cloud=(()=>{
let db=null,me=null,base='',on=false,idx={},timer=null,busy=false,online=true,conRef=null,idxRef=null,first=false,queue=Promise.resolve();
const A=()=>typeof Canvas!=='undefined'?Canvas.api:null;
const CM=()=>S.cloudMeta||(S.cloudMeta={});           // {uid, saves:{id:sig}, bl:{id:1|'skip'}}
const isEmpty=cv=>!cv||(!(cv.items||[]).length&&!(cv.strokes||[]).length);
const rev=()=>Date.now()*1000+Math.floor(Math.random()*1000);
const strip=cv=>{const o=JSON.parse(JSON.stringify(cv||{}));delete o.view;return o};
const run=f=>(queue=queue.then(f).catch(e=>{console.warn('cloud',e);st('bad')}));

/* ---------- 상태 표시 ---------- */
function st(k){const e=document.querySelector('#ocloud');if(!e)return;const T={off:'',ok:'기기 간 저장됨',busy:'올리는 중…',wait:'연결되면 올려요',bad:'기기 간 저장 실패 · 이 기기엔 저장됨'};
  e.textContent=T[k]||'';e.dataset.k=k;e.hidden=!T[k];e.title=k==='ok'?'로그인한 다른 기기에서도 이 캔버스가 이어져요':''}
function ensureUI(){const o=document.querySelector('#ost');if(o&&!document.querySelector('#ocloud')){o.insertAdjacentHTML('afterend','<span class="ocloud" id="ocloud" hidden></span>')}}

/* ---------- 사진 ---------- */
const IDRE=/^[A-Za-z0-9_-]{6,40}$/;
function blobIds(cv){const s=new Set();JSON.stringify(cv||{}).replace(/"(?:blob|src|img)":"([^"]+)"/g,(_,i)=>{if(IDRE.test(i))s.add(i)});return[...s]}
async function shrink(b){try{const bm=await createImageBitmap(b);for(const[mx,q]of[[1280,.72],[960,.62],[720,.55]]){const sc=Math.min(1,mx/Math.max(bm.width,bm.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bm.width*sc));c.height=Math.max(1,Math.round(bm.height*sc));const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(bm,0,0,c.width,c.height);const d=c.toDataURL('image/jpeg',q);if(d.length<560000)return d}}catch(e){}return null}
async function blobsUp(cv){const M=CM();M.bl=M.bl||{};for(const id of blobIds(cv)){if(M.bl[id])continue;const b=await tx('blobs','readonly',s=>s.get(id));if(!b)continue;
  if(!/^image\//.test(b.type||'')||/svg/.test(b.type)){M.bl[id]='skip';continue}const d=await shrink(b);if(!d){M.bl[id]='skip';continue}
  await db.ref(base+'/bl/'+id).set({n:(blobs[id]&&blobs[id].name)||'',d});M.bl[id]=1}}
async function blobsDown(cv){let got=0;for(const id of blobIds(cv)){if(blobs[id])continue;try{const v=(await db.ref(base+'/bl/'+id).once('value')).val();if(!v||!v.d)continue;const bl=await (await fetch(v.d)).blob();await tx('blobs','readwrite',s=>s.put(bl,id));blobs[id]={url:URL.createObjectURL(bl),name:v.n||'사진',type:bl.type,size:bl.size};CM().bl[id]=1;got++}catch(e){}}
  if(got){try{A()&&A().render()}catch(e){}}}

/* ---------- 지금 캔버스 ---------- */
function mainP(){return One.main()}
function dirty(p){return p.updated!==p.csync}
async function upMain(){const p=mainP();if(!p.cid)return;const at=p.updated;if(isEmpty(p.cv)&&!idx[p.cid])return;
  st('busy');const body={t:p.title||'',cv:strip(p.cv),at};await blobsUp(body.cv);const r=rev();
  await db.ref(base+'/cv/'+p.cid).set(JSON.stringify(body));await db.ref(base).update({['idx/'+p.cid]:{t:body.t,r,at,k:'main',n:(p.cv.items||[]).length},main:p.cid});
  p.crev=r;if(p.updated===at)p.csync=at;idx[p.cid]={...(idx[p.cid]||{}),r,k:'main'};save();st('ok')}
async function fetchCv(cid){const v=(await db.ref(base+'/cv/'+cid).once('value')).val();if(!v)return null;try{return JSON.parse(v)}catch(e){return null}}
async function downMain(cid,r){const o=await fetchCv(cid);if(!o)return;const p=mainP();const view=p.cv&&p.cv.view;
  p.cv={items:[],links:[],strokes:[],grid:true,...o.cv,view};p.title=o.t||'';p.cid=cid;p.crev=r;p.updated=now();p.csync=p.updated;save();
  try{if(curPage()&&curPage().id===p.id){A()&&A().render();const t=document.querySelector('#otitle');if(t&&document.activeElement!==t)t.textContent=p.title}}catch(e){}
  blobsDown(p.cv)}
/* 상대 쪽 내용을 저장 화면에 사본으로 */
async function keepCopy(o,label){if(!o||isEmpty(o.cv))return;const l=await One.list();const it={id:uid(),name:(o.t||'캔버스')+' ('+label+')',t:now(),n:(o.cv.items||[]).length,cv:o.cv,thumb:''};l.unshift(it);await One.put(l.slice(0,40));blobsDown(o.cv)}

/* ---------- 저장 화면 목록 ---------- */
const sig=x=>[x.name,x.t,x.n].join('|');
async function smallThumb(u){if(!u)return'';try{const b=await (await fetch(u)).blob();const bm=await createImageBitmap(b);const sc=Math.min(1,320/bm.width);const c=document.createElement('canvas');c.width=Math.round(bm.width*sc);c.height=Math.round(bm.height*sc);c.getContext('2d').drawImage(bm,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.7)}catch(e){return''}}
async function syncSaves(){const M=CM();M.saves=M.saves||{};const l=await One.list();const ids=new Set(l.map(x=>x.id));
  for(const x of l){if(M.saves[x.id]==='skip'||M.saves[x.id]===sig(x))continue;st('busy');await blobsUp(x.cv);const r=rev();
    await db.ref(base+'/cv/'+x.id).set(JSON.stringify({t:x.name,cv:strip(x.cv),at:x.t,th:await smallThumb(x.thumb)}));await db.ref(base+'/idx/'+x.id).set({t:x.name,r,at:x.t,k:'save',n:x.n||0});M.saves[x.id]=sig(x);idx[x.id]={r,k:'save'};save()}
  for(const id of Object.keys(M.saves)){if(ids.has(id)||M.saves[id]==='skip'){if(!ids.has(id))delete M.saves[id];continue}
    st('busy');await db.ref(base).update({['idx/'+id]:{r:rev(),k:'save',del:1},['cv/'+id]:null});delete M.saves[id];save()}
  st('ok')}
async function pullSave(cid,e){const M=CM();M.saves=M.saves||{};const l=await One.list();const has=l.find(x=>x.id===cid);
  if(e.del){if(has){await One.put(l.filter(x=>x.id!==cid))}delete M.saves[cid];save();return}
  if(has&&M.saves[cid]===sig({name:e.t,t:e.at,n:e.n}))return;const o=await fetchCv(cid);if(!o)return;
  const it={id:cid,name:o.t||'저장',t:o.at||now(),n:(o.cv.items||[]).length,cv:o.cv,thumb:o.th||(has&&has.thumb)||''};
  const nl=[it,...l.filter(x=>x.id!==cid)].sort((a,b)=>b.t-a.t).slice(0,40);await One.put(nl);M.saves[cid]=sig(it);save();blobsDown(o.cv)}

/* ---------- 처음 연결 ---------- */
async function link(){const M=CM();const sw=M.uid&&M.uid!==me;   // 다른 계정이 쓰던 기기
  if(M.uid!==me){const l=await One.list();M.saves={};if(sw)l.forEach(x=>M.saves[x.id]='skip');M.bl={};M.uid=me;const p=mainP();delete p.cid;delete p.crev;delete p.csync;first=true;save()}
  const p=mainP();if(p.cid)return;
  const cm=(await db.ref(base+'/main').once('value')).val();const e=cm&&idx[cm];
  if(!cm||!e||e.del){p.cid=p.id;p.csync=null;return}
  if(isEmpty(p.cv)){await downMain(cm,e.r);toast('다른 기기에서 쓰던 캔버스를 열었어요',{ms:3200});return}
  const o=await fetchCv(cm);const nm=esc((o&&o.t)||'캔버스'),n=o?(o.cv.items||[]).length:0;
  const open=await confirmDlg('다른 기기에서 쓰던 캔버스가 있어요',`‘${nm}’(카드 ${n}개)를 열까요?<br>지금 이 기기의 캔버스도 저장 화면에 보관해 둘게요. 아무것도 사라지지 않아요.`,'그걸 열기');
  if(open){await One.snap((p.title||'이 기기 캔버스')+' (이 기기)');await downMain(cm,e.r)}
  else{await keepCopy(o,'다른 기기');p.cid=cm;p.crev=e.r;p.csync=null;save()}}

/* ---------- 다른 기기에서 바뀐 것 받기 ---------- */
function onIdx(snap){const cid=snap.key,e=snap.val();if(!cid||!e)return;const old=idx[cid];idx[cid]=e;if(old&&old.r===e.r)return;
  run(async()=>{const p=mainP();
    if(e.k==='main'){if(cid!==p.cid||e.r===p.crev)return;
      if(p.room&&typeof Collab!=='undefined'&&Collab.state().room)return;   // 같이 쓰는 중이면 공유 동기화가 맡아요
      if(!dirty(p))return downMain(cid,e.r);
      const o=await fetchCv(cid);await keepCopy(o,'다른 기기 '+new Date().toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'}));toast('다른 기기에서 같은 캔버스를 고쳤어요 · 그쪽 내용은 저장 화면에 사본으로 보관했어요',{ms:4200});return upMain()}
    if(e.k==='save')return pullSave(cid,e)})}

/* ---------- 시작 · 멈춤 ---------- */
async function start(u){if(on&&me===u)return;stop();try{if(typeof Collab==='undefined')return;await Collab.connect();const h=Collab.fb();db=h.db;me=h.uid;if(!db||!me||me!==u)return}catch(e){return}
  base='cloud/'+me;on=true;ensureUI();st('busy');
  try{idx=(await db.ref(base+'/idx').once('value')).val()||{}}catch(e){st('bad');on=false;return}
  await run(async()=>{await link();const p=mainP();
    for(const[cid,e]of Object.entries(idx)){if(e.k==='save')await pullSave(cid,e)}
    if(p.cid&&idx[p.cid]&&!idx[p.cid].del&&idx[p.cid].r!==p.crev&&!dirty(p))await downMain(p.cid,idx[p.cid].r);
    if(dirty(p))await upMain();await syncSaves();
    if(first){first=false;toast('이제 로그인한 다른 기기에서도 캔버스가 이어져요',{ms:3200})}});
  idxRef=db.ref(base+'/idx');idxRef.on('child_added',onIdx);idxRef.on('child_changed',onIdx);
  conRef=db.ref('.info/connected');conRef.on('value',s=>{online=!!s.val();if(on)st(online?(busy?'busy':'ok'):'wait')});
  timer=setInterval(tick,3000)}
function stop(){if(timer)clearInterval(timer);timer=null;try{idxRef&&idxRef.off()}catch(e){}try{conRef&&conRef.off()}catch(e){}idxRef=conRef=null;on=false;st('off')}
let savesDirty=true;
if(typeof One!=='undefined'&&One.put&&!One.put.__c){const op=One.put;One.put=async l=>{const r=await op(l);savesDirty=true;return r};One.put.__c=1}
async function tick(){if(!on||busy)return;if(!online){st('wait');return}busy=true;
  try{await run(async()=>{const p=mainP();if(!p.cid)p.cid=p.id;if(dirty(p))await upMain();if(savesDirty){savesDirty=false;await syncSaves()}})}finally{busy=false}}

addEventListener('ach-auth',e=>{const u=e.detail&&e.detail.uid;if(u)start(u);else stop()});
return{start,stop,state:()=>({on,uid:me,online}),_tick:tick}})();
