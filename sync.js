/* ULTIMATE NOTE — 클라우드 동기화 · 공유 · 댓글 (claude.ai에서 열었을 때만 켜져요) */
const Sync=(()=>{
let db=null,AS=null,CM=null,base='',st='local',T=null,pushed={},unsub=null,busy=false,warned={},ready=false;
const LIM=240*1024;
const docs=q=>{const a=q?.docs||q||[];return Array.isArray(a)?a:[...a]};
const dat=d=>typeof d?.data==='function'?d.data():(d?.data||d||{});
const did=d=>d?.id||d?.ref?.id||'';
function setSt(s){st=s;const e=$('#syncSt');if(e){e.textContent={local:'이 기기에만 저장',off:'동기화 꺼짐',on:'클라우드 동기화됨',busy:'동기화 중…',bad:'동기화 실패 · 기기엔 저장됨'}[s]||'';e.className='syncst '+s}}
function wait(p,ms=10000){return Promise.race([p,new Promise(r=>setTimeout(()=>r(null),ms))])}
async function start(){
  const cu=window.claude?.use;if(!cu){setSt('local');return}
  cu('assets').then(a=>{AS=a;if(a)upAll()},()=>{});
  cu('comments').then(c=>{CM=c;renderPanel?.()},()=>{});
  if(S.settings.mods?.sync===false){setSt('off');return}
  try{db=await wait(cu('db'));const user=await wait(cu('user'));if(!db||!user){db=null;setSt('local');return}
    const id=await user.id();if(!id){db=null;setSt('local');return}base='data/users/'+id;
    setSt('busy');await pull(true);ready=true;await push();listen();setSt('on')}catch(e){console.warn(e);db=null;setSt('bad')}}
async function pull(first){const q=await wait(db.collection(base).get());let ch=0;
  for(const d of docs(q)){const v=dat(d),k=did(d);
    if(k==='meta'){if(v.j){try{const m=JSON.parse(v.j);if((m.u||0)>(S.metaU||0)){S.tpls=m.tpls||S.tpls;S.snips=m.snips||S.snips;S.ws=m.ws||S.ws;S.assets={...(S.assets||{}),...(m.assets||{})};S.metaU=m.u;ch++}}catch(e){}}continue}
    if(!k.startsWith('p_'))continue;const pid=k.slice(2),loc=S.pages[pid];
    if(v.del){if(loc&&(loc.updated||0)<=(v.u||0)){delete S.pages[pid];ch++}pushed[pid]=v.u||0;continue}
    if(!loc||(v.u||0)>(loc.updated||0)){try{S.pages[pid]=JSON.parse(v.j);ch++}catch(e){}}pushed[pid]=v.u||0}
  if(ch){flush();renderSide();if(!first||route!=='home')render()}return ch}
function listen(){try{unsub?.();unsub=db.collection(base).onSnapshot(q=>{if(busy)return;const ch=q.docChanges?.()||[];let n=0,cur=false;
  ch.forEach(c=>{const d=c.doc,v=dat(d),k=did(d);if(!k.startsWith('p_'))return;const pid=k.slice(2),loc=S.pages[pid];if((v.u||0)<=(pushed[pid]||0))return;
    pushed[pid]=v.u||0;if(v.del){if(loc){delete S.pages[pid];n++}return}if(!loc||(v.u||0)>(loc.updated||0)){if(curPage()?.id===pid)cur=pid;else{try{S.pages[pid]=JSON.parse(v.j);n++}catch(e){}}}});
  if(n){flush();renderSide();if(!curPage())render()}
  if(cur)toast('다른 기기에서 이 문서가 바뀌었어요',{act:'불러오기',fn:async()=>{const d=await db.doc(base+'/p_'+cur).get();const v=dat(d);if(v.j){S.pages[cur]=JSON.parse(v.j);flush();render()}}})},()=>{})}catch(e){}}
function mark(){if(!db||!ready)return;clearTimeout(T);T=setTimeout(push,2500)}
async function push(){if(!db||busy)return;busy=true;let bad=0;
  try{for(const p of Object.values(S.pages)){if((pushed[p.id]||0)>=(p.updated||0))continue;const j=JSON.stringify(p);
      if(j.length>LIM){if(!warned[p.id]){warned[p.id]=1;toast(`‘${pTitle(p)}’은 너무 커서 이 기기에만 저장돼요`)}continue}
      try{await db.doc(base+'/p_'+p.id).set({j,u:p.updated||now(),t:pTitle(p)});pushed[p.id]=p.updated||now()}catch(e){bad++}}
    for(const id of Object.keys(pushed))if(!S.pages[id]&&pushed[id]>=0){try{await db.doc(base+'/p_'+id).set({del:true,u:now()});pushed[id]=-1}catch(e){bad++}}
    const mj=JSON.stringify({tpls:S.tpls,snips:S.snips,ws:S.ws,assets:S.assets,u:S.metaU||0});if(mj!==pushed.__m&&mj.length<LIM){S.metaU=now();const m2=JSON.stringify({tpls:S.tpls,snips:S.snips,ws:S.ws,assets:S.assets,u:S.metaU});try{await db.doc(base+'/meta').set({j:m2});pushed.__m=JSON.stringify({tpls:S.tpls,snips:S.snips,ws:S.ws,assets:S.assets,u:S.metaU})}catch(e){bad++}}
    setSt(bad?'bad':'on')}finally{busy=false}}
/* 첨부 파일: 클라우드에 올려 다른 기기에서도 보이게 */
async function up(id){if(!AS||S.assets?.[id]||!IDB)return;const f=await tx('blobs','readonly',s=>s.get(id));if(!f||f.size>20*1024*1024)return;try{const r=await AS.upload(f);if(r?.id){(S.assets||(S.assets={}))[id]=r.id;save()}}catch(e){}}
async function upAll(){if(!AS)return;for(const id of Object.keys(blobs))await up(id)}
/* 공유: 이 아티팩트를 볼 수 있는 사람에게 문서 사본을 보여줘요 */
async function share(p){if(!db)return toast('공유는 claude.ai에서 열고 로그인했을 때 쓸 수 있어요');const j=JSON.stringify(p);if(j.length>LIM)return toast('문서가 너무 커서 공유할 수 없어요');
  try{await db.doc('shared/'+p.id).set({j,t:pTitle(p),u:now()});p.sharedAt=now();save();toast('공유했어요 · 이 노트 링크를 받은 사람이 ‘공유된 문서’에서 볼 수 있어요')}catch(e){toast('공유하지 못했어요 (권한이 없을 수 있어요)')}}
async function unshare(p){if(!db)return;try{await db.doc('shared/'+p.id).delete();delete p.sharedAt;save();toast('공유를 멈췄어요')}catch(e){toast('공유를 멈추지 못했어요')}}
async function listShared(){if(!db)return null;try{const q=await wait(db.collection('shared').get());return docs(q).map(d=>({id:did(d),...dat(d)})).filter(x=>x.j).sort((a,b)=>(b.u||0)-(a.u||0))}catch(e){return null}}
function canComment(){return!!CM?.openComposer}
function comment(el){if(!CM?.openComposer)return toast('댓글은 claude.ai에서 공유된 노트를 열었을 때 쓸 수 있어요');try{CM.openComposer({element:el})}catch(e){toast('댓글 창을 열지 못했어요')}}
async function toggle(on){S.settings.mods.sync=on;save();if(on){await start()}else{unsub?.();unsub=null;db=null;ready=false;setSt('off')}}
return{start,mark,up,share,unshare,listShared,canComment,comment,toggle,status:()=>st,on:()=>!!db,setSt}})();
