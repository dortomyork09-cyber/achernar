/* Achernar — 수업 도구: 조원 구역 나누기 · 남의 구역 잠금 · 같이 보는 타이머
   공유 방이 있으면 조장(방을 만든 사람)이 정한 값이 모두에게 보여요. 방이 없으면 이 기기에서만. */
const Klass=(()=>{
const A=()=>typeof Canvas!=='undefined'?Canvas.api:null;
const CS=()=>typeof Collab!=='undefined'?Collab.state():{};
let meta=null,localTimer=null,tickT=0,lastStep=-1,warned=0;
const me=()=>CS().uid||null;
const inRoom=()=>!!CS().room;
const isOwner=()=>{const r=CS().room;return !r||r.role==='owner'};
const zlock=()=>!!(meta&&meta.zlock);
const timer=()=>inRoom()?(meta&&meta.timer)||null:localTimer;

/* ---------- 구역 ---------- */
function zoneOf(it){const a=A();if(!a)return null;const c=a.C();if(!c)return null;
  if(it.type==='frame'&&it.own)return it;const cx=it.x+(it.w||0)/2,cy=it.y+(it.h||60)/2;
  return c.items.find(f=>f.type==='frame'&&f.own&&f!==it&&cx>=f.x&&cx<=f.x+f.w&&cy>=f.y&&cy<=f.y+f.h)||null}
function blocked(it){if(!zlock()||!inRoom()||CS().room.role==='owner')return false;const z=zoneOf(it);if(!z||z.own===me())return false;
  const t=Date.now();if(t-warned>1500){warned=t;toast(`‘${z.ownN||'다른 조원'}’ 구역이에요 · 내 구역에서 작업해 주세요`,{ms:2200})}return true}
function paint(){veil();const u=me();document.querySelectorAll('.card.t-frame').forEach(el=>{const it=A()&&A().I?A().I(el.dataset.id):null;const own=it&&it.own;el.classList.toggle('zone',!!own);el.classList.toggle('mine',!!own&&own===u);
  let tag=el.querySelector('.ztag');if(own){if(!tag){tag=document.createElement('span');tag.className='ztag';el.appendChild(tag)}tag.textContent=(own===u?'내 구역':(it.ownN||'조원')+' 구역')+(zlock()&&own!==u&&!isOwner()?' · 잠김':'')}else if(tag)tag.remove()})}
async function makeZones(){const a=A();if(!a)return;One.home();await new Promise(r=>setTimeout(r,80));
  const mem=Object.entries(CS().members||{}).map(([u,p])=>({u,n:p.n||'조원'}));let list=mem;
  if(list.length<2){const v=await ask('몇 명이 함께하나요?',{sub:'구역을 그 수만큼 만들어요. 조원이 들어와서 ‘이 구역 맡기’를 누르면 이름이 붙어요',ph:'2 ~ 8',val:'4',ok:'만들기'});const n=Math.max(2,Math.min(8,parseInt(v,10)||0));if(!v||!n)return;
    list=[];if(mem[0])list.push(mem[0]);while(list.length<n)list.push({u:null,n:''})}
  const c=a.C();const xs=c.items.map(i=>i.x+(i.w||0)),ys=c.items.map(i=>i.y);const x0=c.items.length?Math.max(...xs)+160:-900,y0=c.items.length?Math.min(...ys):-400;
  const W=520,H=400,G=40,cols=list.length<=4?2:3;a.push();const made=[];
  list.forEach((m,i)=>{const x=x0+(i%cols)*(W+G),y=y0+Math.floor(i/cols)*(H+G);const f=a.mk('frame',x,y,{w:W,h:H,text:m.u?`${m.n} · 맡은 일`:`조원 ${i+1} · 맡은 일`,c:['l','y','p','m','o','s','w','l'][i%8]});if(m.u){f.own=m.u;f.ownN=m.n}made.push(f.id)});
  a.render();a.save();paint();setTimeout(()=>{try{a.setSel(made);a.fit()}catch(e){}},60);toast(`구역 ${list.length}개를 만들었어요 · 제목을 눌러 맡은 일을 적어 보세요`,{ms:3200})}
function claim(f,v){const a=A();a.push();if(v){f.own=me()||'local';f.ownN=(typeof Collab!=='undefined'&&Collab.name())||'나';const t=String(f.text||'');if(/^조원 \d+ · /.test(t))f.text=t.replace(/^조원 \d+/,f.ownN)}else{delete f.own;delete f.ownN}a.render();a.save();paint()}
function cardMenu(its){if(its.length!==1||its[0].type!=='frame')return[];const f=its[0],u=me();const out=[];
  if(!f.own)out.push({t:'이 구역 맡기',i:'user',fn:()=>claim(f,true)});
  else if(f.own===u||isOwner())out.push({t:'구역 주인 비우기',i:'user',fn:()=>claim(f,false)});return out}

/* ---------- 타이머 ---------- */
const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function stateOf(t){if(!t||!t.steps||!t.steps.length)return null;const now=t.pa||Date.now();let el=(now-t.t0)/1000;
  for(let i=0;i<t.steps.length;i++){const d=t.steps[i][1]*60;if(el<d)return{i,name:t.steps[i][0],left:d-el,dur:d,n:t.steps.length,paused:!!t.pa};el-=d}
  return{i:t.steps.length,done:true,n:t.steps.length}}
async function setTimer(t){if(inRoom()){if(!isOwner())return toast('타이머는 공유를 시작한 사람(조장)이 정해요');const ok=await Collab.setMeta({timer:t||null});if(!ok)toast('타이머를 바꾸지 못했어요');}else{localTimer=t;draw()}}
async function openTimer(){if(inRoom()&&!isOwner())return toast('타이머는 공유를 시작한 사람(조장)이 정해요',{ms:2600});
  const cur=timer();const def=cur?cur.steps.map(s=>s[0]+' '+s[1]).join('\n'):'자료 조사 15\n정리하기 10\n발표 준비 5';
  modal({title:'같이 보는 타이머',cls:'mid',html:`<p class="note" style="margin:0 0 10px">한 줄에 <b>단계 이름</b>과 <b>분</b>을 적어요. ${inRoom()?'공유 중인 모든 사람의 화면 위쪽에 같은 타이머가 떠요.':'지금은 이 기기에만 떠요. 공유를 시작하면 조원 모두에게 보여요.'}</p><textarea class="inp" id="ktsteps" rows="5" style="width:100%;font:inherit;resize:vertical">${esc(def)}</textarea>`,
    btns:[...(cur?[{t:'타이머 끄기',cls:'dg',fn:()=>setTimer(null)}]:[]),{t:'취소'},{t:'시작',cls:'pr',fn:()=>{const steps=document.querySelector('#ktsteps').value.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const m=l.match(/^(.*?)[\s:·-]*(\d+(?:\.\d+)?)\s*(?:분)?$/);return m?[m[1].trim()||'단계',Math.min(240,Math.max(.5,+m[2]))]:null}).filter(Boolean);
      if(!steps.length)return toast('예) 자료 조사 15 처럼 적어 주세요');setTimer({steps,t0:Date.now(),pa:null})}}]})}
function ctl(e){const t=timer();if(!t)return;if(inRoom()&&!isOwner())return;const r=e.currentTarget.getBoundingClientRect();const s=stateOf(t);
  menu(r.left,r.bottom+6,[{t:t.pa?'계속':'잠깐 멈추기',i:t.pa?'play':'clock',fn:()=>{if(t.pa)setTimer({...t,t0:t.t0+(Date.now()-t.pa),pa:null});else setTimer({...t,pa:Date.now()})}},
    ...(s&&!s.done&&s.i<t.steps.length-1?[{t:'다음 단계로',i:'chev',fn:()=>{let c=0;for(let i=0;i<=s.i;i++)c+=t.steps[i][1]*60e3;setTimer({...t,t0:(t.pa||Date.now())-c})}}]:[]),
    {t:'단계 바꾸기',i:'edit',fn:openTimer},{t:'타이머 끄기',i:'x',dg:1,fn:()=>setTimer(null)}])}
function beep(){try{const ac=new (window.AudioContext||window.webkitAudioContext)();[0,.18].forEach(d=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,ac.currentTime+d);g.gain.exponentialRampToValueAtTime(.18,ac.currentTime+d+.02);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d+.16);o.connect(g).connect(ac.destination);o.start(ac.currentTime+d);o.stop(ac.currentTime+d+.18)});setTimeout(()=>ac.close(),800)}catch(e){}}
function draw(){const t=timer();let el=document.querySelector('#ktimer');const s=stateOf(t);
  if(!s){if(el)el.remove();lastStep=-1;clearInterval(tickT);tickT=0;return}
  if(!el){el=document.createElement('button');el.id='ktimer';el.onclick=ctl;document.body.appendChild(el)}
  if(!tickT)tickT=setInterval(draw,500);
  if(s.done){el.className='done';el.innerHTML=`<b>모든 단계 끝</b><span>수고했어요</span>`;if(lastStep!==s.i){lastStep=s.i;beep();toast('타이머의 모든 단계가 끝났어요',{ms:3000})}return}
  if(lastStep!==-1&&lastStep!==s.i){beep();toast(`‘${s.name}’ 단계 시작이에요 (${Math.round(s.dur/60)}분)`,{ms:3000});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1200)}lastStep=s.i;
  el.className=(s.paused?'paused':'')+(s.left<60?' soon':'');el.title=inRoom()&&!isOwner()?'조장이 정한 타이머예요':'눌러서 멈추기 · 다음 단계 · 끄기';
  el.innerHTML=`<em>${s.i+1}/${s.n}</em><b>${esc(s.name)}</b><span>${s.paused?'멈춤 · ':''}${fmt(s.left)}</span><i style="--p:${(1-s.left/s.dur)*100}%"></i>`}

/* ---------- 내 생각 먼저 (서로 가리기) ---------- */
const mfOn=()=>!!(meta&&meta.mf)&&inRoom();
function mfInfo(){const a=A();if(!a||!a.C())return null;const t0=meta.mfAt||0,items=a.C().items||[];const wrote=new Set(items.filter(i=>i.by&&(i.bt||0)>=t0&&i.type!=='frame').map(i=>i.by));
  const mem=Object.keys(CS().members||{});return{t0,wrote,n:mem.length,mine:wrote.has(me())}}
function veil(){const on=mfOn();let pill=document.querySelector('#kmf');if(!on){document.querySelectorAll('.card.veil').forEach(e=>e.classList.remove('veil'));if(pill)pill.remove();return}
  const f=mfInfo();if(!f)return;const own=isOwner(),u=me();
  document.querySelectorAll('.card').forEach(el=>{const it=A().I(el.dataset.id);const v=!own&&!f.mine&&it&&it.by&&it.by!==u&&(it.bt||0)>=f.t0&&it.type!=='frame';el.classList.toggle('veil',!!v)});
  if(!pill){pill=document.createElement('button');pill.id='kmf';pill.onclick=()=>{if(isOwner())Collab.setMeta({mf:false}).then(()=>toast('모두의 생각을 펼쳤어요'))};document.body.appendChild(pill)}
  pill.innerHTML=`<b>내 생각 먼저</b><span>${f.n}명 중 ${f.wrote.size}명 적음</span>${own?'<em>눌러서 모두 펼치기</em>':f.mine?'<em>다른 생각이 보여요</em>':'<em>먼저 내 생각을 카드에 적어요</em>'}`}
setInterval(()=>{if(mfOn())veil()},1500);

/* ---------- 메뉴 ---------- */
function moreMenu(){return[{t:'조원 구역 나누기',i:'frame',fn:makeZones},{t:zlock()?'남의 구역 잠금 풀기':'남의 구역 잠그기',i:'lock',dis:!inRoom()&&'공유를 시작하면 쓸 수 있어요',fn:async()=>{if(!isOwner())return toast('공유를 시작한 사람(조장)만 바꿀 수 있어요');const v=!zlock();if(await Collab.setMeta({zlock:v})){toast(v?'이제 각자 자기 구역만 고칠 수 있어요':'모두가 모든 구역을 고칠 수 있어요')}}},{t:mfOn()?'내 생각 먼저 끄기 (모두 펼치기)':'내 생각 먼저 (서로 가리기)',i:'eye',dis:!inRoom()&&'공유를 시작하면 쓸 수 있어요',fn:async()=>{if(!isOwner())return toast('공유를 시작한 사람(조장)만 바꿀 수 있어요');const v=!mfOn();if(await Collab.setMeta(v?{mf:true,mfAt:Date.now()}:{mf:false}))toast(v?'이제부터 쓴 카드는 각자 자기 생각을 적기 전까지 서로 안 보여요':'모두의 생각을 펼쳤어요',{ms:3200})}},{t:'같이 보는 타이머',i:'clock',fn:openTimer}]}

addEventListener('ach-meta',e=>{meta=e.detail;draw();paint();veil()});
return{blocked,paint,cardMenu,moreMenu,makeZones,openTimer,_state:()=>({meta,t:timer()})}})();
