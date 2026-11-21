/* Achernar — 더 다양한 기능 (캔버스 하나 안에서) */
const Feat=(()=>{
const ap=()=>Canvas.api;const txt=i=>{const d=document.createElement('div');d.innerHTML=i.text||i.title||i.cap||i.name||(i.checks||[]).map(c=>c.t).join(' ')||(i.rows||[]).flat().join(' ')||'';return d.textContent.trim()};
const at=(pt,fn)=>{One.home();setTimeout(()=>{const a=ap();a.push();const r=fn(a,pt||a.center());a.render();a.save();if(r?.id)a.setSel([r.id])},120)};

/* 창작 질문 */
const QS=['오늘 가장 오래 생각한 것은?','10년 뒤의 내가 지금의 나에게 할 말은?','이 아이디어를 반대로 하면?','돈이 무한하다면 무엇을 만들까?','가장 좋아하는 게임의 규칙을 내 일에 적용하면?','지금 가장 불편한 것 3가지는?','친구 5명에게 동시에 보여 주고 싶은 것은?','이걸 노래로 만들면 제목은?','실패해도 괜찮다면 무엇을 해 볼까?','이 문제를 초등학생은 어떻게 풀까?','오늘 본 것 중 가장 이상한 것은?','이걸 1분 안에 설명하면?','세상에 없는 앱 하나를 만든다면?','지금 하는 일의 가장 작은 다음 한 걸음은?','내가 좋아하는 것 두 개를 섞으면?'];
function question(pt){at(pt,(a,[x,y])=>a.mk('sticky',x-120,y-80,{w:250,h:160,c:'l',text:`<b>💭 ${QS[Math.floor(Math.random()*QS.length)]}</b><br>`}))}

/* 오늘 구역 */
function todayZone(pt){at(pt,(a,[x,y])=>{const d=new Date();const t=`📅 ${d.getMonth()+1}월 ${d.getDate()}일 ${'일월화수목금토'[d.getDay()]}요일`;const f=a.mk('frame',x-260,y-170,{w:520,h:340,text:t,c:'s'});const n=a.mk('text',x-230,y-110,{w:300,text:'오늘 한 일 · 생각',h:0});return f})}

/* 사진 찍기 */
async function camera(pt){const i=document.createElement('input');i.type='file';i.accept='image/*';i.capture='environment';i.onchange=()=>{const[x,y]=pt||ap().center();if(i.files.length){One.home();setTimeout(()=>ap().files([...i.files],x,y),120)}};i.click()}

/* 음성 메모 (녹음) */
let rec=null;
async function voice(pt){if(rec){rec.stop();return}let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return toast('마이크를 쓸 수 없어요 · 브라우저에서 마이크를 허용해 주세요')}
  const ch=[];rec=new MediaRecorder(st);rec.ondataavailable=e=>ch.push(e.data);const pos=pt||ap().center();
  rec.onstop=()=>{st.getTracks().forEach(t=>t.stop());rec=null;$('#recbar')?.remove();const b=new Blob(ch,{type:ch[0]?.type||'audio/webm'});const f=new File([b],`음성 메모 ${new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}.webm`,{type:b.type});One.home();setTimeout(()=>ap().files([f],pos[0],pos[1]),120);toast('음성 메모를 캔버스에 붙였어요')};
  rec.start();const t0=Date.now();document.body.insertAdjacentHTML('beforeend',`<div id="recbar"><i></i><span id="rect">0:00</span><b>녹음 중</b><button class="btn sm pr">멈추고 붙이기</button></div>`);$('#recbar button').onclick=()=>rec?.stop();
  const tick=setInterval(()=>{if(!rec)return clearInterval(tick);const s=Math.floor((Date.now()-t0)/1000);$('#rect').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`},500)}

/* 받아쓰기 */
function dictate(pt){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return toast('이 브라우저는 받아쓰기를 지원하지 않아요 · 크롬이나 엣지에서 써 보세요');
  const r=new SR();r.lang=S.settings.lang==='en'?'en-US':'ko-KR';r.interimResults=true;r.continuous=true;let final='';const pos=pt||ap().center();
  document.body.insertAdjacentHTML('beforeend',`<div id="recbar" class="dict"><i></i><span id="dictT">말해 보세요…</span><button class="btn sm pr">끝내고 붙이기</button></div>`);
  r.onresult=e=>{let tmp='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript+' ';else tmp+=e.results[i][0].transcript}const el=$('#dictT');if(el)el.textContent=(final+tmp)||'말해 보세요…'};
  const end=()=>{$('#recbar')?.remove();if(final.trim())at(pos,(a,[x,y])=>a.mk('sticky',x-130,y-80,{w:280,h:170,c:'y',text:'🎙 '+esc(final.trim())}));else toast('받아쓴 글이 없어요')};
  r.onerror=e=>{$('#recbar')?.remove();toast(e.error==='not-allowed'?'마이크 권한이 없어요':'받아쓰기를 멈췄어요')};r.onend=()=>{if($('#recbar'))end()};$('#recbar button').onclick=()=>r.stop();try{r.start()}catch(e){$('#recbar')?.remove();toast('받아쓰기를 시작하지 못했어요')}}

/* 찾기 → 날아가기 */
function find(){One.home();setTimeout(()=>{const its=ap().C().items;modal({title:'캔버스에서 찾기',html:`<input class="inp big" id="fq" placeholder="카드 안의 글자" autocomplete="off"><div class="fres" id="fres"></div>`,onOpen:()=>{const q=$('#fq'),r=$('#fres');const draw=()=>{const v=q.value.trim().toLowerCase();const l=v?its.filter(i=>txt(i).toLowerCase().includes(v)).slice(0,30):[];r.innerHTML=v?(l.length?l.map(i=>`<button data-fid="${i.id}"><small>${esc(i.type)}</small>${esc(txt(i).slice(0,80))}</button>`).join(''):'<p class="note">없어요</p>'):''};q.oninput=draw;q.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing)r.querySelector('button')?.click()};setTimeout(()=>q.focus(),40);
  r.onclick=e=>{const b=e.target.closest('[data-fid]');if(!b)return;closeModal();fly(b.dataset.fid)}}})},120)}
function fly(id){ap().focus(id);ap().setSel([id]);setTimeout(()=>{const el=document.querySelector(`.card[data-id="${id}"]`);el?.classList.add('flash');setTimeout(()=>el?.classList.remove('flash'),1600)},450)}

/* 구역 이동 */
function zones(btn){One.home();setTimeout(()=>{const fr=ap().C().items.filter(i=>i.type==='frame');if(!fr.length)return toast('프레임(구역)이 아직 없어요 · / → 프레임 또는 오늘 구역으로 만들어요');const r=(btn||document.body).getBoundingClientRect();
  menu(Math.max(10,r.right-260),r.bottom+6,[{h:'구역으로 이동'},...fr.map(f=>({t:txt(f)||'이름 없는 구역',i:'frame',fn:()=>fly(f.id)}))])},120)}

/* 자동 정리 (격자) */
function arrange(){One.home();setTimeout(()=>{const a=ap();let its=Canvas.sel();const all=!its.length;if(all)its=a.C().items.filter(i=>i.type!=='frame');if(its.length<2)return toast('정리할 카드가 2개 이상 있어야 해요');a.push();
  const B=its.map(i=>({i,b:a.box(i.id)||{x:i.x,y:i.y,w:i.w||200,h:i.h||120}})).sort((p,q)=>(p.b.y-q.b.y)||(p.b.x-q.b.x));const cols=Math.ceil(Math.sqrt(B.length*1.6));const x0=Math.min(...B.map(o=>o.b.x)),y0=Math.min(...B.map(o=>o.b.y));
  const cw=Math.max(...B.map(o=>o.b.w))+40;let rowH=0,y=y0;B.forEach((o,k)=>{const c=k%cols;if(c===0&&k){y+=rowH+40;rowH=0}o.i.x=x0+c*cw;o.i.y=y;rowH=Math.max(rowH,o.b.h)});a.render();a.save();toast(`${B.length}개를 줄 맞춰 정리했어요 · Ctrl+Z로 되돌릴 수 있어요`)},120)}

/* 발표 모드 */
let pres=null;
function present(){if(typeof DocPPT!=='undefined')return DocPPT.present();One.home();setTimeout(()=>{const fr=ap().C().items.filter(i=>i.type==='frame').sort((p,q)=>(Math.round(p.y/200)-Math.round(q.y/200))||(p.x-q.x));if(!fr.length)return toast('발표하려면 프레임(구역)을 만들어 주세요 · 프레임 하나가 한 장이에요');
  pres={fr,i:0};document.body.classList.add('presenting');document.body.insertAdjacentHTML('beforeend',`<div id="presbar"><button data-pv="-1">‹</button><span id="presn"></span><button data-pv="1">›</button><button data-pv="x">끝내기</button></div>`);
  $('#presbar').onclick=e=>{const v=e.target.closest('[data-pv]')?.dataset.pv;if(v==='x')stop();else if(v)step(+v)};show()},120)}
function show(){if(!pres)return;const f=pres.fr[pres.i];ap().setSel([]);ap().focus(f.id);$('#presn').textContent=`${pres.i+1} / ${pres.fr.length} · ${txt(f)||''}`}
function step(d){if(!pres)return;pres.i=Math.max(0,Math.min(pres.fr.length-1,pres.i+d));show()}
function stop(){pres=null;document.body.classList.remove('presenting');$('#presbar')?.remove();ap().fit()}

/* 집중 타이머 */
let tm=null;
function timer(){if(tm){clearInterval(tm.h);tm=null;$('#tmr')?.remove();return toast('타이머를 껐어요')}menu(innerWidth/2-110,80,[{h:'집중 타이머'},...[[5,'5분'],[15,'15분'],[25,'25분 (뽀모도로)'],[50,'50분']].map(([m,n])=>({t:n,i:'clock',fn:()=>startT(m)}))])}
function startT(m){const end=Date.now()+m*60000;document.body.insertAdjacentHTML('beforeend',`<div id="tmr" title="누르면 끄기"><i></i><b id="tmrv"></b></div>`);$('#tmr').onclick=()=>timer();
  tm={h:setInterval(()=>{const s=Math.max(0,Math.round((end-Date.now())/1000));const el=$('#tmrv');if(el)el.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;const bar=$('#tmr i');if(bar)bar.style.width=(100-s/(m*60)*100)+'%';if(!s){clearInterval(tm.h);tm=null;$('#tmr')?.remove();toast(`⏰ ${m}분 끝! 잠깐 쉬어요`);try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.08;o.start();o.stop(c.currentTime+.4)}catch(e){}}},500)}}

/* 자동 저장 시계 (30분마다) */
function autoSaveLoop(){setInterval(async()=>{if(!One.on()||document.hidden)return;const m=One.main();if(!m.cv.items.length)return;const l=await One.list();const last=l.find(x=>x.auto);if(last&&last.t>m.updated)return;if(last&&now()-last.t<30*60000)return;
  const it=await One.snap('자동 저장 · '+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}));const l2=await One.list();const x=l2.find(y=>y.id===it.id);if(x){x.auto=1;const autos=l2.filter(y=>y.auto);const keep=new Set(autos.slice(0,6).map(y=>y.id));await One.put(l2.filter(y=>!y.auto||keep.has(y.id)))}},60000)}

/* 저장 비교 */
async function compare(pick){if(typeof pick!=='string')pick=null;const l=await One.list();if(!l.length)return toast('저장한 게 아직 없어요');const m=One.main();
  modal({title:'지금과 비교하기',html:`<p class="note" style="margin-top:0">저장 하나를 고르면 그때와 지금 무엇이 달라졌는지 알려 줘요.</p><div class="fres">${l.slice(0,20).map(x=>`<button data-cid="${x.id}"><small>${new Date(x.t).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</small>${esc(x.name)}</button>`).join('')}</div><div id="cmpres"></div>`,
   onOpen:()=>{if(pick)setTimeout(()=>document.querySelector(`#mbody [data-cid="${pick}"]`)?.click(),30);$('#mbody').onclick=e=>{const b=e.target.closest('[data-cid]');if(!b)return;const x=l.find(y=>y.id===b.dataset.cid);const old=new Map(x.cv.items.map(i=>[i.id,i])),cur=new Map(m.cv.items.map(i=>[i.id,i]));
     const add=[...cur.values()].filter(i=>!old.has(i.id)),del=[...old.values()].filter(i=>!cur.has(i.id)),chg=[...cur.values()].filter(i=>old.has(i.id)&&txt(old.get(i.id))!==txt(i));
     const li=(a,c)=>a.slice(0,12).map(i=>`<div class="cmp ${c}">${esc(txt(i).slice(0,70)||i.type)}</div>`).join('');
     $('#cmpres').innerHTML=`<h6 class="osh">‘${esc(x.name)}’ 이후</h6><div class="cmpg"><div><b class="cg">+ 새로 생김 ${add.length}</b>${li(add,'cg')}</div><div><b class="cy">✎ 바뀜 ${chg.length}</b>${li(chg,'cy')}</div><div><b class="cr">− 사라짐 ${del.length}</b>${li(del,'cr')}</div></div>`;
     m.cv.items.forEach(i=>{const el=document.querySelector(`.card[data-id="${i.id}"]`);el?.classList.remove('dnew','dchg');if(add.includes(i))el?.classList.add('dnew');if(chg.includes(i))el?.classList.add('dchg')})}},onClose:()=>setTimeout(()=>document.querySelectorAll('.card.dnew,.card.dchg').forEach(e=>{e.classList.remove('dnew','dchg')}),6000)})}

function menu2(pt){return[...(typeof DocPPT!=='undefined'?DocPPT.addMenu(pt):[]),...World.addMenu(pt),...Mind.addMenu(pt),{t:'📷 사진 찍기',i:'image',fn:()=>camera(pt)},{t:'🎙 음성 메모 (녹음)',i:'music',fn:()=>voice(pt)}]}
function tools(){return[{t:'🔎 캔버스에서 찾기',i:'search',k:'Ctrl F',fn:find},{t:'🧭 구역으로 이동',i:'frame',fn:()=>zones($('#omore'))},{t:'🧹 자동 정리 (줄 맞추기)',i:'grid',fn:arrange},{t:'▶ 발표 모드',i:'board',fn:present},{t:'⏱ 집중 타이머',i:'clock',fn:timer},{t:'🕑 저장과 지금 비교',i:'history',fn:compare}]}
function init(){autoSaveLoop();addEventListener('keydown',e=>{if(!One.on())return;const ed=document.activeElement&&(document.activeElement.isContentEditable||/INPUT|TEXTAREA/.test(document.activeElement.tagName));
  if(pres){if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();e.stopPropagation();step(1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();e.stopPropagation();step(-1)}else if(e.key==='Escape'){e.stopPropagation();stop()}return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'&&!ed&&curPage()?.id===S.main){e.preventDefault();find()}},true)}
return{init,menu:menu2,tools,find,fly,arrange,present,timer,voice,dictate,camera,question,todayZone,compare,zones}})();
