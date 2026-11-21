/* Achernar — 학생용 수행평가 템플릿 */
const Tpl=(()=>{
const SW=960,SH=540;
function build(kind){
  const cv={items:[],links:[],strokes:[],view:null,grid:true};
  const n=(t,x,y,e={})=>{const it={id:uid(),type:t,x,y,...Canvas.DEF[t](),...e};cv.items.push(it);return it};
  const ln=(a,b,k='mm')=>cv.links.push({id:uid(),a:a.id,b:b.id,k});
  const arw=(a,b)=>cv.links.push({id:uid(),a:a.id,b:b.id,k:'arrow',w:2});
  const fr=(x,y,w,h,label)=>n('frame',x,y,{w,h,text:label,c:'l'});
  const tip=(x,y,html,w=260)=>n('sticky',x,y,{text:html,c:'y',w,h:120});
  const mind=(x,y,root,kids,c='s')=>{const r=n('node',x,y,{text:'<b>'+root+'</b>',c:'y',w:170});kids.forEach((k,i)=>{const b=n('node',x+230,y-((kids.length-1)*34)+i*68,{text:k,c,w:150});ln(r,b)});return r};
  let sn=1;
  const slide=(x,y,title,body)=>{const f=n('frame',x,y,{w:SW,h:SH,text:'',slide:1,c:'w',bg:'#FFFFFF',sn:sn++});
    const T=(tx,ty,w,html,fs,al,h)=>n('text',x+tx,y+ty,{w,text:html,fs,...(al?{al}:{}),h:h||0,plain:1});
    if(body===null){T(80,170,800,'<b>'+title+'</b>',58,'center');T(160,320,640,'과목 · 조 이름 · 날짜',24,'center')}
    else{T(60,44,840,'<b>'+title+'</b>',40);T(60,140,840,body,26,'',340)}return f};
  const ul=a=>'<ul>'+a.map(t=>'<li>'+t+'</li>').join('')+'</ul>';
  const G=520; // 구역 간격
  let name='';
  if(kind==='group'){name='조별 발표';
    const a=fr(0,0,460,400,'① 주제 정하기');mind(30,170,'발표 주제',['왜 이 주제?','궁금한 점','알리고 싶은 것']);
    const b=fr(G,0,460,400,'② 역할 나누기');n('table',G+30,60,{w:400,rows:[['이름','맡은 일','마감'],['','자료 조사',''],['','슬라이드',''],['','발표','']]});
    const c=fr(G*2,0,460,400,'③ 자료 모으기');[['자료 1','사진·링크를 끌어다 놓기'],['자료 2','찾은 내용 한 줄 요약'],['자료 3','출처 적기']].forEach(([h,t],i)=>n('sticky',G*2+30+(i%2)*210,60+Math.floor(i/2)*170,{text:'<b>'+h+'</b><br>'+t,c:['s','m','p'][i],w:190,h:150}));
    const d=fr(G*3,0,460,400,'④ 할 일');n('check',G*3+30,60,{w:380,title:'발표 준비',checks:['주제 정하기','자료 조사','슬라이드 만들기','발표 연습','제출'].map(t=>({t,d:false}))});
    arw(a,b);arw(b,c);arw(c,d);
    const sy=520;slide(0,sy,'발표 제목',null);slide(SW+80,sy,'목차',ul(['주제 소개','조사한 내용','정리','느낀 점']));slide((SW+80)*2,sy,'조사한 내용',ul(['핵심 내용 1','핵심 내용 2','핵심 내용 3']));slide((SW+80)*3,sy,'정리와 느낀 점',ul(['알게 된 것','더 궁금한 것','감사합니다']));
    tip(-320,0,'<b>이렇게 써요</b><br>① → ④ 순서로 채우고, 아래 슬라이드로 발표해요. ⋯ → 발표(F5)')}
  if(kind==='inquiry'){name='탐구 보고서';
    const a=fr(0,0,420,300,'① 탐구 질문');n('sticky',30,60,{text:'<b>내가 궁금한 것</b><br>예) 물의 온도에 따라 설탕이 녹는 속도가 다를까?',c:'s',w:360,h:200});
    const b=fr(G-60,0,420,300,'② 가설');n('sticky',G-30,60,{text:'<b>예상한 답</b><br>예) 온도가 높을수록 빨리 녹을 것이다.',c:'m',w:360,h:200});
    const c=fr((G-60)*2,0,460,460,'③ 조사·실험');n('check',(G-60)*2+30,60,{w:400,title:'준비물',checks:['','',''].map(t=>({t,d:false}))});n('table',(G-60)*2+30,240,{w:400,rows:[['조건','결과','메모'],['','',''],['','','']]});
    const d=fr((G-60)*3+40,0,420,460,'④ 결과');n('chart',(G-60)*3+70,60,{w:360,title:'결과 그래프',kind:'bar',data:[{l:'조건 1',v:10},{l:'조건 2',v:18},{l:'조건 3',v:25}]});
    arw(a,b);arw(b,c);arw(c,d);
    n('doc',0,560,{w:760,text:'<h1>탐구 보고서</h1><p>과목 · 이름 · 날짜</p><h2>1. 탐구 동기</h2><p><br></p><h2>2. 탐구 질문과 가설</h2><p><br></p><h2>3. 탐구 방법</h2><p><br></p><h2>4. 결과</h2><p><br></p><h2>5. 결론과 느낀 점</h2><p><br></p><h2>참고 자료</h2><p><br></p>'});
    tip(820,560,'<b>이렇게 써요</b><br>위의 ①~④를 채운 뒤 아래 문서로 옮겨 써요. 문서 카드 오른쪽 클릭 → PDF·Word로 내보내기')}
  if(kind==='book'){name='독서·감상문';
    const a=fr(0,0,420,340,'① 작품 정보');n('table',30,60,{w:360,rows:[['제목',''],['지은이·감독',''],['읽은·본 날',''],['한 줄 소개','']]});
    const b=fr(G-60,0,460,340,'② 인상 깊은 장면');['장면 1','장면 2','장면 3'].forEach((t,i)=>n('sticky',G-30+(i%2)*205,60+Math.floor(i/2)*135,{text:'<b>'+t+'</b><br>왜 기억에 남았나?',c:['p','s','m'][i],w:190,h:120}));
    const c=fr((G-60)*2+40,0,480,340,'③ 나의 생각');mind((G-60)*2+70,150,'나의 생각',['공감한 점','질문','바뀐 생각'],'p');
    arw(a,b);arw(b,c);
    n('doc',0,400,{w:760,text:'<h1>감상문 제목</h1><p>이름 · 날짜</p><h2>처음 — 작품을 고른 이유와 줄거리</h2><p><br></p><h2>가운데 — 인상 깊은 장면과 생각</h2><p><br></p><h2>끝 — 느낀 점과 나에게 남은 것</h2><p><br></p>'});
    tip(820,400,'<b>이렇게 써요</b><br>①~③에 생각을 먼저 펼치고, 아래 문서에 처음·가운데·끝으로 정리해요')}
  if(kind==='exam'){name='시험 공부 정리';
    const a=fr(0,0,620,460,'① 단원 한눈에 보기');const r=n('node',30,200,{text:'<b>단원 이름</b>',c:'y',w:160});
    [['소단원 1',['개념','개념']],['소단원 2',['개념','개념']],['소단원 3',['개념','개념']]].forEach(([t,ks],i)=>{const y=60+i*140;const b=n('node',230,y+30,{text:t,c:'s',w:140});ln(r,b);ks.forEach((k,j)=>ln(b,n('node',420,y+j*60,{text:k,c:'m',w:140})))});
    const b=fr(680,0,460,460,'② 핵심 개념 카드');[['개념','뜻을 한 줄로'],['개념','뜻을 한 줄로'],['공식·연도','외울 것'],['예시','문제에 나온 예']].forEach(([h,t],i)=>n('sticky',710+(i%2)*205,60+Math.floor(i/2)*190,{text:'<b>'+h+'</b><br>'+t,c:['s','m','p','o'][i],w:190,h:170}));
    const c=fr(1200,0,420,460,'③ 헷갈리는 것');n('check',1230,60,{w:360,title:'다시 볼 것',checks:['','',''].map(t=>({t,d:false}))});n('check',1230,260,{w:360,title:'오늘 할 공부',checks:['교과서 읽기','문제 풀기','오답 정리'].map(t=>({t,d:false}))});
    arw(a,b);arw(b,c);
    tip(0,500,'<b>이렇게 써요</b><br>마인드맵 노드를 고르고 Tab은 하위 가지, Enter는 같은 줄 가지. 다 외운 건 ③에서 체크!')}
  return {cv,name};
}
const LIST=[['group','조별 발표','주제 → 역할 → 자료 → 할 일 → 슬라이드 4장','user'],['inquiry','탐구 보고서','질문 → 가설 → 실험 → 결과 → 보고서 문서','search'],['book','독서·감상문','작품 정보 → 인상 깊은 장면 → 생각 → 감상문','page'],['exam','시험 공부 정리','단원 마인드맵 → 핵심 개념 → 헷갈리는 것','node']];
async function applyCv(cv,name){const m=One.main();One.home();await new Promise(r=>setTimeout(r,80));
  const cnt=m.cv?.items?.length||0;
  if(cnt){const ok=await confirmDlg(`‘${name}’ 템플릿으로 시작할까요?`,`지금 캔버스(카드 ${cnt}개)는 ‘${esc(m.title||'내 캔버스')}’ 이름으로 저장 화면에 보관돼요.`,'템플릿으로 시작');if(!ok)return;await One.snap(m.title||'내 캔버스')}
  if(m.room&&typeof Collab!=='undefined')Collab.leave();
  m.cv=cv;m.title=name;touch(m);flush();if(window.render)render();
  setTimeout(()=>{try{Canvas.api.fit()}catch(e){}},250);toast(`‘${name}’ 템플릿을 열었어요`)}
async function use(kind){const {cv,name}=build(kind);return applyCv(cv,name)}
/* 템플릿 복사: id를 새로 매겨 다른 캔버스와 겹치지 않게 */
function fresh(src){const cv=JSON.parse(JSON.stringify(src)),map={};const nid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
  (cv.items||[]).forEach(it=>{const n=nid();map[it.id]=n;it.id=n;['by','byn','eb','ebn','et','ec'].forEach(k=>delete it[k])});
  (cv.links||[]).forEach(l=>{l.id=nid();l.a=map[l.a]||l.a;l.b=map[l.b]||l.b});(cv.strokes||[]).forEach(s=>s.id=nid());cv.comments=[];cv.view=null;return cv}
function clean(c){return {items:c.items||[],links:c.links||[],strokes:c.strokes||[],grid:c.grid!==false}}
/* 내 템플릿 (이 기기) */
const getMine=async()=>{try{const v=await tx('kv','readonly',s=>s.get('mytpl'));return v?JSON.parse(v):[]}catch(e){return[]}};
const setMine=a=>tx('kv','readwrite',s=>s.put(JSON.stringify(a),'mytpl'));
async function saveMine(){const c=Canvas.api.C();if(!c||!c.items.length)return toast('빈 캔버스는 템플릿으로 저장할 수 없어요');
  const m=One.main();const t=(await ask('템플릿 이름',{val:m.title&&m.title!=='내 캔버스'?m.title:'',ph:'예) 우리 조 발표 양식',ok:'다음'})||'').trim().slice(0,40);if(!t)return;
  const d=((await ask('한 줄 설명 (선택)',{ph:'예) 주제·역할·자료·슬라이드까지',ok:'저장'}))||'').trim().slice(0,80);
  const a=await getMine();a.unshift({id:'t'+Date.now().toString(36),t,d,at:Date.now(),n:c.items.length,cv:clean(JSON.parse(JSON.stringify(c)))});await setMine(a.slice(0,60));toast(`‘${t}’을(를) 내 템플릿에 저장했어요`,{act:'보기',fn:()=>open('mine')})}
/* 학교 템플릿 (로그인 필요) */
const mySchool=()=>{try{return localStorage.getItem('ach-school')||''}catch(e){return ''}};
async function askSchool(force){let sc=mySchool();if(sc&&!force)return sc;sc=((await ask('학교 이름',{val:sc,sub:'같은 학교 학생끼리 템플릿을 나눠 써요. 예) 광주고등학교',ph:'○○고등학교',ok:'확인'}))||'').trim().replace(/\s+/g,'').slice(0,30);if(!sc)return '';try{localStorage.setItem('ach-school',sc)}catch(e){}return sc}
async function publish(t){if(typeof Collab==='undefined')return;const C=await Collab.cloud('학교 템플릿에 올리려면 구글 계정으로 로그인해 주세요.');if(!C)return;const sc=await askSchool();if(!sc)return;
  const ok=await confirmDlg(`‘${t.t}’을(를) ${sc} 템플릿에 올릴까요?`,'같은 학교 이름을 넣은 사람은 누구나 이 템플릿을 보고 쓸 수 있어요. 이름·연락처 같은 개인 정보가 들어 있지 않은지 확인해 주세요. 사진·파일 카드는 올라가지 않아요.','올리기');if(!ok)return;
  const cv=clean(t.cv);cv.items=cv.items.filter(i=>!['image','video','audio','file'].includes(i.type));const id='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const v={s:sc,t:t.t,d:t.d||'',by:C.uid,n:C.name,at:Date.now(),cnt:cv.items.length,cv:JSON.stringify(cv)};
  if(v.cv.length>400000)return toast('템플릿이 너무 커서 올릴 수 없어요');
  try{await C.db.ref('tpls/'+id).set(v);toast(`${sc} 템플릿에 올렸어요`,{act:'보기',fn:()=>open('school')})}catch(e){console.warn(e);toast('올리지 못했어요: '+(e.code||e.message),{ms:3500})}}
async function schoolList(){const C=await Collab.cloud('학교 템플릿은 구글 계정으로 로그인하면 볼 수 있어요.');if(!C)return null;const sc=await askSchool();if(!sc)return null;
  try{const v=(await C.db.ref('tpls').orderByChild('s').equalTo(sc).once('value')).val()||{};return {sc,C,list:Object.entries(v).sort((a,b)=>b[1].at-a[1].at)}}catch(e){console.warn(e);toast('학교 템플릿을 불러오지 못했어요');return null}}
async function open(tab='base'){
  const tabs=`<nav class="tpt"><button data-tab="base" class="${tab==='base'?'on':''}">기본</button><button data-tab="mine" class="${tab==='mine'?'on':''}">내 템플릿</button><button data-tab="school" class="${tab==='school'?'on':''}">학교 템플릿</button></nav>`;
  let body='';
  if(tab==='base')body=`<p class="note" style="margin:0 0 14px">조사부터 발표까지 한 화면에서. 하나를 고르면 새 캔버스로 열려요.</p><div class="tplg">${LIST.map(([k,n,d,i])=>`<button class="tplc" data-tk="${k}"><span class="tpli">${ic(i)}</span><b>${n}</b><span>${d}</span></button>`).join('')}</div>`;
  if(tab==='mine'){const a=await getMine();body=`<div class="tph"><span class="note">이 기기에 저장된 나만의 템플릿이에요.</span><button class="btn pr" data-save>지금 캔버스를 템플릿으로 저장</button></div>${a.length?`<div class="tplg">${a.map(t=>`<div class="tplc mine"><button class="tpu" data-mu="${t.id}"><span class="tpli">${ic('gallery')}</span><b>${esc(t.t)}</b><span>${esc(t.d||'')} · 카드 ${t.n}개</span></button><div class="tpa">${typeof Collab!=='undefined'?`<button class="lnk" data-pub="${t.id}">학교에 올리기</button>`:''}<button class="lnk dang" data-mdel="${t.id}">삭제</button></div></div>`).join('')}</div>`:'<p class="note cempty">아직 없어요. 자주 쓰는 캔버스 구성을 만들어 두고 위 버튼을 눌러 보세요.</p>'}`}
  let S=null;if(tab==='school'){S=await schoolList();if(!S){body='<p class="note cempty">학교 템플릿은 로그인과 학교 이름이 필요해요.</p>'}else{
    body=`<div class="tph"><span class="note"><b>${esc(S.sc)}</b> 학생들이 올린 템플릿 <button class="lnk" data-sc>학교 바꾸기</button></span></div>${S.list.length?`<div class="tplg">${S.list.map(([id,t])=>`<div class="tplc mine"><button class="tpu" data-su="${id}"><span class="tpli">${ic('user')}</span><b>${esc(t.t)}</b><span>${esc(t.d||'')} · ${esc(t.n||'')} · 카드 ${t.cnt||0}개</span></button>${t.by===S.C.uid?`<div class="tpa"><button class="lnk dang" data-sdel="${id}">내려받기 취소(삭제)</button></div>`:''}</div>`).join('')}</div>`:`<p class="note cempty">아직 ${esc(S.sc)}에 올라온 템플릿이 없어요. ‘내 템플릿’에서 처음으로 올려 보세요.</p>`}`}}
  modal({title:'템플릿',cls:'mid',html:tabs+body,onOpen:()=>{const B=document.querySelector('#mbody'),q=x=>B.querySelectorAll(x);
    q('[data-tab]').forEach(b=>b.onclick=()=>{closeModal();open(b.dataset.tab)});
    q('[data-tk]').forEach(x=>x.onclick=()=>{closeModal();use(x.dataset.tk)});
    B.querySelector('[data-save]')?.addEventListener('click',()=>{closeModal();saveMine()});
    q('[data-mu]').forEach(x=>x.onclick=async()=>{const t=(await getMine()).find(z=>z.id===x.dataset.mu);if(!t)return;closeModal();applyCv(fresh(t.cv),t.t)});
    q('[data-mdel]').forEach(x=>x.onclick=async()=>{const ok=await confirmDlg('이 템플릿을 지울까요?','이 기기에 저장된 내 템플릿에서만 지워져요.','삭제');if(!ok)return;await setMine((await getMine()).filter(z=>z.id!==x.dataset.mdel));open('mine')});
    q('[data-pub]').forEach(x=>x.onclick=async()=>{const t=(await getMine()).find(z=>z.id===x.dataset.pub);if(t){closeModal();publish(t)}});
    B.querySelector('[data-sc]')?.addEventListener('click',async()=>{closeModal();await askSchool(true);open('school')});
    q('[data-su]').forEach(x=>x.onclick=()=>{const t=S.list.find(z=>z[0]===x.dataset.su)[1];let cv;try{cv=JSON.parse(t.cv)}catch(e){return toast('템플릿을 열 수 없어요')}closeModal();applyCv(fresh(cv),t.t)});
    q('[data-sdel]').forEach(x=>x.onclick=async()=>{const ok=await confirmDlg('학교 템플릿에서 내릴까요?','다른 학생들이 더 이상 이 템플릿을 볼 수 없어요.','내리기');if(!ok)return;try{await S.C.db.ref('tpls/'+x.dataset.sdel).remove();closeModal();open('school')}catch(e){toast('지우지 못했어요')}});
  }});
}
return {open,use,build,LIST,saveMine,moreMenu:()=>[{t:'템플릿',i:'gallery',fn:()=>open()},{t:'지금 캔버스를 내 템플릿으로 저장',i:'save',fn:saveMine}]};
})();
