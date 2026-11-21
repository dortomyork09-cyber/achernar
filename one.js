/* Achernar — 캔버스 하나에서 모든 것 + 저장 화면 */
const One={
 on:()=>S.settings.one!==0,
 main(){let p=P(S.main);if(!p||p.trash||p.type!=='canvas'){p=live().filter(x=>x.type==='canvas'&&!x.wall&&!x.mediaLib).sort((a,b)=>b.updated-a.updated)[0];if(!p)p=newPage('canvas',{title:'내 캔버스',cv:Canvas.make('blank')});S.main=p.id;save()}return p},
 init(){if($('#obar'))return;document.body.insertAdjacentHTML('beforeend',`<div id="obar"><span class="msmark" title="Achernar"><i></i><i></i><i></i></span><b class="msname">Achernar</b><span id="otitle" contenteditable="plaintext-only" spellcheck="false" data-ph="내 캔버스"></span><span class="ost" id="ost">저장됨</span><span class="sp"></span>
   <button class="oback" id="oback" hidden>${ic('back')}캔버스로</button><button class="onew" id="onew" title="새 캔버스 (Ctrl+Alt+N)">${ic('plus')}<span>새 캔버스</span></button><button class="osave" id="osave" title="저장 (Ctrl+S)">${ic('save')}<span>저장</span></button><button class="omore" id="omore" aria-label="더 보기">${ic('more')}</button></div>`);
  const t=$('#otitle');t.oninput=()=>{const p=One.main();p.title=t.textContent.trim();touch(p)};t.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();t.blur()}};
  $('#osave').onclick=()=>SaveBoard.open();$('#onew').onclick=()=>One.newCanvas();addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.altKey&&e.key.toLowerCase()==='n'&&One.on()){e.preventDefault();if(document.body.classList.contains('nologin'))return toast('새 캔버스는 로그인하면 쓸 수 있어요',{ms:2600,act:'로그인',fn:()=>Collab.signIn()});One.newCanvas()}});$('#oback').onclick=()=>go('page:'+One.main().id);
  $('#omore').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();const NL=document.body.classList.contains('nologin'),BL=/^(새 캔버스|공유 · 같이 쓰기|클래스룸에 올리기|내 공유 캔버스|로그아웃|계정 삭제|보관함|🕑 저장과 지금 비교|여러 페이지로 쓰기|지금 캔버스를 내 템플릿으로 저장|선생님 모아보기|조원 기여도)/;const keep=x=>!NL||x==='-'||!(BL.test(x.t||'')||(x.sub&&/보관함/.test(x.t||'')));const pool=[
    {t:'카드 추가 메뉴 ( / )',i:'plus',fn:()=>{One.home();setTimeout(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'/',code:'Slash',bubbles:true})),120)}},
    ...(typeof Tpl!=='undefined'?Tpl.moreMenu():[]),...(typeof Collab!=='undefined'?Collab.moreMenu():[]),...DocPPT.moreMenu(),...(typeof Submit!=='undefined'?Submit.moreMenu():[]),...(typeof Vault!=='undefined'?Vault.moreMenu():[]),...World.moreMenu(),'-',
    {t:'만들기 · 녹음 · 사진',i:'plus',sub:Feat.menu(null)},...Feat.tools(),'-',
    ...(window.__pwa?[{t:'앱으로 설치하기',i:'dl',fn:async()=>{const p=window.__pwa;p.prompt();await p.userChoice;window.__pwa=null}}]:[]),{t:'새 캔버스',i:'plus',k:'Ctrl Alt N',fn:()=>One.newCanvas()},{t:'인쇄',i:'page',k:'Ctrl P',fn:()=>Print.open()},{t:'화면 맞춤',i:'fit',k:'Ctrl 0',fn:()=>Canvas.cmd('fit')},{t:'배경 바꾸기',i:'grid',sub:()=>Canvas.bgMenu()},{t:'문자표 (특수문자)',i:'grid',k:'Ctrl F10',fn:()=>CharMap.open()},
    '-',{t:'사용 가이드',i:'help',fn:()=>One.help()},{t:'설정',i:'settings',fn:()=>openSettings()},{t:'여러 페이지로 쓰기 (모든 도구)',i:'layout',fn:()=>{S.settings.one=0;S.settings.simple=0;applySettings();save();render();toast('여러 페이지 모드로 바꿨어요 · 설정에서 다시 캔버스 하나 모드로 돌아올 수 있어요')}}].filter(keep);
  const G=[['문서 · 발표','board',/(문서 새로 쓰기|슬라이드|발표|PowerPoint)/],['공유 · 같이 쓰기','user',/(공유 · 같이 쓰기|클래스룸|조원 기여도|내 공유 캔버스)/],['제출 · 내보내기','page',/(제출용|참고 자료|인쇄)/],
    ['저장 · 보관','save',/(새 캔버스|내 템플릿으로 저장|저장과 지금 비교|보관함)/],['도구','grid',/(배경 바꾸기|문자표|만들기 · 녹음|캔버스에서 찾기|구역으로 이동|자동 정리|집중 타이머|나의 작은 우주|화면 맞춤)/],['계정','user',/^(로그아웃|계정 삭제)/]];
  const used=new Set(),seen=new Set(),items=pool.filter(x=>x!=='-').filter(x=>{const k=x.t;if(seen.has(k))return false;seen.add(k);return true});if(items.some(x=>/^발표 시작/.test(x.t||''))){const i=items.findIndex(x=>/발표 모드/.test(x.t||''));if(i>=0)items.splice(i,1)}
  const groups=G.map(([t,ic,re])=>{const sub=items.filter(x=>re.test(x.t||'')&&!used.has(x));sub.forEach(x=>used.add(x));return sub.length?{t,i:ic,sub}:null}).filter(Boolean);
  const top=items.filter(x=>!used.has(x)),head=top.filter(x=>/^(카드 추가|템플릿$)/.test(x.t)),tail=top.filter(x=>!head.includes(x));
  menu(r.right-240,r.bottom+6,[...head,'-',...groups,'-',...tail].filter((x,i,a)=>!(x==='-'&&(i===0||a[i-1]==='-'||i===a.length-1))))};
  Feat.init();
  addEventListener('keydown',e=>{if(!One.on())return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();e.stopPropagation();if(document.body.classList.contains('nologin'))return toast('저장은 로그인하면 쓸 수 있어요 · 지금 캔버스는 자동으로 이 기기에 저장돼요',{ms:3200,act:'로그인',fn:()=>Collab.signIn()});One.quick()}},true);
  setInterval(()=>{const s=$('#ost');if(s)s.textContent=$('#saveSt')?.textContent||'저장됨'},1200)},
 home(){if(curPage()?.id!==S.main)go('page:'+One.main().id)},
 after(){if(!One.on())return;One.init();const p=curPage(),m=One.main();
  if(route!=='page:'+m.id&&!(p&&(p.type==='doc'||p.type==='db'))){setTimeout(()=>go('page:'+m.id),0);return}
  $('#oback').hidden=p?.id===m.id;const t=$('#otitle');if(document.activeElement!==t)t.textContent=m.title||''},
 /* ---------- 저장 ---------- */
 async list(){try{return(await tx('kv','readonly',s=>s.get('saves')))||[]}catch(e){return[]}},
 async put(l){await tx('kv','readwrite',s=>s.put(l,'saves'))},
 async thumb(){try{const b=await Canvas.api.png();const u=URL.createObjectURL(b);const img=new Image();img.src=u;await img.decode();const W=760,H=Math.round(Math.min(img.height/img.width,.75)*W);const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingQuality='high';g.fillStyle='#fff';g.fillRect(0,0,W,H);const sc=Math.min(W/img.width,H/img.height);g.drawImage(img,(W-img.width*sc)/2,(H-img.height*sc)/2,img.width*sc,img.height*sc);URL.revokeObjectURL(u);return c.toDataURL('image/jpeg',.9)}catch(e){return''}},
 async snap(name){One.home();await new Promise(r=>setTimeout(r,120));const m=One.main();const l=await One.list();const it={id:uid(),name:name||'저장 '+(l.length+1),t:now(),n:m.cv.items.length,cv:JSON.parse(JSON.stringify(m.cv)),thumb:await One.thumb()};l.unshift(it);await One.put(l.slice(0,40));flush();return it},
 async quick(){const it=await One.snap(new Date().toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})+' 저장');toast(`‘${it.name}’로 저장했어요`,{act:'저장 화면',fn:()=>SaveBoard.open()})},
 async newCanvas(){const m=One.main();One.home();await new Promise(r=>setTimeout(r,80));const n=m.cv?.items?.length||0;
   if(n){const ok=await confirmDlg('새 캔버스를 만들까요?',`지금 캔버스(카드 ${n}개)는 ‘${esc(m.title||'내 캔버스')}’ 이름으로 저장 화면에 보관돼요. 언제든 다시 불러올 수 있어요.`,'새 캔버스 만들기');if(!ok)return;await One.snap(m.title||'내 캔버스')}
   m.cv={items:[],links:[],strokes:[],view:null,grid:true};m.title='';touch(m);flush();if(window.render)render();setTimeout(()=>{const t=$('#otitle');if(t){t.textContent='';t.focus()}},150);toast(n?'새 캔버스를 열었어요 · 이전 캔버스는 저장 화면에 있어요':'새 캔버스를 열었어요')},
 async screen(){return SaveBoard.open()},
 async screenOld(){const l=await One.list();const m=One.main();
  const card=x=>`<div class="osl" data-sid="${x.id}"><div class="osth">${x.thumb?`<img src="${x.thumb}" alt="">`:ic('canvas')}</div><div class="osin"><b>${esc(x.name)}</b><small>${new Date(x.t).toLocaleString('ko-KR',{year:'numeric',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})} · 카드 ${x.n}개</small></div><div class="osbt"><button class="btn sm pr" data-sload>불러오기</button><button class="ib sm" data-sren aria-label="이름 바꾸기">${ic('edit')}</button><button class="ib sm" data-sdel aria-label="삭제">${ic('trash')}</button></div></div>`;
  modal({title:'저장',cls:'wide osavem',html:`<div class="osnew"><input class="inp" id="osName" placeholder="이 저장의 이름 (예: 아이디어 1차)" maxlength="40"><button class="btn pr" id="osGo">${ic('save')}지금 저장하기</button></div>
   <p class="note">지금 화면은 항상 자동 저장돼요. 여기서 저장하면 <b>그 순간의 캔버스</b>가 따로 보관돼서, 언제든 골라서 다시 불러올 수 있어요.</p>
   <h6 class="osh">저장한 캔버스 ${l.length}개 ${l.length?'<button class="btn sm ghost" id="osCmp" style="margin-left:8px">지금과 비교</button>':''}</h6><div class="osg" id="osg">${l.length?l.map(card).join(''):'<div class="osempty">아직 저장한 게 없어요 · 위에서 이름을 쓰고 ‘지금 저장하기’를 눌러 보세요</div>'}</div>
   <h6 class="osh">파일로 내보내기</h6><div class="osex"><button data-ex="png">${ic('image')}<b>그림 (PNG)</b><small>캔버스를 사진으로</small></button><button data-ex="md">${ic('page')}<b>글 (마크다운)</b><small>카드의 글만 모아서</small></button><button data-ex="json">${ic('restore')}<b>백업 파일</b><small>모든 것 (다른 기기로 옮길 때)</small></button><button data-ex="imp">${ic('ul')}<b>백업 불러오기</b><small>백업 파일에서 되살리기</small></button></div>`,
   btns:[{t:'닫기'}],onOpen:()=>{const go2=async()=>{const n=$('#osName').value.trim();const it=await One.snap(n);toast(`‘${it.name}’ 저장 완료`);One.screen()};$('#osGo').onclick=go2;$('#osName').onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing)go2()};setTimeout(()=>$('#osName').focus(),40);$('#osCmp')&&($('#osCmp').onclick=()=>{closeModal();Feat.compare()});
    $('#mbody').onclick=async e=>{const ex=e.target.closest('[data-ex]');if(ex){const k=ex.dataset.ex;closeModal();One.home();await new Promise(r=>setTimeout(r,150));
        if(k==='png')return Canvas.api.png().then(b=>saveFile((m.title||'캔버스')+'.png',b),()=>toast('캔버스가 비어 있어요'));if(k==='md')return exportMD(m);if(k==='json')return backupAll();return importBackup()}
      const row=e.target.closest('[data-sid]');if(!row)return;const id=row.dataset.sid,ls=await One.list(),x=ls.find(y=>y.id===id);if(!x)return;
      if(e.target.closest('[data-sdel]')){if(!await confirmDlg('이 저장을 지울까요?',`‘${esc(x.name)}’을(를) 지워요. 지금 캔버스는 그대로예요.`,'지우기',1))return One.screen();await One.put(ls.filter(y=>y.id!==id));return One.screen()}
      if(e.target.closest('[data-sren]')){const n=await ask('이름 바꾸기',{val:x.name});if(n){x.name=n;await One.put(ls)}return One.screen()}
      if(e.target.closest('[data-sload]')||e.target.closest('.osth')){if(!await confirmDlg('이 저장을 불러올까요?',`지금 캔버스는 ‘불러오기 전 자동 저장’으로 먼저 보관해 둘게요.`,'불러오기'))return One.screen();
        await One.snap('불러오기 전 자동 저장');const mm=One.main();mm.cv=JSON.parse(JSON.stringify(x.cv));touch(mm);flush();closeModal();render();setTimeout(()=>Canvas.cmd('fit'),200);toast(`‘${x.name}’을(를) 불러왔어요`)}}}})},
 help(){const g=live().find(p=>p.title==='Achernar 기능 가이드');if(g)return go('page:'+g.id);toast('가이드를 찾을 수 없어요')},
 /* 변신 결과를 같은 캔버스에 */
 morphHere(k,items,its){const ap=Canvas.api;ap.push();const bx=its.map(i=>ap.box(i.id)).filter(Boolean);const x0=Math.max(...bx.map(b=>b.x+b.w))+120,y0=Math.min(...bx.map(b=>b.y));let made=[];
  if(k==='mind'){const r=ap.mk('node',x0,y0+items.length*34,{w:200,text:'<b>중심 생각</b>',c:'y',shape:'pill'});made.push(r);items.forEach((t,i)=>{const n=ap.mk('node',x0+300,y0+i*72,{w:220,text:esc(t),c:['p','m','s','l','o'][i%5],shape:'pill'});ap.link(r.id,n.id);made.push(n)})}
  if(k==='check')made.push(ap.mk('check',x0,y0,{w:280,title:'할 일',checks:items.map(t=>({t,d:false}))}));
  if(k==='table')made.push(ap.mk('table',x0,y0,{w:360,rows:[['#','내용'],...items.map((t,i)=>[String(i+1),t])]}));
  if(k==='time'||k==='story'){let prev=null;items.forEach((t,i)=>{const d=new Date();d.setDate(d.getDate()+i);const head=k==='time'?`${d.getMonth()+1}/${d.getDate()}`:`장면 ${i+1}`;const n=ap.mk(k==='time'?'node':'sticky',x0+i*260,y0,{w:220,...(k==='story'?{h:150}:{}),c:k==='time'?'s':'p',text:`<b>${head}</b><br>${esc(t)}`,...(k==='time'?{shape:'round'}:{})});if(prev)ap.link(prev.id,n.id,{k:'arrow'});prev=n;made.push(n)})}
  const fr=ap.mk('frame',x0-30,y0-60,{w:10,h:10,text:'✨ 변신 · '+(MS2.MORPHN?.[k]||''),c:'l'});const bb=made.map(i=>ap.box(i.id)||{x:i.x,y:i.y,w:i.w,h:i.h||80});
  ap.render();const B2=made.map(i=>ap.box(i.id)).filter(Boolean);if(B2.length){const minx=Math.min(...B2.map(b=>b.x)),miny=Math.min(...B2.map(b=>b.y)),maxx=Math.max(...B2.map(b=>b.x+b.w)),maxy=Math.max(...B2.map(b=>b.y+b.h));Object.assign(fr,{x:minx-30,y:miny-56,w:maxx-minx+60,h:maxy-miny+86})}
  const ci=ap.C().items;ci.splice(ci.indexOf(fr),1);ci.unshift(fr);its.forEach(i=>ap.link(i.id,fr.id,{k:'arrow',dash:true}));ap.render();ap.save();toast('같은 캔버스 옆에 변신 결과를 놓았어요 · 원본은 그대로예요')}
};
