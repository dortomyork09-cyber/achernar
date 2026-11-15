/* MINDSPACE — 창작 확장: 변신 · 만약에 · 믹서 · 타임캡슐 · 분위기 · 스토리 지도 · 색상 연구실 · 기억 타임라인 · 영감의 벽 · 낙서→다이어그램 · 도구 카드 */
const MS2=(()=>{
const A=()=>Canvas.api;
const txt=it=>strip(it.text||it.title||it.cap||it.name||(it.checks||[]).map(c=>c.t).join(' ')||(it.rows||[]).flat().join(' ')||'').trim();
const strip2=h=>{const d=document.createElement('div');d.innerHTML=h||'';return d.textContent||''};
const strip=strip2;
const dateAdd=(d,n)=>{const x=new Date(d+'T00:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const sortPos=its=>[...its].sort((a,b)=>(a.y-b.y)||(a.x-b.x));

/* ---------- 생각 변신 ---------- */
const MORPHN={mind:'마인드맵',check:'체크리스트',time:'타임라인',story:'스토리보드',table:'표'};const MORPH=[['mind','마인드맵','node','가운데 생각에서 가지로'],['check','체크리스트','todo','할 일 목록 노트로'],['time','타임라인','history','날짜 막대로 (하루씩)'],['story','스토리보드','board','장면 카드로'],['table','표','table','한 줄에 하나씩']];
function morph(its){const items=sortPos(its).map(txt).filter(Boolean);if(!items.length)return toast('글이 있는 카드를 골라 주세요');let pick='mind';
  const src=A().page();const prev=()=>{const L=items.map(esc);
    if(pick==='mind')return `<div class="mpv mind"><span class="mc">${esc(pTitle(src)||'중심')}</span><div>${L.map(x=>`<span>${x}</span>`).join('')}</div></div>`;
    if(pick==='check')return `<div class="mpv">${L.map(x=>`<div>☐ ${x}</div>`).join('')}</div>`;
    if(pick==='time')return `<div class="mpv">${L.map((x,i)=>`<div><small>${dateAdd(today(),i).slice(5)}</small><i style="width:${40+i*8}%">${x}</i></div>`).join('')}</div>`;
    if(pick==='story')return `<div class="mpv story">${L.map((x,i)=>`<div><small>장면 ${i+1}</small>${x}</div>`).join('')}</div>`;
    return `<table class="mpv tb"><tr><th>#</th><th>내용</th></tr>${L.map((x,i)=>`<tr><td>${i+1}</td><td>${x}</td></tr>`).join('')}</table>`};
  modal({title:'✨ 생각 변신',cls:'mid',html:`<p class="note" style="margin-top:0">고른 카드 ${items.length}개를 다른 모양으로 바꿔요. 원본은 그대로 두고, 새 공간이 원본과 연결돼요.</p><div class="mtabs">${MORPH.map(([k,n,i])=>`<button data-mo="${k}" class="${k===pick?'on':''}">${ic(i)}${n}</button>`).join('')}</div><div id="mpv">${prev()}</div>`,
    btns:[{t:'취소'},{t:'이 모양으로 만들기',cls:'pr',fn:()=>doMorph(pick,items,its,src)}],
    onOpen:()=>{$('#mbody').onclick=e=>{const b=e.target.closest('[data-mo]');if(!b)return;pick=b.dataset.mo;$$('[data-mo]').forEach(x=>x.classList.toggle('on',x===b));$('#mpv').innerHTML=prev()}}})}
function doMorph(k,items,its,src){if(One.on())return One.morphHere(k,items,its);const name=(MORPH.find(m=>m[0]===k)||[])[1];const title=`${pTitle(src)||'캔버스'} → ${name}`;let p;
  if(k==='mind'){const cv=Canvas.make('blank');const root={id:uid(),type:'node',x:0,y:items.length*36,w:220,text:`<b>${esc(pTitle(src)||'중심 생각')}</b>`,c:'y',shape:'pill'};cv.items.push(root);
    items.forEach((t,i)=>{const n={id:uid(),type:'node',x:320,y:i*72,w:220,text:esc(t),c:['p','m','s','l','o'][i%5],shape:'pill'};cv.items.push(n);cv.links.push({id:uid(),a:root.id,b:n.id,k:'mm'})});p=newPage('canvas',{title,cv});p.kind='mind'}
  if(k==='check')p=newPage('doc',{title,blocks:items.map(t=>B('todo',esc(t)))});
  if(k==='table'||k==='time'){const db=DBV.blankWith(k==='time'?'timeline':'table');const tp=db.props.find(x=>x.type==='title'),dp=db.props.find(x=>x.type==='date');
    db.rows=items.map((t,i)=>{const c={[tp.id]:t};if(k==='time'&&dp)c[dp.id]=dateAdd(today(),i);return{id:uid(),c,note:'',created:now(),updated:now()}});p=newPage('db',{title,db})}
  if(k==='story'){const db=DBV.storyDb();const tp=db.props.find(x=>x.type==='title'),op=db.props.find(x=>x.name==='순서');db.rows=items.map((t,i)=>({id:uid(),c:{[tp.id]:t,[op.id]:i+1},note:'',created:now(),updated:now()}));p=newPage('db',{title,db});p.kind='story';addNextProp(p)}
  p.from=src.id;p.icon='✨';
  // 원본에 연결 카드 남기기
  const ap=A();ap.push();const bx=its.map(i=>ap.box(i.id)).filter(Boolean);const x=Math.max(...bx.map(b=>b.x+b.w))+60,y=Math.min(...bx.map(b=>b.y));const card=ap.mk('page',x,y,{page:p.id});its.forEach(i=>ap.link(i.id,card.id,{k:'arrow',dash:true}));ap.render();ap.save();
  save();renderSide();toast(`‘${name}’로 변신했어요 · 원본 옆에 연결 카드가 생겼어요`,{act:'열기',fn:()=>go('page:'+p.id)})}

/* ---------- 만약에? ---------- */
function whatIf(it){const ap=A();ap.push();const c=ap.C();const n=c.items.filter(x=>x.wiOf===it.id).length+1;const b=ap.box(it.id)||{x:it.x,y:it.y,w:it.w,h:120};
  const cl=JSON.parse(JSON.stringify(it));cl.id=uid();cl.x=b.x+b.w+80;cl.y=b.y+(n-1)*(b.h+40);cl.wiOf=it.id;cl.wi=n;delete cl.star;delete cl.capsule;c.items.push(cl);ap.link(it.id,cl.id,{dash:true,label:'만약에 '+n});ap.render();ap.setSel([cl.id]);ap.save();toast('갈래를 만들었어요 · 다르게 고쳐 쓰고, 마음에 드는 갈래에 별을 붙여요')}
function star(it){const ap=A();ap.push();const root=it.wiOf?ap.I(it.wiOf):it;const fam=ap.C().items.filter(x=>x.id===root?.id||x.wiOf===root?.id);const v=!it.star;fam.forEach(x=>x.star=false);it.star=v;ap.render();ap.save();if(v)toast('이 갈래를 골랐어요 ★')}
function compare(it){const root=it.wiOf?A().I(it.wiOf):it;const fam=A().C().items.filter(x=>x.id===root.id||x.wiOf===root.id);
  modal({title:'갈래 비교',cls:'wide',html:`<div class="wicmp">${fam.map(x=>`<div class="${x.star?'on':''}"><small>${x.wi?'만약에 '+x.wi:'원본'}${x.star?' · ★ 고른 갈래':''}</small><div>${x.text||esc(txt(x))||'(비어 있음)'}</div></div>`).join('')}</div>`,btns:[{t:'닫기',cls:'pr'}]})}

/* ---------- 아이디어 믹서 ---------- */
function dice(its){if(its.length<2||its.length>5)return toast('카드를 2~5개 골라 주세요');const ap=A();
  const words=its.map(it=>{const w=txt(it).split(/[\s,.·/|]+/).filter(x=>x.length>=2);return w.length?w[Math.floor(Math.random()*w.length)]:txt(it).slice(0,10)});
  ap.push();const bx=its.map(i=>ap.box(i.id)).filter(Boolean);const cx=bx.reduce((s,b)=>s+b.x+b.w/2,0)/bx.length,cy=Math.max(...bx.map(b=>b.y+b.h))+80;
  const n=ap.mk('sticky',cx-120,cy,{w:260,h:170,c:'l',text:`<b>🎲 ${words.map(esc).join(' × ')}</b><br>이 조합으로 떠오르는 것:<br>`,mix:its.map(i=>i.id)});its.forEach(i=>ap.link(i.id,n.id,{dash:true}));ap.render();ap.save();ap.editNew(n);toast('새 조합이에요 · 다시 고르고 주사위를 굴리면 또 바뀌어요')}

/* ---------- 타임캡슐 ---------- */
async function capsule(its){const d=await ask('타임캡슐 — 언제 열릴까요?',{sub:'그날까지 흐리게 잠겨서 고칠 수 없어요. 예: '+dateAdd(today(),365),val:dateAdd(today(),365),ph:'YYYY-MM-DD'});if(!d)return;if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||d<=today())return toast('오늘 이후 날짜를 YYYY-MM-DD로 적어 주세요');
  const ap=A();ap.push();its.forEach(i=>{i.capsule=d;i.capSeen=false;i.capMade=today()});ap.setSel([]);ap.render();ap.save();toast(`${d}에 열리는 타임캡슐을 묻었어요 🔒`)}
function capsuleCheck(){const p=curPage();if(p?.type!=='canvas')return;const op=p.cv.items.filter(i=>i.capsule&&i.capsule<=today()&&!i.capSeen);if(!op.length)return;toast(`🎁 타임캡슐 ${op.length}개가 열렸어요!`);setTimeout(()=>{op.forEach(i=>i.capSeen=true);save()},2500)}

/* ---------- 색상 연구실 ---------- */
async function extract(it){const u=burl(it.blob);if(!u)return toast('이미지를 찾을 수 없어요');const img=new Image();img.src=u;try{await img.decode()}catch(e){return toast('이미지를 읽지 못했어요')}
  const W=80,H=Math.max(1,Math.round(img.height/img.width*80));const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(img,0,0,W,H);let d;try{d=g.getImageData(0,0,W,H).data}catch(e){return toast('이 이미지에서는 색을 뽑을 수 없어요')}
  const px=[];for(let i=0;i<d.length;i+=4)if(d[i+3]>128)px.push([d[i],d[i+1],d[i+2]]);let cs=[];for(let i=0;i<5;i++)cs.push(px[Math.floor((i+.5)*px.length/5)]||[200,200,200]);
  for(let it2=0;it2<8;it2++){const sum=cs.map(()=>[0,0,0,0]);px.forEach(p=>{let bi=0,bd=1e9;cs.forEach((c,j)=>{const dd=(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2;if(dd<bd){bd=dd;bi=j}});const s=sum[bi];s[0]+=p[0];s[1]+=p[1];s[2]+=p[2];s[3]++});cs=cs.map((c,j)=>sum[j][3]?[sum[j][0]/sum[j][3],sum[j][1]/sum[j][3],sum[j][2]/sum[j][3]].map(Math.round):c)}
  const hex=c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();const ap=A();ap.push();const b=ap.box(it.id)||{x:it.x,y:it.y,h:200};
  cs.forEach((c,i)=>ap.mk('shape',b.x+i*124,b.y+b.h+30,{w:110,h:110,shape:'round',c:'w',bg:hex(c),text:`<b>${hex(c)}</b><br><small>rgb(${c.join(',')})</small>`,swatch:hex(c)}));ap.render();ap.save();
  const pal=cs.map(hex);modal({title:'🎨 뽑은 색 5개',html:`<div class="palrow">${pal.map(h=>`<button data-hx="${h}" style="--v:${h}" title="눌러서 복사"><i></i><b>${h}</b></button>`).join('')}</div><p class="note">색을 누르면 HEX가 복사돼요. 팔레트로 저장하면 다른 캔버스의 속성 패널에서도 이 색을 쓸 수 있어요.</p>`,
    btns:[{t:'닫기'},{t:'팔레트로 저장',cls:'pr',fn:()=>{(S.palettes??=[]).unshift({id:uid(),n:pTitle(curPage())+' 팔레트',c:pal});S.palettes=S.palettes.slice(0,12);save();toast('팔레트를 저장했어요')}}],onOpen:()=>{$('#mbody').onclick=e=>{const b2=e.target.closest('[data-hx]');if(b2){navigator.clipboard?.writeText(b2.dataset.hx).then(()=>toast(b2.dataset.hx+' 복사했어요'),()=>toast(b2.dataset.hx))}}}})}

/* ---------- 영감의 벽 ---------- */
function wall(){let w=live().find(p=>p.wall);if(!w){w=newPage('canvas',{title:'영감의 벽',icon:'💡',cv:Canvas.make('blank')});w.wall=1;w.kind='visual';w.cv.grid=false}return w}
function wallAdd(items){if(One.on()){One.home();setTimeout(()=>{const ap=Canvas.api;ap.push();const[cx,cy]=ap.center();items.forEach((x,i)=>ap.mk(x.type,cx-140+(i%4)*290,cy-100+Math.floor(i/4)*240,{...x}));ap.render();ap.save();toast(`캔버스에 ${items.length}개를 꽂았어요 💡`)},150);return}const w=wall();let n=w.cv.items.length;const pos=()=>{const i=n++;return[(i%5)*290,Math.floor(i/5)*260]};items.forEach(x=>{const[px,py]=pos();w.cv.items.push({id:uid(),...x,x:px,y:py})});touch(w);renderSide();toast(`영감의 벽에 ${items.length}개를 꽂았어요 💡`,{act:'벽 보기',fn:()=>go('page:'+w.id)})}
async function grab(){const p=curPage();let items=[];
  if(p?.type==='canvas'){const sel=Canvas.sel();if(sel.length&&!p.wall)items=sel.map(i=>{const c=JSON.parse(JSON.stringify(i));delete c.id;delete c.x;delete c.y;return c})}
  if(!items.length){const t=String(getSelection()||'').trim();if(t)items=[{type:/^https?:\/\/\S+$/.test(t)?'link':'sticky',...(/^https?:\/\//.test(t)?{w:300,url:t,title:t,cap:''}:{w:240,h:150,c:'y',text:esc(t)})}]}
  if(!items.length){const v=await ask('영감의 벽에 꽂기',{sub:'글, 링크(https://…), 색(#2563EB) 무엇이든',ph:'여기에 붙여 넣으세요'});if(!v)return;
    if(/^#[0-9a-f]{6}$/i.test(v.trim()))items=[{type:'shape',w:110,h:110,shape:'round',c:'w',bg:v.trim().toUpperCase(),text:`<b>${v.trim().toUpperCase()}</b>`}];
    else if(/^https?:\/\/\S+$/.test(v.trim()))items=[{type:'link',w:300,url:v.trim(),title:v.trim(),cap:''}];else items=[{type:'sticky',w:240,h:150,c:'y',text:esc(v)}]}
  wallAdd(items)}

/* ---------- 낙서 → 다이어그램 ---------- */
function inkToDiagram(){const ap=A(),c=ap.C();if(!c)return;const ids=ap.selK();const st=(ids.length?c.strokes.filter(s=>ids.includes(s.id)):c.strokes);if(!st.length)return toast('먼저 펜으로 동그라미와 선을 그려 주세요');
  const shapes=[],lines=[];st.forEach(s=>{const p=s.p;if(p.length<2)return;const xs=p.map(q=>q[0]),ys=p.map(q=>q[1]);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),diag=Math.hypot(x1-x0,y1-y0);const a=p[0],b=p.at(-1);
    if(diag>30&&Math.hypot(a[0]-b[0],a[1]-b[1])<diag*.3&&p.length>5)shapes.push({s,x0,y0,x1,y1,cx:(x0+x1)/2,cy:(y0+y1)/2,r:Math.max(x1-x0,y1-y0)/2});else lines.push({s,a,b})});
  if(!shapes.length)return toast('닫힌 동그라미·네모를 찾지 못했어요 · 시작점과 끝점이 만나게 그려 주세요');
  ap.push();const nodes=shapes.map((g,i)=>{const w=Math.max(120,g.x1-g.x0),n=ap.mk('node',g.cx-w/2,g.cy-22,{w,text:'',c:['y','s','m','p','l','o'][i%6],shape:'pill'});n._g=g;return n});
  const near=(pt)=>{let best=null,bd=1e9;nodes.forEach(n=>{const g=n._g,d=Math.hypot(pt[0]-g.cx,pt[1]-g.cy)-g.r;if(d<bd){bd=d;best=n}});return bd<60?best:null};let L=0;
  lines.forEach(l=>{const A2=near(l.a),B2=near(l.b);if(A2&&B2&&A2!==B2){ap.link(A2.id,B2.id,{k:'arrow'});L++;l.used=1}});
  const rm=new Set([...shapes.map(g=>g.s.id),...lines.filter(l=>l.used).map(l=>l.s.id)]);c.strokes=c.strokes.filter(s=>!rm.has(s.id));nodes.forEach(n=>delete n._g);ap.clearK();ap.render();ap.drawInk();ap.save();
  toast(`노드 ${nodes.length}개 · 연결선 ${L}개로 바꿨어요 · 노드를 더블클릭해 글을 쓰세요`)}

/* ---------- 카드 메뉴 ---------- */
function cardMenu(its){const it=its[0],n=its.length,text=it&&!['image','video','audio','file'].includes(it.type);
  return[...(typeof DocPPT!=='undefined'?DocPPT.cardMenu(its):[]),...World.cardMenu(its),...Mind.cardMenu(its),{t:'속성 (위치·크기·회전·투명도)',i:'settings',fn:()=>MS.props(its,1)},{t:'다른 형태로 바꾸기 (마인드맵·체크리스트·표)',i:'ai',fn:()=>morph(its)}
  ]}

/* ---------- 분위기 모드 ---------- */
const MOODS=[['','기본'],['focus','집중'],['inspire','영감'],['free','자유 창작']];
function mood(k){if(k===undefined){const i=MOODS.findIndex(m=>m[0]===(S.settings.mood||''));k=MOODS[(i+1)%MOODS.length][0]}S.settings.mood=k;save();MOODS.forEach(([m])=>m&&document.body.classList.toggle('mood-'+m,m===k));
  const b=$('#stMood');if(b)b.querySelector('span').textContent=MOODS.find(m=>m[0]===k)[1];$('#inspo')?.remove();
  if(k==='focus')toast('집중 모드 · Esc 또는 오른쪽 아래 버튼으로 돌아와요');
  if(k==='inspire'){const pool=[];live().forEach(p=>{if(p.type==='canvas')p.cv.items.forEach(i=>{const t=txt(i);if(t.length>3&&!(i.capsule>today()))pool.push([p,t])});if(p.type==='doc'){const t=Editor.text(p).trim();if(t)pool.push([p,t.slice(0,160)])}});
    if(pool.length){const[p,t]=pool[Math.floor(Math.random()*pool.length)];document.body.insertAdjacentHTML('beforeend',`<div id="inspo"><small>옛 생각 하나 · ${esc(pTitle(p))} · ${ago(p.updated)}</small><p>${esc(t.slice(0,160))}</p><div><button class="btn sm ghost" data-ix>닫기</button><button class="btn sm ghost" data-in>다른 것</button><button class="btn sm pr" data-io="${p.id}">열기</button></div></div>`);
      $('#inspo').onclick=e=>{if(e.target.closest('[data-ix]'))$('#inspo').remove();if(e.target.closest('[data-in]'))mood('inspire');const o=e.target.closest('[data-io]');if(o){go('page:'+o.dataset.io);$('#inspo')?.remove()}}}}
  if(k==='free'&&curPage()?.type==='canvas')Canvas.cmd('tool:pen')}

/* ---------- 스토리 분기 지도 ---------- */
function addNextProp(p){if(!p.db.props.some(x=>x.type==='relation'&&x.target===p.id))p.db.props.push({id:uid(),name:'다음 장면',type:'relation',target:p.id})}
function storyMap(p){const db=p.db,tp=db.props.find(x=>x.type==='title'),rp=db.props.find(x=>x.type==='relation'&&x.target===p.id),op=db.props.find(x=>x.name==='순서');if(!db.rows.length)return toast('장면을 먼저 만들어 주세요');
  const nx=r=>{const v=rp?r.c[rp.id]:null;return(Array.isArray(v)?v:v?[v]:[]).map(id=>db.rows.find(x=>x.id===id)).filter(Boolean)};
  let rows=[...db.rows].sort((a,b)=>(+(a.c[op?.id])||0)-(+(b.c[op?.id])||0));const targeted=new Set(rows.flatMap(r=>nx(r).map(x=>x.id)));let starts=rows.filter(r=>!targeted.has(r.id));if(!starts.length)starts=[rows[0]];
  const depth={},q=starts.map(r=>[r,0]);while(q.length){const[r,d]=q.shift();if(depth[r.id]!==undefined&&depth[r.id]>=d)continue;if(d>60)continue;depth[r.id]=d;nx(r).forEach(x=>q.push([x,d+1]))}rows.forEach(r=>{if(depth[r.id]===undefined)depth[r.id]=0});
  const cols={};rows.forEach(r=>(cols[depth[r.id]]??=[]).push(r));const cv=Canvas.make('blank');cv.grid=false;const idm={};const endC=['p','m','s','o','l'];let ei=0;
  Object.entries(cols).forEach(([d,list])=>list.forEach((r,i)=>{const end=!nx(r).length;const n={id:uid(),type:'node',x:+d*300,y:i*130-list.length*65,w:220,shape:end?'round':'pill',c:end?endC[ei++%endC.length]:'y',text:`<b>${esc(String(r.c[tp.id]||'제목 없음'))}</b>${end?'<br><small>결말</small>':''}`};cv.items.push(n);idm[r.id]=n.id}));
  rows.forEach(r=>nx(r).forEach(x=>cv.links.push({id:uid(),a:idm[r.id],b:idm[x.id],k:'arrow'})));
  const m=newPage('canvas',{title:pTitle(p)+' · 분기 지도',icon:'🗺️',cv});m.kind='story';m.from=p.id;save();go('page:'+m.id);toast(`장면 ${rows.length}개 · 결말 ${ei}개를 지도로 그렸어요`)}

/* ---------- 기억 타임라인 ---------- */
let memDay=null;
function vMemory(){const m=$('#main');const days={};const add=(d,o)=>{(days[d]??={pages:new Map(),vers:[]});if(o.p)days[d].pages.set(o.p.id,o.p);if(o.v)days[d].vers.push(o.v)};const key=t=>new Date(t).toLocaleDateString('sv-SE');
  live().forEach(p=>{add(key(p.created),{p});add(key(p.updated),{p})});Object.entries(V).forEach(([pid,l])=>{const p=P(pid);if(p&&!p.trash)l.forEach((v,i)=>add(key(v.t),{v:{p,i,t:v.t,label:v.label}}))});
  const ks=Object.keys(days).sort();if(!ks.length){m.innerHTML='<div class="wrap"><div class="empty"><b>아직 기록이 없어요</b></div></div>';return}if(!memDay||!days[memDay])memDay=ks.at(-1);const di=ks.indexOf(memDay),D=days[memDay];
  m.innerHTML=`<div class="wrap"><div class="kh"><span class="khi" style="--c:#2563EB">${ic('history')}</span><div><h2>기억 타임라인</h2><p class="note">날짜를 옮기면 그날 만든 것과 고친 것이 펼쳐져요 · 버전으로 되돌릴 수 있어요</p></div></div>
  <div class="memstrip">${ks.map(k=>`<button data-day="${k}" class="${k===memDay?'on':''}" title="${k}"><i style="height:${Math.min(40,8+(days[k].pages.size+days[k].vers.length)*4)}px"></i><small>${k.slice(5).replace('-','/')}</small></button>`).join('')}</div>
  <input type="range" class="memr" min="0" max="${ks.length-1}" value="${di}" aria-label="날짜">
  <h3 class="memh">${memDay.replace(/-/g,'.')} <small>${D.pages.size}개 작업 · 버전 ${D.vers.length}개</small></h3>
  <div class="memg">${[...D.pages.values()].map(p=>`<div class="memc"><button class="memt" data-go="page:${p.id}">${pIcon(p)}<b>${esc(pTitle(p))}</b><small>${TYPES[p.type].n}${key(p.created)===memDay?' · 이날 만듦':' · 이날 고침'}</small></button><div class="peekdoc mini">${Peek.html(p)}</div>
    ${D.vers.filter(v=>v.p.id===p.id).map(v=>`<button class="btn sm ghost" data-ver="${p.id}:${v.i}">${ic('restore')}${new Date(v.t).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})} 버전 보기·되돌리기</button>`).join('')}</div>`).join('')}</div></div>`;
  const r=m.querySelector('.memr');r.oninput=()=>{memDay=ks[+r.value];vMemory()};
  m.onclick=e=>{const d=e.target.closest('[data-day]');if(d){memDay=d.dataset.day;return vMemory()}const v=e.target.closest('[data-ver]');if(v){const[pid,i]=v.dataset.ver.split(':');versionView(P(pid),+i)}};
  requestAnimationFrame(()=>m.querySelector('.memstrip .on')?.scrollIntoView({inline:'center',block:'nearest'}))}

/* ---------- 도구 카드 (공유) ---------- */
function exportTool(p){const d={mindspaceTool:1,title:pTitle(p),icon:p.icon||'',props:p.db.props,views:p.db.views.map(v=>({...v,filters:[]})),made:today()};saveFile(pTitle(p)+'.mindtool.json',new Blob([JSON.stringify(d,null,1)],{type:'application/json'}));toast('도구 카드를 저장했어요 · 친구에게 파일을 보내면 칸 구성 그대로 쓸 수 있어요')}
async function importTool(){const[f]=await pickFile('.json,application/json');if(!f)return;let d;try{d=JSON.parse(await f.text())}catch(e){return toast('도구 카드 파일이 아니에요')}if(!d.mindspaceTool||!Array.isArray(d.props))return toast('MINDSPACE 도구 카드가 아니에요');
  const db={props:d.props,rows:[],views:d.views?.length?d.views:[{id:uid(),name:'표',type:'table',filters:[],fmode:'and',sort:[],hidden:[],widths:{}}]};db.vid=db.views[0].id;const p=create('db',{title:d.title||'가져온 도구',icon:d.icon||'🧰',db});p.db.props.forEach(x=>{if(x.type==='relation')x.target=p.id});save();toast('도구 카드를 가져왔어요')}

/* ---------- 시작 ---------- */
function init(){addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='i'){e.preventDefault();e.stopPropagation();grab()}if(e.key==='Escape'&&S.settings.mood==='focus'&&$('#modal').hidden)mood('')},true);
  const st=$('#status .str');if(st&&!$('#stMood'))st.parentElement.insertAdjacentHTML('beforeend',`<button id="stMood" title="분위기 모드 바꾸기">${ic('sun')}<span>기본</span></button>`);$('#stMood').onclick=()=>mood();
  document.body.insertAdjacentHTML('beforeend','<button id="moodExit" title="집중 모드 끝내기">집중 모드 끝내기 ✕</button>');$('#moodExit').onclick=()=>mood('');mood(S.settings.mood||'')}
return{MORPHN,init,morph,dice,whatIf,star,capsule,capsuleCheck,extract,grab,wallAdd,inkToDiagram,cardMenu,mood,storyMap,addNextProp,vMemory,exportTool,importTool}})();
function vMemory(){MS2.vMemory()}
