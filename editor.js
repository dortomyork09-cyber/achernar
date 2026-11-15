'use strict';
/* =========================================================
   블록 편집기 — 슬래시 명령, [[링크]], 블록 핸들, 서식 도구, AI
   ========================================================= */
const Editor=(()=>{
let pg=null,host=null,ac=null,POP=null,bsel=new Set(),lastB=null,KX=null;
const TEXTY=['p','h1','h2','h3','ul','ol','todo','quote','callout','toggle'];
const SL=[['p','텍스트','일반 문단','text','text 텍스트 문단 본문'],['h1','제목 1','큰 제목','h1','heading h1 제목 큰'],['h2','제목 2','중간 제목','h2','heading h2 제목'],['h3','제목 3','작은 제목','h3','heading h3 제목 작은'],
 ['ul','글머리 목록','점으로 나열','list','list bullet ul 목록 글머리'],['ol','번호 목록','1. 2. 3.','olist','number ol 번호 순서'],['todo','할 일','체크박스 목록','todo','todo check task 할일 체크'],['toggle','토글','접고 펼치는 내용','toggle','toggle 토글 접기 펼치기'],
 ['quote','인용','인용문','quote','quote 인용'],['callout','콜아웃','눈에 띄는 상자','callout','callout 콜아웃 강조 박스'],['divider','구분선','가로줄','divider','divider hr 구분선 선'],['code','코드','코드 블록','code','code 코드 프로그램'],['table','표','간단한 표','table','table 표 테이블'],
 ['image','이미지','사진 올리기','image','image 이미지 사진 그림'],['video','동영상','영상 파일','video','video 동영상 영상'],['audio','오디오','소리 파일','music','audio 오디오 소리 음악'],['file','파일 첨부','PDF·문서 등','file','file 파일 첨부 pdf'],
 ['bookmark','웹 링크','링크 카드 (유튜브·노션·캔바…)','web','link bookmark url 링크 북마크 웹 유튜브'],['link','문서 연결','다른 문서로 [[링크]]','link','link 연결 문서 백링크'],['page','하위 페이지','이 안에 새 페이지','page','page 페이지 하위 문서'],['database','데이터베이스','하위 데이터베이스','db','database db 데이터베이스'],['canvas','캔버스','하위 캔버스','canvas','canvas 캔버스 화이트보드'],
 ['toc','목차','제목을 모아 보기','toc','toc 목차 차례'],['date','날짜','날짜 선택','date','date 날짜 오늘 일정'],['ai','AI에게 쓰기','Claude가 초안을 써 줘요','ai','ai 에이아이 클로드 작성'],['math','수식','LaTeX 수식 (예: E=mc^2)','fx','math 수식 latex 수학'],['button','버튼','누르면 할 일·날짜 등을 넣어요','bolt','button 버튼 자동'],['embed','임베드','웹 링크 카드로 넣어요','web','embed 임베드 iframe']];
const SOON=[];
const TCOL=[['red','#E5484D'],['orange','#E8730C'],['yellow','#B38600'],['green','#12A150'],['blue','#2563EB'],['purple','#8B5CF6'],['gray','#7A8290']];
const idx=b=>pg.blocks.indexOf(b);const blk=id=>pg.blocks.find(b=>b.id===id);const rowOf=b=>host?.querySelector(`[data-b="${b.id}"]`);
const edOf=b=>rowOf(b)?.querySelector('.be');
function ins(after,nb){const i=after?idx(after)+1:pg.blocks.length;pg.blocks.splice(i,0,nb);return nb}

function bh(b){const ro=!!pg.lock,ce=ro?'false':'true';const be=(h,ph,f='html',cls='')=>`<div class="be ${cls}" contenteditable="${ce}" data-f="${f}" data-ph="${ph}">${h||''}</div>`;let c='';
  switch(b.type){
    case 'p':c=be(b.html,"‘/’를 눌러 블록 고르기 · [[로 문서 연결");break;
    case 'h1':case 'h2':case 'h3':c=be(b.html,'제목 '+b.type[1]);break;
    case 'ul':c=`<span class="mk">•</span>`+be(b.html,'목록');break;
    case 'ol':c=`<span class="mk num">1.</span>`+be(b.html,'목록');break;
    case 'todo':c=`<input type="checkbox" ${b.checked?'checked':''} ${ro?'disabled':''} aria-label="완료" data-ck>`+be(b.html,'할 일');break;
    case 'toggle':c=`<button class="tgb" data-tg aria-label="펼치기">${ic('chev')}</button><div class="tgw">${be(b.html,'토글 제목','html','sum')}<div class="tbody" contenteditable="${ce}" data-f="body">${b.body||''}</div></div>`;break;
    case 'quote':c=be(b.html,'인용문');break;
    case 'callout':c=`<button class="cico" data-ci aria-label="아이콘">${b.icon||'💡'}</button>`+be(b.html,'내용을 적어 보세요');break;
    case 'divider':c='<hr>';break;
    case 'code':c=`<div class="cbar"><input value="${esc(b.lang||'')}" placeholder="언어" data-lang ${ro?'disabled':''} aria-label="언어"><button data-cc>복사</button></div><div class="be" contenteditable="${ro?'false':'plaintext-only'}" spellcheck="false" data-f="text" data-ph="코드를 적거나 붙여넣으세요 · Ctrl+Enter로 빠져나가기">${esc(b.text||'')}</div>`;break;
    case 'image':c=b.src?`<figure style="--iw:${b.w||'100%'};--al:${b.al||'center'}"><img src="${burl(b.src)}" alt="${esc(blobs[b.src]?.name||'이미지')}" data-zoom draggable="false"><figcaption class="be" contenteditable="${ce}" data-f="cap" data-ph="설명 달기">${b.cap||''}</figcaption></figure>`:`<button class="upl" data-up="image" ${ro?'disabled':''}>${ic('image')}<span>클릭해서 사진 올리기 · 끌어다 놓기 · 붙여넣기</span></button>`;break;
    case 'media':{if(!b.src){c=`<button class="upl" data-up="${b.kind||'file'}" ${ro?'disabled':''}>${ic(b.kind==='video'?'video':b.kind==='audio'?'music':'file')}<span>클릭해서 ${b.kind==='video'?'동영상':b.kind==='audio'?'오디오':'파일'} 올리기</span></button>`;break}
      const f=blobs[b.src]||{},u=burl(b.src),t=f.type||'',nm=esc(f.name||b.name||'파일');const ext=(nm.split('.').pop()||'').toUpperCase();
      const rate=`<select data-rate aria-label="재생 속도" class="selx" style="height:30px">${[.5,.75,1,1.25,1.5,2].map(r=>`<option value="${r}"${r===1?' selected':''}>${r}×</option>`).join('')}</select>`;
      c=`<div class="media"><div class="fileb"><span class="fi">${ic(t.startsWith('video')?'video':t.startsWith('audio')?'music':'file')}</span><span style="flex:1;min-width:0"><b>${nm}</b><small>${f.size?(f.size/1048576).toFixed(2)+'MB · ':''}${esc(ext)}</small></span>${t.startsWith('video')||t.startsWith('audio')?rate:''}${t==='application/pdf'?'<button class="mini" data-pdf>PDF 보기</button>':''}<button class="mini" data-dlb>${'내려받기'}</button></div>
        ${!u?'<p class="note">파일을 찾을 수 없어요 (백업에서 첨부 없이 불러왔을 수 있어요).</p>':t.startsWith('video')?`<video src="${u}" controls playsinline preload="metadata"></video>`:t.startsWith('audio')?`<audio src="${u}" controls preload="metadata"></audio>`:b.preview?`<pre>${esc(b.preview)}</pre>`:t==='application/pdf'?`<p class="note" style="margin:0">‘PDF 보기’로 쪽 넘기기·확대·찾기·형광 표시·쪽 메모를 할 수 있어요.</p>`:''}
        <figcaption class="be" contenteditable="${ce}" data-f="cap" data-ph="파일 메모 달기" style="text-align:left">${b.cap||''}</figcaption></div>`;break}
    case 'page':{const q=P(b.page);c=`<button class="subp" data-open="${b.page}"><span class="ti">${q?pIcon(q):ic('page')}</span>${q?esc(pTitle(q)):'삭제된 페이지'}${q?.trash?' (휴지통)':''}</button>`;break}
    case 'bookmark':{const s=svc(b.url);c=`<div style="flex:1;display:flex;flex-direction:column;gap:6px">${s?`<a class="bm" href="${esc(b.url)}" target="_blank" rel="noopener"><div class="bt"><b>${esc(b.title||s.guess||s.name)}</b><small>${esc(s.host)} · 저장 ${esc(b.saved||'')}</small><small>${esc(b.url)}</small></div><div class="bs" style="--sv:${s.col}">${esc(s.name)}<br>열기 ↗</div></a>`:`<div class="note">올바른 주소가 아니에요: ${esc(b.url)}</div>`}${be(b.html,'이 링크에 대한 메모','html')}</div>`;break}
    case 'table':c=`<div class="tblw"><table>${(b.rows||[['']]).map((r,ri)=>`<tr>${r.map((x,ci)=>`<td contenteditable="${ce}" data-f="cell" data-r="${ri}" data-c="${ci}">${x}</td>`).join('')}</tr>`).join('')}</table>${ro?'':`<div class="tbtns"><button class="mini" data-tb="row">+ 행</button><button class="mini" data-tb="col">+ 열</button><button class="mini" data-tb="drow">− 행</button><button class="mini" data-tb="dcol">− 열</button></div>`}</div>`;break;
    case 'toc':{const hs=headings(pg);c=`<div class="toc-b">${hs.length?hs.map(h=>`<a class="l${h.l}" data-sb="${h.id}">${esc(h.t)||'(빈 제목)'}</a>`).join(''):'<span class="note">제목 블록을 넣으면 여기에 목차가 생겨요.</span>'}</div>`;break}
    case 'math':c=`<div class="mathb"><div class="mathr" data-mr></div><textarea class="mathin" data-f="tex" rows="1" placeholder="LaTeX 수식 (예: x^2+y^2=r^2)" spellcheck="false" ${ro?'disabled':''}>${esc(b.tex||'')}</textarea></div>`;break;
    case 'button':c=(b.act==='url'&&svc(b.url||'')?`<a class="btnb" href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.label||'링크 열기')} ↗</a>`:`<button class="btnb" data-run>${esc(b.label||'버튼')}</button>`)+(ro?'':`<button class="mini" data-bset>설정</button>`);break;
    case 'sync':{const sp=P(b.src),sb=sp?.blocks?.find(x=>x.id===b.blk);c=`<div class="syncb">${sb?`<div class="syncin">${toHTML([sb])}</div><div class="synch">${ic('link')}<span>살아 있는 조각 · 원본 <a class="pl al" data-page="${sp.id}" contenteditable="false">${esc(pTitle(sp))}</a>에서 고치면 여기도 바뀌어요</span></div>`:'<p class="note">원본 블록이 사라졌어요</p>'}</div>`;break}
    case 'date':c=`<div class="dateb">${ic('date')}<input type="date" value="${esc(b.date||today())}" data-date ${ro?'disabled':''} aria-label="날짜"><span class="note">${b.date?kdate(new Date(b.date+'T00:00')):''}</span></div>`;break;
    default:c=be(b.html,'');}
  const cls=`blk t-${b.type}${b.type==='todo'&&b.checked?' done':''}${b.type==='toggle'&&b.open?' open':''}${b.color?' c-'+b.color:''}${b.bg?' bg-'+b.bg:''}${bsel.has(b.id)?' bsel':''}`;
  return `<div class="${cls}" data-b="${b.id}" style="--ind:${b.ind||0}">${ro?'':`<div class="gut"><button class="bh-add" data-add title="아래에 블록 추가" aria-label="블록 추가">${ic('plus')}</button><button class="bh" data-hd title="끌어서 이동 · 클릭하면 메뉴" aria-label="블록 메뉴">${ic('drag')}</button></div>`}<div class="bc">${c}</div></div>`}
function render(){if(!host)return;if(!pg.blocks.length)pg.blocks.push(B('p'));host.innerHTML=pg.blocks.map(bh).join('')+'<div class="tail" data-tail title="클릭해서 이어 쓰기"></div>';nums();refreshPL();host.querySelectorAll('[data-mr]').forEach(e=>drawMath(e,blk(e.closest('.blk').dataset.b)?.tex));if(S.settings.panel&&ui.ptab==='toc')renderPanel()}
function katex(){if(KX)return KX;KX=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';s.onload=()=>res(window.katex);s.onerror=()=>{KX=null;rej()};document.head.appendChild(s)});return KX}
function drawMath(el,tex){if(!el)return;if(!tex){el.innerHTML='<span class="note">아래 칸에 수식을 적으면 여기에 보여요</span>';return}katex().then(k=>{try{el.innerHTML=k.renderToString(tex,{output:'mathml',throwOnError:false,displayMode:true})}catch(e){el.textContent=tex}}).catch(()=>{el.innerHTML=`<code>${esc(tex)}</code> <span class="note">(수식 모양을 불러오지 못해 글자로 보여요)</span>`})}
function nums(){const c=[];pg.blocks.forEach(b=>{const d=b.ind||0;if(b.type==='ol'){c.length=d+1;c[d]=(c[d]||0)+1;const m=rowOf(b)?.querySelector('.mk');if(m)m.textContent=(d%3===1?String.fromCharCode(96+c[d]):d%3===2?['i','ii','iii','iv','v','vi','vii','viii','ix','x'][c[d]-1]||c[d]:c[d])+'.'}else if(d<=c.length-1)c.length=d})}
function refreshPL(){host.querySelectorAll('a.pl').forEach(a=>{const q=P(a.dataset.page);a.classList.toggle('dead',!q||q.trash);if(q&&!a.classList.contains('al'))a.textContent=pTitle(q)})}
function placeCaret(el,pos='end'){if(!el)return;el.focus({preventScroll:false});const r=document.createRange();r.selectNodeContents(el);r.collapse(pos==='start');const s=getSelection();s.removeAllRanges();s.addRange(r)}
function focusB(b,pos='end'){placeCaret(edOf(b),pos)}
function beforeCaret(t){const s=getSelection();if(!s.rangeCount)return null;const r=s.getRangeAt(0);if(!t.contains(r.endContainer))return null;const pre=document.createRange();pre.selectNodeContents(t);pre.setEnd(r.endContainer,r.endOffset);return pre.toString()}
function afterCaret(t){const s=getSelection();if(!s.rangeCount)return null;const r=s.getRangeAt(0);if(!t.contains(r.startContainer))return null;const post=document.createRange();post.selectNodeContents(t);post.setStart(r.startContainer,r.startOffset);return post.toString()}
const collapsed=()=>{const s=getSelection();return s.rangeCount&&s.isCollapsed};
function caretRect(){const s=getSelection();if(!s.rangeCount)return null;const r=s.getRangeAt(0).cloneRange();r.collapse(true);return r.getClientRects()[0]||null}
function lineEdge(t,top){const cr=caretRect();if(!cr)return true;const tr=t.getBoundingClientRect(),lh=parseFloat(getComputedStyle(t).lineHeight)||24;return top?cr.top-tr.top<lh*.8:tr.bottom-cr.bottom<lh*.8}
function editables(){return[...host.querySelectorAll('.blk .be[contenteditable=true],.blk .be[contenteditable=plaintext-only]')].filter(e=>e.dataset.f==='html'||e.dataset.f==='text')}
function sync(t){const row=t.closest('.blk');if(!row)return;const b=blk(row.dataset.b);if(!b)return;const f=t.dataset.f;if(t.tagName==='TEXTAREA'){b[f]=t.value;touch(pg);return}
  if(f==='text')b.text=t.innerText.replace(/\n$/,'');else if(f==='cell'){b.rows[+t.dataset.r][+t.dataset.c]=t.innerHTML}else{if(t.innerHTML==='<br>')t.innerHTML='';b[f]=t.innerHTML}touch(pg)}
const cleanHTML=h=>{const d=document.createElement('div');d.innerHTML=h;d.querySelectorAll('script,style,iframe,object,embed').forEach(x=>x.remove());d.querySelectorAll('*').forEach(x=>[...x.attributes].forEach(a=>{if(/^on/i.test(a.name)||(a.name==='href'&&/^\s*javascript:/i.test(a.value)))x.removeAttribute(a.name)}));return d.innerHTML};

/* ----- 분리·합치기 ----- */
function split(t,b){const s=getSelection();if(!s.rangeCount)return;const r=s.getRangeAt(0);r.deleteContents();const tail=document.createRange();tail.setStart(r.endContainer,r.endOffset);tail.setEnd(t,t.childNodes.length);
  const d=document.createElement('div');d.appendChild(tail.extractContents());let after=d.innerHTML,before=t.innerHTML;if(after==='<br>')after='';if(before==='<br>')before='';
  const listy=['ul','ol','todo'].includes(b.type);
  if(listy&&!strip(before)&&!strip(after)){if(b.ind>0)b.ind--;else b.type='p';b.html='';render();focusB(b,'start');touch(pg);return}
  if(!strip(before)&&!/<img|<a /.test(before)&&strip(after)){b.html=after;pg.blocks.splice(idx(b),0,B(listy?b.type:'p','',{ind:b.ind||0}));render();focusB(b,'start');touch(pg);return}
  b.html=before;const nb=ins(b,B(listy?b.type:'p',after,{ind:b.ind||0}));render();focusB(nb,'start');touch(pg)}
function mergeInto(prev,b){const M='<span id="unc"></span>';prev.html=(prev.html||'')+M+(b.html||'');pg.blocks.splice(idx(b),1);render();const e=edOf(prev),m=e?.querySelector('#unc');if(m){const r=document.createRange();r.setStartBefore(m);r.collapse(true);e.focus();const s=getSelection();s.removeAllRanges();s.addRange(r);m.remove()}if(e){prev.html=e.innerHTML}touch(pg)}
function backspace(t,b){if(b.ind>0){b.ind--;render();focusB(b,'start');touch(pg);return}
  if(b.type!=='p'&&TEXTY.includes(b.type)){b.type='p';render();focusB(b,'start');touch(pg);return}
  const i=idx(b),prev=pg.blocks[i-1];if(!prev)return;
  if(TEXTY.includes(prev.type))return mergeInto(prev,b);
  if(!strip(b.html)){pg.blocks.splice(i,1);render();const pt=[...pg.blocks.slice(0,i)].reverse().find(x=>TEXTY.includes(x.type)||x.type==='code');if(pt)focusB(pt,'end');touch(pg)}
  else delB(prev)}
function forwardDel(t,b){const i=idx(b),nx=pg.blocks[i+1];if(nx&&TEXTY.includes(nx.type))mergeInto(b,nx)}

/* ----- 블록 조작 ----- */
function convert(b,k){const was=b.type;if(k==='code'){b.text=strip(b.html);b.html=''}else if(was==='code'){b.html=esc(b.text||'');delete b.text}b.type=k;if(k==='callout'&&!b.icon)b.icon='💡';render();if(TEXTY.includes(k)||k==='code')focusB(b,'end');touch(pg)}
function delB(b,silent){const i=idx(b);if(i<0)return;const copy=JSON.parse(JSON.stringify(b));pg.blocks.splice(i,1);bsel.delete(b.id);render();touch(pg);if(!silent)toast('블록을 지웠어요',{act:'되돌리기',fn:()=>{pg.blocks.splice(i,0,copy);render();touch(pg)}})}
function dupB(b){const c=JSON.parse(JSON.stringify(b));c.id=uid();ins(b,c);render();focusB(c,'end');touch(pg)}
function moveB(b,d){const i=idx(b),j=i+d;if(j<0||j>=pg.blocks.length)return;pg.blocks.splice(i,1);pg.blocks.splice(j,0,b);render();touch(pg)}
async function moveToPage(list){const t=await pickPage('어느 문서로 옮길까요?',{filter:p=>p.type==='doc'&&p.id!==pg.id,allowNew:true});if(t===undefined||t===null)return;let dest;if(t.newTitle){dest=newPage('doc',{title:t.newTitle,blocks:[]});renderSide()}else dest=P(t);
  if(dest.blocks.length===1&&!strip(dest.blocks[0].html)&&dest.blocks[0].type==='p')dest.blocks=[];list.forEach(b=>{pg.blocks.splice(idx(b),1);dest.blocks.push(b)});bsel.clear();touch(dest);render();touch(pg);toast(`${list.length}개 블록을 ‘${pTitle(dest)}’로 옮겼어요`,{act:'열기',fn:()=>go('page:'+dest.id)})}
function blockMenu(b,x,y){const many=bsel.size>1&&bsel.has(b.id);const list=many?pg.blocks.filter(q=>bsel.has(q.id)):[b];
  const colors=(k,cur)=>({colors:[{k:'',v:'transparent',n:'기본'},...TCOL.map(([n,c])=>({k:n,v:c,n}))],cur:cur||'',fn:c=>{list.forEach(q=>q[k]=c);render();touch(pg)}});
  const items=[{h:many?`블록 ${list.length}개`:SL.find(s=>s[0]===b.type)?.[1]||'블록'}];
  if(!many&&(TEXTY.includes(b.type)||b.type==='code'))items.push({t:'유형 바꾸기',i:'text',sub:()=>SL.filter(s=>[...TEXTY,'code'].includes(s[0])).map(s=>({t:s[1],i:s[3],on:b.type===s[0],fn:()=>convert(b,s[0])}))});
  items.push({h:'글자 색'},colors('color',b.color),{h:'배경 색'},colors('bg',b.bg));
  if(!many&&b.type==='image'&&b.src)items.push({t:'크기',i:'fit',sub:[['40%','작게'],['65%','중간'],['100%','전체']].map(([w,n])=>({t:n,on:(b.w||'100%')===w,fn:()=>{b.w=w;render();touch(pg)}}))},{t:'정렬',i:'layout',sub:[['flex-start','왼쪽'],['center','가운데'],['flex-end','오른쪽']].map(([a,n])=>({t:n,on:(b.al||'center')===a,fn:()=>{b.al=a;render();touch(pg)}}))},{t:'크게 보기',i:'eye',fn:()=>zoomImg(b)});
  if(!many&&b.type==='bookmark')items.push({t:'제목 바꾸기',i:'edit',fn:()=>ask('링크 제목',{val:b.title}).then(v=>{if(v!==null){b.title=v;render();touch(pg)}})},{t:'주소 바꾸기',i:'link',fn:()=>ask('링크 주소',{val:b.url}).then(v=>{if(v&&svc(v)){b.url=v;render();touch(pg)}})});
  if(!many&&b.type==='callout')items.push({t:'아이콘 바꾸기',i:'star',fn:()=>calloutIcon(b,x,y)});
  if(AI&&!many&&TEXTY.includes(b.type)&&strip(b.html))items.push('-',{t:'AI로 다듬기',i:'ai',ai:1,fn:()=>aiBlock(b,'polish')},{t:'AI 맞춤법 검사',i:'ai',ai:1,fn:()=>aiBlock(b,'spell')},{t:'AI 아이디어 확장',i:'ai',ai:1,fn:()=>aiBlock(b,'expand')});
  items.push('-',{t:'복제',i:'copy',k:'Ctrl D',fn:()=>{if(many){let last=list.at(-1);list.forEach(q=>{const c={...JSON.parse(JSON.stringify(q)),id:uid()};last=ins(last,c)});render();touch(pg)}else dupB(b)}},
    ...(!many?[{t:'위로 이동',i:'up',k:'Alt Shift ↑',fn:()=>moveB(b,-1)},{t:'아래로 이동',i:'dn',k:'Alt Shift ↓',fn:()=>moveB(b,1)}]:[]),
    {t:'다른 문서로 옮기기…',i:'move',fn:()=>moveToPage(list)},...(!many&&!['sync','page'].includes(b.type)?[{t:'다른 문서에 조각으로 보내기…',i:'link',fn:()=>sendSync(b)}]:[]),...(Sync.canComment()?[{t:'댓글 달기',i:'callout',fn:()=>Sync.comment(rowOf(b))}]:[]),{t:'글자 복사',i:'txt',fn:()=>navigator.clipboard?.writeText(textOf(list)).then(()=>toast('복사했어요'),()=>toast('복사가 막혀 있어요'))},
    '-',{t:many?`${list.length}개 삭제`:'삭제',i:'trash',dg:1,k:'Del',fn:()=>{if(many){const keep=JSON.parse(JSON.stringify(pg.blocks));pg.blocks=pg.blocks.filter(q=>!bsel.has(q.id));bsel.clear();render();touch(pg);toast(`블록 ${list.length}개를 지웠어요`,{act:'되돌리기',fn:()=>{pg.blocks=keep;render();touch(pg)}})}else delB(b)}});
  menu(x,y,items)}
function calloutIcon(b,x,y){menu(x,y,['💡','✨','⚠️','✅','📌','🔥','❓','📣','🧠','🎯','📎','❤️'].map(e=>({t:e==='💡'?'아이디어':e,em:e,fn:()=>{b.icon=e;render();touch(pg)}})))}
function zoomImg(b){modal({title:blobs[b.src]?.name||'이미지',cls:'wide',html:`<img src="${burl(b.src)}" alt="" style="width:100%;border-radius:12px">${b.cap?`<p class="note">${esc(strip(b.cap))}</p>`:''}`,btns:[{t:'내려받기',fn:()=>{dlBlob(b.src);return false}},{t:'닫기',cls:'pr'}]})}
async function dlBlob(id){const bl=await tx('blobs','readonly',s=>s.get(id));if(!bl)return toast('파일을 찾을 수 없어요');saveFile(blobs[id]?.name||'파일',bl)}

/* ----- 슬래시 · 링크 팝업 ----- */
function openPop(kind,t,b,q){const items=kind==='slash'?SL.filter(s=>!q||(s[1]+' '+s[4]).toLowerCase().includes(q.toLowerCase())).map(s=>({k:s[0],n:s[1],d:SOON.includes(s[0])?'개발 예정':s[0]==='ai'&&!AI?'claude.ai에서 열면 켜져요':s[2],i:s[3],dis:SOON.includes(s[0])||(s[0]==='ai'&&!AI)}))
    :[...live().filter(p=>p.id!==pg.id&&(!q||(p.title||'').toLowerCase().includes(q.toLowerCase()))).sort((a,c)=>c.updated-a.updated).slice(0,8).map(p=>({k:'page',p,n:pTitle(p),d:TYPES[p.type].n+(ancestors(p).length?' · '+ancestors(p).map(pTitle).join(' / '):''),i:TYPES[p.type].i})),...(q?[{k:'new',n:`새 문서 만들기: ${q}`,d:'이 문서 안에 만들어 연결',i:'plus',q}]:[]),...(kind==='wrap'?[{k:'url',n:'웹 주소로 링크…',d:'https://',i:'web'}]:[])];
  if(kind==='slash')(S.snips||[]).filter(s=>!q||s.n.toLowerCase().includes(q.toLowerCase())).forEach(s=>items.push({k:'snip:'+s.id,n:s.n,d:'내 블록',i:'star'}));
  if(!items.length&&kind==='slash'){hidePop();POP=null;return}
  POP={kind,t,b,q,items,act:Math.max(0,items.findIndex(x=>!x.dis))};const el=$('#pop');el.className=kind==='slash'?'slash':'slash';
  el.innerHTML=(kind==='slash'?'<div class="mh">블록 넣기</div>':`<div class="mh">${kind==='wrap'?'선택한 글에 링크':'문서 연결'}</div>`)+items.map((x,i)=>`<button class="mi" data-pi="${i}" ${x.dis?'disabled':''}><span class="bi">${x.p?pIcon(x.p):ic(x.i)}</span><span class="d">${esc(x.n)}<small>${esc(x.d||'')}</small></span></button>`).join('')+(items.length?'':'<p class="note" style="padding:8px 10px">맞는 문서가 없어요</p>');
  el.hidden=false;const r=caretRect()||t.getBoundingClientRect();place(el,r.left,r.bottom+6);markPop()}
function markPop(){$$('#pop .mi').forEach((e,i)=>{e.classList.toggle('act',i===POP.act);if(i===POP.act)e.scrollIntoView({block:'nearest'})})}
function closePop(){POP=null;hidePop()}
function delBack(n){const s=getSelection();for(let i=0;i<n;i++)s.modify('extend','backward','character');if(!s.isCollapsed)s.getRangeAt(0).deleteContents()}
async function choosePop(i){const it=POP?.items[i];if(!it||it.dis)return;const{kind,t,b,q}=POP;closePop();t.focus();
  if(kind==='slash'){delBack(q.length+1);sync(t);return applyBlock(it.k,t,b)}
  if(kind==='link')delBack(q.length+2);
  if(it.k==='url'){const sel=getSelection().toString();const r=getSelection().getRangeAt(0).cloneRange();const u=await ask('웹 주소',{ph:'https://'});if(!u||!svc(u))return u&&toast('http로 시작하는 주소를 넣어 주세요');t.focus();const s=getSelection();s.removeAllRanges();s.addRange(r);document.execCommand('insertHTML',false,`<a class="ul" href="${esc(u)}" target="_blank" rel="noopener" contenteditable="false">${esc(sel||u)}</a>&nbsp;`);sync(t);return}
  let tgt=it.p;if(it.k==='new'){tgt=newPage('doc',{title:it.q,parent:pg.id,blocks:[B('p')]});renderSide()}
  const label=kind==='wrap'?getSelection().toString():pTitle(tgt);document.execCommand('insertHTML',false,`<a class="pl${kind==='wrap'?' al':''}" data-page="${tgt.id}" contenteditable="false">${esc(label)}</a>&nbsp;`);sync(t);if(S.settings.panel)renderPanel()}
async function applyBlock(k,t,b){if(k.startsWith('snip:')){const sn=(S.snips||[]).find(x=>x.id===k.slice(5));const em=!strip(b.html)&&TEXTY.includes(b.type);insertMD(sn?.md||'',b);if(em)pg.blocks.splice(idx(b),1);render();touch(pg);return}const empty=!strip(b.html)&&TEXTY.includes(b.type);let tg=empty?b:ins(b,B('p','',{ind:b.ind||0}));
  const kidPage=type=>{const np=newPage(type,{parent:pg.id,title:type==='doc'?'':type==='db'?'새 데이터베이스':'새 캔버스'});tg.type='page';tg.page=np.id;tg.html='';render();touch(pg);renderSide();toast(`하위 ${TYPES[type].n}를 만들었어요`,{act:'열기',fn:()=>go('page:'+np.id)})};
  if(TEXTY.includes(k)){convert(tg,k);return}
  if(k==='link'){focusB(tg,'end');document.execCommand('insertText',false,'[[');return}
  if(k==='ai'){if(empty)tg=b;return aiWrite(tg)}
  if(k==='divider'){tg.type='divider';tg.html='';const nb=ins(tg,B('p'));render();focusB(nb);touch(pg);return}
  if(k==='code'){tg.type='code';tg.text='';tg.html='';tg.lang='';render();focusB(tg);touch(pg);return}
  if(k==='table'){Object.assign(tg,{type:'table',html:'',rows:[['','',''],['','',''],['','','']]});render();touch(pg);rowOf(tg)?.querySelector('td')?.focus();return}
  if(k==='math'){Object.assign(tg,{type:'math',html:'',tex:''});render();touch(pg);rowOf(tg)?.querySelector('textarea')?.focus();return}
  if(k==='button'){Object.assign(tg,{type:'button',html:'',label:'+ 할 일 추가',act:'todo'});render();touch(pg);return btnSet(tg)}
  if(k==='embed')k='bookmark';
  if(k==='toc'||k==='date'){Object.assign(tg,{type:k,html:'',date:today()});render();touch(pg);return}
  if(k==='page')return kidPage('doc');if(k==='database')return kidPage('db');if(k==='canvas')return kidPage('canvas');
  if(k==='bookmark'){const u=await ask('웹 링크 붙이기',{sub:'유튜브·노션·캔바·구글·네이버 등 어떤 주소든 돼요',ph:'https://'});if(!u||!svc(u)){if(empty)render();else{pg.blocks.splice(idx(tg),1);render()}return u&&toast('http로 시작하는 주소를 넣어 주세요')}const s=svc(u);Object.assign(tg,{type:'bookmark',url:u,title:s.guess||'',html:'',saved:today()});render();touch(pg);return}
  if(['image','video','audio','file'].includes(k)){Object.assign(tg,{type:k==='image'?'image':'media',kind:k,html:''});render();touch(pg);upload(tg)}}
async function upload(b){const acc={image:'image/*',video:'video/*',audio:'audio/*'}[b.kind||b.type]||'';const[f]=await pickFile(acc);if(!f)return;await attach(b,f);render();touch(pg)}
async function attach(b,f){b.src=await putBlob(f);b.name=f.name;const t=f.type||'';if(t.startsWith('image/')){b.type='image'}else{b.type='media';b.kind=t.startsWith('video')?'video':t.startsWith('audio')?'audio':'file';if(f.size<300000&&(/^text\/|json|csv|xml|javascript/.test(t)||/\.(txt|md|csv|json|js|ts|py|html|css|log)$/i.test(f.name))){try{b.preview=(await f.text()).slice(0,3000)}catch(e){}}}}
async function insertFiles(files,after){let last=after;for(const f of files){const nb=B('p');await attach(nb,f);last=ins(last,nb)}render();touch(pg);toast(`${files.length}개 파일을 넣었어요`)}
function mdLine(l,ind=0){const m=l.match(/^(\s*)(#{1,3} |[-*] \[[ xX]\] |[-*] |\d+[.)] |> |```)?(.*)$/);const pre=(m[2]||'').trim(),tx=fmtI(m[3]||''),d=ind+Math.floor((m[1]||'').length/2);
  if(pre.startsWith('#'))return B('h'+pre.length,tx,{ind:d});if(/\[[ xX]\]/.test(pre))return B('todo',tx,{ind:d,checked:/x/i.test(pre)});if(pre==='-'||pre==='*')return B('ul',tx,{ind:d});if(/^\d/.test(pre))return B('ol',tx,{ind:d});if(pre==='>')return B('quote',tx,{ind:d});return B('p',tx,{ind:d})}
function insertMD(text,after){let last=after,code=null;text.replace(/\r/g,'').split('\n').forEach(l=>{if(l.trim().startsWith('```')){if(code){last=ins(last,B('code','',{text:code.t.join('\n'),lang:code.lang}));code=null}else code={lang:l.trim().slice(3),t:[]};return}if(code){code.t.push(l);return}
  const tm=l.match(/^\|(.+)\|\s*$/);if(tm){if(/^\|[\s:-]+\|/.test(l)&&/-{3}/.test(l))return;const cells=tm[1].split('|').map(c=>fmtI(c.trim()));if(last&&last.type==='table'&&last._md){last.rows.push(cells)}else{last=ins(last,B('table','',{rows:[cells],_md:1}))}return}
  if(!l.trim())return;last=ins(last,mdLine(l))});pg.blocks.forEach(b=>delete b._md);return last}

/* ----- 서식 도구 ----- */
function showFmt(){const s=getSelection();const f=$('#fmt');if(!host||!s.rangeCount||s.isCollapsed){f.hidden=true;return}const n=s.anchorNode;const t=(n?.nodeType===1?n:n?.parentElement)?.closest?.('[data-f]');
  if(!t||!host.contains(t)||t.dataset.f==='text'||pg.lock){f.hidden=true;return}const r=s.getRangeAt(0).getBoundingClientRect();if(!r.width){f.hidden=true;return}
  f.innerHTML=`<button data-fx="bold" title="굵게 (Ctrl+B)" aria-label="굵게">${ic('bold')}</button><button data-fx="italic" title="기울임 (Ctrl+I)" aria-label="기울임">${ic('italic')}</button><button data-fx="underline" title="밑줄 (Ctrl+U)" aria-label="밑줄">${ic('underline')}</button><button data-fx="strikeThrough" title="취소선" aria-label="취소선">${ic('strike')}</button><button data-fx="code" title="인라인 코드" aria-label="코드">${ic('code')}</button><button data-fx="mark" title="형광펜" aria-label="형광펜">${ic('mark')}</button><button data-fx="color" title="글자 색" aria-label="글자 색">${ic('color')}</button><button data-fx="size" title="글자 크기" aria-label="글자 크기">가</button><span class="vs"></span><button data-fx="link" title="링크 (Ctrl+K)" aria-label="링크">${ic('link')}</button>${AI?`<span class="vs"></span><button class="ai" data-fx="ai" title="AI">${ic('ai')}AI</button>`:''}`;
  f.hidden=false;const w=f.offsetWidth;f.style.left=cl(r.left+r.width/2-w/2,6,innerWidth-w-6)+'px';f.style.top=Math.max(64,r.top-48)+'px'}
async function fmtCmd(k,btn){const s=getSelection();if(!s.rangeCount)return;const n=s.anchorNode;const t=(n.nodeType===1?n:n.parentElement).closest('[data-f]');const txt=s.toString();
  document.execCommand('styleWithCSS',false,false);
  if(['bold','italic','underline','strikeThrough'].includes(k))document.execCommand(k);
  if(k==='code')document.execCommand('insertHTML',false,`<code>${esc(txt)}</code>`);
  if(k==='mark')document.execCommand('insertHTML',false,`<mark>${esc(txt)}</mark>`);
  const r=btn.getBoundingClientRect(),saved=s.getRangeAt(0).cloneRange(),restore=()=>{t.focus();const ss=getSelection();ss.removeAllRanges();ss.addRange(saved)};
  if(k==='color')menu(r.left,r.bottom+4,[{h:'글자 색'},{colors:[{k:'inherit',v:'var(--ink)',n:'기본'},...TCOL.map(([n,c])=>({k:c,v:c,n}))],cur:'',fn:c=>{restore();document.execCommand('styleWithCSS',false,true);document.execCommand('foreColor',false,c==='inherit'?getComputedStyle(t).color:c);sync(t)}},{h:'글자 배경'},{colors:[{k:'transparent',v:'var(--paper)',n:'없음'},['#FFE27A'],['#FFC9C9'],['#C3F0D5'],['#C9DBFF'],['#E3D3FF']].map(x=>Array.isArray(x)?{k:x[0],v:x[0]}:x),cur:'',fn:c=>{restore();document.execCommand('styleWithCSS',false,true);document.execCommand('hiliteColor',false,c);sync(t)}}]);
  if(k==='size')menu(r.left,r.bottom+4,[['작게','2'],['보통','3'],['크게','5'],['아주 크게','6']].map(([n,v])=>({t:n,fn:()=>{restore();document.execCommand('fontSize',false,v);sync(t)}})));
  if(k==='link'){openPop('wrap',t,blk(t.closest('.blk').dataset.b),'');return}
  if(k==='ai')menu(r.left,r.bottom+4,[{h:'선택한 글을 AI로'},...[['polish','다듬기'],['spell','맞춤법 고치기'],['short','짧게 줄이기'],['en','영어로 번역'],['ko','한국어로 번역'],['sum','요약해서 아래에 넣기'],['list','목록으로 바꿔 아래에 넣기'],['table','표로 바꿔 아래에 넣기']].map(([a,n])=>({t:n,i:'ai',ai:1,fn:()=>aiSel(a,t,saved,txt)}))]);
  if(t)sync(t);setTimeout(showFmt,10)}

/* ----- AI ----- */
const AIP={polish:'다음 글을 뜻은 그대로 두고 더 자연스럽고 읽기 좋게 다듬어 줘. 다듬은 글만 출력해.',spell:'다음 글의 맞춤법과 띄어쓰기만 고쳐 줘. 고친 글만 출력해.',short:'다음 글을 핵심만 남겨 절반 길이로 줄여 줘. 결과만 출력해.',en:'다음 글을 자연스러운 영어로 번역해 줘. 번역문만 출력해.',ko:'다음 글을 자연스러운 한국어로 번역해 줘. 번역문만 출력해.',sum:'다음 글을 한국어로 3줄 이내로 요약해 줘. 각 줄은 "- "로 시작해. 요약만 출력해.',list:'다음 글을 핵심 항목 목록으로 바꿔 줘. 각 줄은 "- "로 시작해. 목록만 출력해.',table:'다음 글을 마크다운 표로 정리해 줘. 첫 줄은 머리글, 둘째 줄은 |---| 구분선. 표만 출력해.',expand:'다음 아이디어를 구체적인 하위 아이디어 5개로 확장해 줘. 각 줄은 "- "로 시작해. 목록만 출력해.'};
async function aiSel(a,t,range,txt){try{const out=await aiAsk(`${AIP[a]}\n\n---\n${txt}`);if(!out)throw 0;const row=t.closest('.blk'),b=blk(row.dataset.b);
  if(['polish','spell','short','en','ko'].includes(a)){t.focus();const s=getSelection();s.removeAllRanges();s.addRange(range);document.execCommand('insertText',false,out);sync(t);toast('AI가 바꿨어요 · Ctrl+Z로 되돌릴 수 있어요')}
  else{const last=insertMD(out,b);render();touch(pg);toast('AI 결과를 아래에 넣었어요')}}catch(e){aiErr(e)}}
async function aiBlock(b,a){try{const out=await aiAsk(`${AIP[a]}\n\n---\n${strip(b.html)}`);if(!out)throw 0;if(a==='expand'){insertMD(out,b);render()}else{const old=b.html;b.html=fmtI(out);render();toast('AI가 바꿨어요',{act:'되돌리기',fn:()=>{b.html=old;render();touch(pg)}})}touch(pg)}catch(e){aiErr(e)}}
async function aiWrite(b){const q=await ask('AI에게 무엇을 쓸까요?',{ph:'예: 유튜브 채널 시작 체크리스트',multi:true,ok:'쓰기'});if(!q)return;
  try{const ctx=textOf(pg.blocks).slice(0,3000);const out=await aiAsk(`너는 노트 앱의 글쓰기 도우미야. 문서 제목: "${pTitle(pg)}". 지금까지 내용:\n${ctx}\n\n요청: ${q}\n\n한국어 마크다운으로 써. 제목(##), 목록(-), 할 일(- [ ]), 표만 써도 돼. 결과만 출력해.`,{tier:'default'});if(!out)throw 0;
    const start=!strip(b.html)&&b.type==='p'?pg.blocks[idx(b)-1]||null:b;if(!strip(b.html)&&b.type==='p')pg.blocks.splice(idx(b),1);insertMD(out,start);render();touch(pg);toast('AI가 초안을 넣었어요')}catch(e){aiErr(e)}}
async function aiPage(kind){if(!pg)return;const body=textOf(pg.blocks).slice(0,8000);if(!body.trim()&&kind!=='rel')return toast('문서에 내용이 아직 없어요');
  try{if(kind==='sum'){const out=await aiAsk(`다음 문서를 한국어로 핵심만 3~5줄 요약해. 각 줄 "- "로 시작. 요약만 출력.\n\n제목: ${pTitle(pg)}\n${body}`);pg.blocks.unshift(B('callout',`<b>AI 요약</b><br>${fmtI(out).replace(/\n/g,'<br>')}`,{icon:'✨'}));render();touch(pg);toast('문서 맨 위에 요약을 넣었어요')}
    if(kind==='struct'){const out=await aiAsk(`다음 문서를 더 잘 정리하려면 어떤 구조(소제목 순서)가 좋을지 추천해. "## 소제목" 형식 줄과 그 아래 "- 들어갈 내용" 한두 줄로만 출력.\n\n제목: ${pTitle(pg)}\n${body}`);pg.blocks.push(B('h2','AI 구조 추천'));insertMD(out,pg.blocks.at(-1));render();touch(pg);Editor.scrollTo(pg.blocks.at(-1).id);toast('문서 끝에 구조 추천을 넣었어요')}
    if(kind==='qa'){const q=await ask('이 문서에 무엇을 물어볼까요?',{ph:'예: 결정된 일정이 뭐야?'});if(!q)return;const out=await aiAsk(`아래 문서 내용에만 근거해서 질문에 한국어로 답해. 문서에 없으면 "문서에서 찾을 수 없어요"라고 답해.\n\n문서:\n${body}\n\n질문: ${q}`);
      modal({title:'문서 기반 답변',html:`<p class="note">질문: ${esc(q)}</p><div style="white-space:pre-wrap;line-height:1.7">${esc(out)}</div>`,btns:[{t:'문서에 넣기',fn:()=>{pg.blocks.push(B('callout',`<b>Q. ${esc(q)}</b><br>${esc(out).replace(/\n/g,'<br>')}`,{icon:'❓'}));render();touch(pg)}},{t:'닫기',cls:'pr'}]})}
    if(kind==='rel'){const others=live().filter(p=>p.id!==pg.id&&p.type!=='folder').map(p=>`${p.id}::${pTitle(p)}`).slice(0,200).join('\n');const out=await aiAsk(`현재 문서와 관련 있을 만한 문서를 아래 목록에서 최대 5개 골라. 형식: 한 줄에 "ID::이유(15자 이내)". 다른 말 없이.\n\n현재 문서: ${pTitle(pg)}\n${body.slice(0,2500)}\n\n목록:\n${others}`);
      const rows=out.split('\n').map(l=>l.split('::')).filter(([id])=>P(id.trim()));modal({title:'AI가 추천한 관련 문서',html:rows.length?rows.map(([id,why])=>`<button class="rlink" data-go2="${id.trim()}">${pIcon(P(id.trim()))}<span>${esc(pTitle(P(id.trim())))}</span><small>${esc(why||'')}</small></button>`).join(''):'<p class="note">추천할 만한 문서를 찾지 못했어요.</p>',btns:[{t:'닫기',cls:'pr'}],onOpen:()=>{$('#mbody').onclick=e=>{const g=e.target.closest('[data-go2]');if(g){closeModal();go('page:'+g.dataset.go2)}}}})}}catch(e){aiErr(e)}}

/* ----- 버튼 · 조각 ----- */
function runBtn(b){const a=b.act||'todo';if(a==='todo'){const nb=ins(b,B('todo','',{ind:b.ind||0}));render();focusB(nb);touch(pg);return}
  if(a==='date'||a==='time'){const d=new Date();const nb=ins(b,B('p',a==='date'?kdate():`${kdate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`));render();focusB(nb);touch(pg);return}
  if(a==='quote'){const nb=ins(b,B('callout','',{icon:'✨'}));render();focusB(nb);touch(pg);return}
  if(a.startsWith('snip:')){const sn=(S.snips||[]).find(x=>x.id===a.slice(5));if(sn){insertMD(sn.md,b);render();touch(pg)}else toast('그 내 블록이 지워졌어요')}}
function btnSet(b){modal({title:'버튼 설정',html:`<div class="fld"><label>버튼 글자</label><input class="inp" id="bl" value="${esc(b.label||'')}"></div><div class="fld"><label>누르면</label><select class="inp" id="ba"><option value="todo">할 일 한 줄 추가</option><option value="date">오늘 날짜 넣기</option><option value="time">지금 시각 넣기</option><option value="quote">콜아웃 상자 추가</option>${(S.snips||[]).map(s=>`<option value="snip:${s.id}">내 블록: ${esc(s.n)}</option>`).join('')}<option value="url">링크 열기</option></select></div><div class="fld" id="bu"><label>링크 주소</label><input class="inp" id="burl" value="${esc(b.url||'')}" placeholder="https://"></div>`,
  btns:[{t:'취소'},{t:'저장',cls:'pr',fn:()=>{b.label=$('#bl').value.trim()||'버튼';b.act=$('#ba').value;b.url=$('#burl').value.trim();render();touch(pg)}}],onOpen:()=>{const s=$('#ba');s.value=b.act||'todo';const sh=()=>$('#bu').style.display=s.value==='url'?'':'none';s.onchange=sh;sh();$('#bl').focus()}})}
async function sendSync(b){const t=await pickPage('어느 문서에 조각을 붙일까요?',{filter:p=>p.type==='doc'&&p.id!==pg.id});if(!t)return;const dest=P(t);dest.blocks.push(B('sync','',{src:pg.id,blk:b.id}));touch(dest);toast(`‘${pTitle(dest)}’에 살아 있는 조각을 붙였어요`,{act:'열기',fn:()=>go('page:'+dest.id)})}

/* ----- 마운트 ----- */
function mount(p,el){pg=p;host=el;bsel.clear();ac=new AbortController();const sig={signal:ac.signal};render();
  el.addEventListener('input',e=>{const t=e.target;if(t.dataset.lang!==undefined){blk(t.closest('.blk').dataset.b).lang=t.value;touch(pg);return}const f=t.closest('[data-f]');if(!f)return;sync(f);const row=f.closest('.blk'),b=blk(row.dataset.b);if(f.dataset.f==='tex'){f.style.height='auto';f.style.height=f.scrollHeight+'px';return drawMath(row.querySelector('[data-mr]'),b.tex)}
    if(f.dataset.f==='html'&&b.type==='p'){const h=f.innerHTML;const m=h.match(/^(#{1,3}|[-*]|1\.|\[\]|\[ \]|&gt;)(?:&nbsp;|\s)/);if(m){const k={'#':'h1','##':'h2','###':'h3','-':'ul','*':'ul','1.':'ol','[]':'todo','[ ]':'todo','&gt;':'quote'}[m[1]];b.html=h.slice(m[0].length);convert(b,k);focusB(b,'start');return}
      if(/^```/.test(f.textContent)){b.html='';convert(b,'code');return}if(f.textContent==='---'){b.html='';b.type='divider';const nb=ins(b,B('p'));render();focusB(nb);touch(pg);return}}
    if(['h1','h2','h3'].includes(b.type)&&S.settings.panel&&ui.ptab==='toc')renderPanel();
    if(f.dataset.f!=='html'&&f.dataset.f!=='body')return;const bc=beforeCaret(f)||'';const sm=bc.match(/(?:^|\s)\/([^\s/]{0,20})$/),lm=bc.match(/\[\[([^\][]{0,40})$/);
    if(lm)openPop('link',f,b,lm[1]);else if(sm&&f.dataset.f==='html')openPop('slash',f,b,sm[1]);else if(POP)closePop()},sig);
  el.addEventListener('keydown',e=>{
    if(POP){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const n=POP.items.length;let a=POP.act;do{a=(a+(e.key==='ArrowDown'?1:-1)+n)%n}while(POP.items[a]?.dis&&a!==POP.act);POP.act=a;return markPop()}
      if((e.key==='Enter'||e.key==='Tab')&&!e.isComposing){e.preventDefault();return choosePop(POP.act)}if(e.key==='Escape'){e.preventDefault();return closePop()}}
    const t=e.target.closest('[data-f]');if(!t)return;const row=t.closest('.blk'),b=blk(row.dataset.b),f=t.dataset.f,mod=e.ctrlKey||e.metaKey,ime=e.isComposing||e.keyCode===229;
    if(mod&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopPropagation();const s=getSelection();if(s.rangeCount&&!s.isCollapsed)openPop('wrap',t,b,'');else{document.execCommand('insertText',false,'[[')}return}
    if(mod&&e.key.toLowerCase()==='d'){e.preventDefault();e.stopPropagation();return dupB(b)}
    if(e.altKey&&e.shiftKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();moveB(b,e.key==='ArrowUp'?-1:1);return focusB(b)}
    if(f==='cell'){if(e.key==='Tab'){e.preventDefault();const tds=[...row.querySelectorAll('td')];const i=tds.indexOf(t);const n=tds[i+(e.shiftKey?-1:1)];if(n)placeCaret(n,'end');else if(!e.shiftKey){b.rows.push(b.rows[0].map(()=>''));render();touch(pg);const all=rowOf(b).querySelectorAll('td');placeCaret(all[all.length-b.rows[0].length])}}return}
    if(f==='text'&&b.type==='code'){if(e.key==='Enter'&&mod){e.preventDefault();const nb=ins(b,B('p'));render();focusB(nb);touch(pg)}else if(e.key==='Tab'){e.preventDefault();document.execCommand('insertText',false,'  ')}else if(e.key==='Backspace'&&!t.textContent&&collapsed()){e.preventDefault();b.type='p';b.html='';render();focusB(b);touch(pg)}return}
    if(f!=='html')return;
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(ime)return;return split(t,b)}
    if(e.key==='Backspace'&&collapsed()&&beforeCaret(t)===''){e.preventDefault();return backspace(t,b)}
    if(e.key==='Delete'&&collapsed()&&afterCaret(t)===''){e.preventDefault();return forwardDel(t,b)}
    if(e.key==='Tab'){e.preventDefault();b.ind=cl((b.ind||0)+(e.shiftKey?-1:1),0,6);row.style.setProperty('--ind',b.ind);nums();touch(pg);return}
    if(e.key==='ArrowUp'&&!e.shiftKey&&lineEdge(t,true)){const es=editables(),i=es.indexOf(t);if(i>0){e.preventDefault();placeCaret(es[i-1],'end')}}
    if(e.key==='ArrowDown'&&!e.shiftKey&&lineEdge(t,false)){const es=editables(),i=es.indexOf(t);if(i>=0&&i<es.length-1){e.preventDefault();placeCaret(es[i+1],'start')}}});
  el.addEventListener('paste',async e=>{const t=e.target.closest('[data-f]');if(!t||pg.lock)return;const b=blk(t.closest('.blk').dataset.b);const fs=[...(e.clipboardData?.files||[])];
    if(fs.length){e.preventDefault();if(b.type==='image'&&!b.src){await attach(b,fs[0]);render();touch(pg);return}return insertFiles(fs,b)}
    const text=e.clipboardData.getData('text/plain');if(!text)return;e.preventDefault();
    if(t.dataset.f==='text'||t.dataset.f==='cell'||t.dataset.f==='cap'||t.dataset.f==='body'){document.execCommand('insertText',false,text);return}
    const u=text.trim();if(/^https?:\/\/\S+$/.test(u)&&svc(u)){const r=caretRect()||t.getBoundingClientRect(),s2=getSelection().getRangeAt(0).cloneRange();menu(r.left,r.bottom+6,[{h:'붙여넣은 링크를'},{t:'링크 카드로 넣기',i:'web',fn:()=>{const s=svc(u);const nb=!strip(b.html)&&b.type==='p'?b:ins(b,B('p'));Object.assign(nb,{type:'bookmark',url:u,title:s.guess||'',html:'',saved:today()});render();touch(pg)}},{t:'글 속 링크로 넣기',i:'link',fn:()=>{t.focus();const s=getSelection();s.removeAllRanges();s.addRange(s2);document.execCommand('insertHTML',false,`<a class="ul" href="${esc(u)}" target="_blank" rel="noopener" contenteditable="false">${esc(u)}</a>&nbsp;`);sync(t)}},{t:'그냥 글자로',i:'text',fn:()=>{t.focus();const s=getSelection();s.removeAllRanges();s.addRange(s2);document.execCommand('insertText',false,u)}}]);return}
    const lines=text.replace(/\r/g,'').split('\n');if(lines.length<=1){document.execCommand('insertText',false,text);return}
    document.execCommand('insertText',false,lines[0]);sync(t);const last=insertMD(lines.slice(1).join('\n'),b);render();touch(pg);if(last)focusB(last,'end')});
  el.addEventListener('click',e=>{const wl=e.target.closest('a[href]:not(.pl)');if(wl&&wl.closest('[data-f]')){e.preventDefault();const u=wl.getAttribute('href');if(e.ctrlKey||e.metaKey){Mind.openURL(u);return}const r=wl.getBoundingClientRect();menu(r.left,r.bottom+4,[{h:u.length>48?u.slice(0,48)+'…':u},{t:'새 탭에서 열기',i:'web',fn:()=>Mind.openURL(u)},{t:'주소 복사',i:'copy',fn:()=>{navigator.clipboard?.writeText(u);toast('복사했어요')}},{t:'링크 지우기 (글자는 남기기)',i:'x',fn:()=>{wl.replaceWith(document.createTextNode(wl.textContent));const f=el.querySelector('[data-f]');f&&f.dispatchEvent(new Event('input',{bubbles:true}))}}]);return}const a=e.target.closest('a.pl');if(a){e.preventDefault();const q=P(a.dataset.page);if(q&&e.shiftKey)return Peek.big(q);if(q&&!q.trash)go('page:'+q.id);else toast('연결된 문서가 없거나 휴지통에 있어요');return}
    const row=e.target.closest('.blk');if(e.target.closest('[data-tail]')){if(pg.lock)return;const l=pg.blocks.at(-1);if(l&&l.type==='p'&&!strip(l.html))return focusB(l);const nb=ins(null,B('p'));render();focusB(nb);touch(pg);return}
    if(!row)return;const b=blk(row.dataset.b);
    if(e.target.closest('[data-tg]')){b.open=!b.open;row.classList.toggle('open',b.open);touch(pg);return}
    if(e.target.closest('[data-ci]')&&!pg.lock){const r=e.target.getBoundingClientRect();return calloutIcon(b,r.left,r.bottom+4)}
    if(e.target.closest('[data-cc]')){navigator.clipboard?.writeText(b.text||'').then(()=>toast('코드를 복사했어요'),()=>toast('복사가 막혀 있어요'));return}
    if(e.target.closest('[data-up]'))return upload(b);if(e.target.closest('[data-pdf]'))return PDFV.open(b.src,b,()=>touch(pg));if(e.target.closest('[data-run]'))return runBtn(b);if(e.target.closest('[data-bset]'))return btnSet(b);if(e.target.closest('[data-zoom]'))return zoomImg(b);if(e.target.closest('[data-dlb]'))return dlBlob(b.src);
    const sb=e.target.closest('[data-sb]');if(sb)return Editor.scrollTo(sb.dataset.sb);
    const tb=e.target.closest('[data-tb]');if(tb){const k=tb.dataset.tb;if(k==='row')b.rows.push(b.rows[0].map(()=>''));if(k==='col')b.rows.forEach(r=>r.push(''));if(k==='drow'&&b.rows.length>1)b.rows.pop();if(k==='dcol'&&b.rows[0].length>1)b.rows.forEach(r=>r.pop());render();touch(pg);return}
    if(e.target.closest('[data-add]')){const nb=ins(b,B('p',"",{ind:b.ind||0}));render();focusB(nb);document.execCommand('insertText',false,'/');touch(pg);return}},sig);
  el.addEventListener('focusin',e=>{const row=e.target.closest('.blk');if(row)lastB=row.dataset.b},sig);
  el.addEventListener('change',e=>{const t=e.target,row=t.closest('.blk');if(!row)return;const b=blk(row.dataset.b);
    if(t.dataset.ck!==undefined){b.checked=t.checked;row.classList.toggle('done',t.checked);touch(pg)}if(t.dataset.date!==undefined){b.date=t.value;render();touch(pg)}
    if(t.dataset.rate!==undefined){const m=row.querySelector('video,audio');if(m)m.playbackRate=+t.value}});
  // 블록 핸들: 끌기 / 메뉴
  el.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-hd]');if(!h)return;e.preventDefault();const row=h.closest('.blk'),b=blk(row.dataset.b);const y0=e.clientY;let drag=false,line=null,to=null;
    if(e.shiftKey){bsel.has(b.id)?bsel.delete(b.id):bsel.add(b.id);row.classList.toggle('bsel',bsel.has(b.id));return}
    const mv=ev=>{if(!drag&&Math.abs(ev.clientY-y0)>4){drag=true;const moving=bsel.has(b.id)?[...bsel]:[b.id];moving.forEach(id=>host.querySelector(`[data-b="${id}"]`)?.classList.add('dragging'));line=document.createElement('div');line.className='dropline';host.appendChild(line)}
      if(!drag)return;const rows=[...host.querySelectorAll('.blk:not(.dragging)')];let best=rows.length,y=0;for(let i=0;i<rows.length;i++){const r=rows[i].getBoundingClientRect();if(ev.clientY<r.top+r.height/2){best=i;break}}
      const hr=host.getBoundingClientRect();if(rows[best]){y=rows[best].getBoundingClientRect().top-hr.top-2}else if(rows.length){const r=rows.at(-1).getBoundingClientRect();y=r.bottom-hr.top}to=rows[best]?.dataset.b||null;line.style.top=y+'px';
      const m=$('#main');const mr=m.getBoundingClientRect();if(ev.clientY<mr.top+50)m.scrollTop-=12;if(ev.clientY>mr.bottom-50)m.scrollTop+=12};
    const upf=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',upf);line?.remove();
      if(!drag){const r=h.getBoundingClientRect();if(!bsel.has(b.id)&&bsel.size){bsel.clear();host.querySelectorAll('.bsel').forEach(x=>x.classList.remove('bsel'))}return blockMenu(b,r.left,r.bottom+4)}
      const ids=bsel.has(b.id)?pg.blocks.filter(q=>bsel.has(q.id)).map(q=>q.id):[b.id];const moving=ids.map(blk);pg.blocks=pg.blocks.filter(q=>!ids.includes(q.id));let i=to?pg.blocks.findIndex(q=>q.id===to):pg.blocks.length;if(i<0)i=pg.blocks.length;pg.blocks.splice(i,0,...moving);render();touch(pg)};
    addEventListener('pointermove',mv,sig);addEventListener('pointerup',upf,sig)},sig);
  el.addEventListener('contextmenu',e=>{const h=e.target.closest('[data-hd]');if(!h)return;e.preventDefault();const b=blk(h.closest('.blk').dataset.b);blockMenu(b,e.clientX,e.clientY)},sig);
  // 파일·페이지 끌어다 놓기
  el.addEventListener('dragover',e=>{const ty=[...e.dataTransfer.types];if((ty.includes('Files')||ty.includes('application/x-un-page'))&&!pg.lock){e.preventDefault()}},sig);
  el.addEventListener('drop',async e=>{const ty=[...e.dataTransfer.types];if(pg.lock)return;const rows=[...host.querySelectorAll('.blk')];let after=null;for(const r of rows){if(r.getBoundingClientRect().top<e.clientY)after=blk(r.dataset.b)}
    if(ty.includes('application/x-un-page')){e.preventDefault();const id=e.dataTransfer.getData('application/x-un-page');if(id&&id!==pg.id&&P(id)){ins(after,B('page','',{page:id}));render();touch(pg);toast(`‘${pTitle(P(id))}’ 링크를 넣었어요`)}dragIds=[];return}
    if(e.dataTransfer.files.length){e.preventDefault();insertFiles([...e.dataTransfer.files],after)}},sig);
  document.addEventListener('selectionchange',()=>{clearTimeout(mount._t);mount._t=setTimeout(showFmt,120)},sig);
  $('#fmt').addEventListener('pointerdown',e=>e.preventDefault(),sig);$('#fmt').addEventListener('click',e=>{const b=e.target.closest('[data-fx]');if(b)fmtCmd(b.dataset.fx,b)},sig);
  $('#main').addEventListener('scroll',()=>{$('#fmt').hidden=true;if(POP)closePop()},sig);
  return{unmount(){ac.abort();$('#fmt').hidden=true;closePop();if(verDirty[pg.id])snapVersion(pg);pg=null;host=null},
    onKey(e){if(e.key==='Escape'&&bsel.size){bsel.clear();render();return true}if((e.key==='Delete'||e.key==='Backspace')&&bsel.size&&!document.activeElement?.isContentEditable){const b=blk([...bsel][0]);const r=rowOf(b).getBoundingClientRect();blockMenu(b,r.left,r.top);return true}return false}}}

/* ----- 텍스트 · 마크다운 ----- */
function headings(p){return(p.blocks||[]).filter(b=>/^h[123]$/.test(b.type)).map(b=>({id:b.id,l:+b.type[1],t:strip(b.html)}))}
function textOf(blocks){return(blocks||[]).map(b=>b.type==='code'?b.text||'':b.type==='table'?(b.rows||[]).map(r=>r.map(strip).join(' | ')).join('\n'):b.type==='bookmark'?`${b.title||''} ${b.url||''} ${strip(b.html)}`:b.type==='page'?(P(b.page)?pTitle(P(b.page)):''):['image','media'].includes(b.type)?`${blobs[b.src]?.name||b.name||''} ${strip(b.cap)} ${b.preview||''}`:b.type==='date'?b.date||'':strip(b.html)+(b.body?'\n'+strip(b.body):'')).join('\n')}
function htmlMD(h){const d=document.createElement('div');d.innerHTML=h||'';const w=n=>{if(n.nodeType===3)return n.textContent;const c=[...n.childNodes].map(w).join('');const t=n.tagName;
  if(t==='B'||t==='STRONG')return c.trim()?`**${c}**`:c;if(t==='I'||t==='EM')return c.trim()?`*${c}*`:c;if(t==='S'||t==='STRIKE')return `~~${c}~~`;if(t==='CODE')return '`'+c+'`';if(t==='MARK')return `==${c}==`;if(t==='BR')return '\n';
  if(t==='A'&&n.classList.contains('pl'))return `[[${P(n.dataset.page)?pTitle(P(n.dataset.page)):c}]]`;if(t==='A')return `[${c}](${n.getAttribute('href')})`;if(t==='DIV'||t==='P')return c+'\n';if(t==='LI')return '- '+c+'\n';return c};return w(d).replace(/\n+$/,'')}
function toMD(blocks){let n=0;return(blocks||[]).map(b=>{const pad='  '.repeat(b.ind||0),h=htmlMD(b.html);if(b.type!=='ol')n=0;
  switch(b.type){case 'h1':return `# ${h}`;case 'h2':return `## ${h}`;case 'h3':return `### ${h}`;case 'ul':return pad+'- '+h;case 'ol':return pad+`${++n}. `+h;case 'todo':return pad+`- [${b.checked?'x':' '}] `+h;case 'quote':return '> '+h;case 'callout':return `> ${b.icon||'💡'} ${h}`;
    case 'toggle':return `<details><summary>${h}</summary>\n\n${htmlMD(b.body)}\n</details>`;case 'divider':return '---';case 'code':return '```'+(b.lang||'')+'\n'+(b.text||'')+'\n```';
    case 'table':{const r=(b.rows||[]).map(x=>x.map(c=>htmlMD(c).replace(/\|/g,'\\|')||' '));return r.length?`| ${r[0].join(' | ')} |\n|${r[0].map(()=>' --- |').join('')}\n`+r.slice(1).map(x=>`| ${x.join(' | ')} |`).join('\n'):''}
    case 'image':return `![${htmlMD(b.cap)||blobs[b.src]?.name||'이미지'}](${blobs[b.src]?.name||'image'})`;case 'media':return `[첨부: ${blobs[b.src]?.name||b.name||'파일'}]`;case 'page':return `[[${P(b.page)?pTitle(P(b.page)):'삭제된 페이지'}]]`;
    case 'bookmark':return `[${b.title||b.url}](${b.url})${h?' — '+h:''}`;case 'toc':return '[목차]';case 'date':return `📅 ${b.date||''}`;default:return pad+h}}).join('\n\n').replace(/\n{3,}/g,'\n\n')}
function toHTML(blocks){let n=0;return(blocks||[]).map(b=>{const h=b.html||'';if(b.type!=='ol')n=0;const ind=`style="margin-left:${(b.ind||0)*22}px"`;
  switch(b.type){case 'h1':return `<h2>${h}</h2>`;case 'h2':return `<h3>${h}</h3>`;case 'h3':return `<h4>${h}</h4>`;case 'ul':return `<p ${ind}>• ${h}</p>`;case 'ol':return `<p ${ind}>${++n}. ${h}</p>`;case 'todo':return `<p ${ind}>${b.checked?'☑':'☐'} ${h}</p>`;case 'quote':return `<blockquote>${h}</blockquote>`;case 'callout':return `<div class="pcall">${b.icon||'💡'} ${h}</div>`;
    case 'toggle':return `<details><summary>${h}</summary>${b.body||''}</details>`;case 'divider':return '<hr>';case 'code':return `<pre>${esc(b.text||'')}</pre>`;case 'math':return `<pre>${esc(b.tex||'')}</pre>`;case 'table':return `<table class="ptab">${(b.rows||[]).map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
    case 'image':return b.src?`<img src="${burl(b.src)}" alt="" style="max-width:100%;border-radius:8px">`:'';case 'media':return `<p>📎 ${esc(blobs[b.src]?.name||b.name||'파일')}</p>`;case 'page':return `<p>↗ ${esc(P(b.page)?pTitle(P(b.page)):'')}</p>`;case 'bookmark':return `<p>🔗 ${esc(b.title||b.url)}</p>`;case 'date':return `<p>📅 ${esc(b.date||'')}</p>`;case 'button':return `<p>[${esc(b.label||'버튼')}]</p>`;case 'sync':return '<p>(살아 있는 조각)</p>';case 'toc':return '';default:return `<p ${ind}>${h}</p>`}}).join('')}
function mdBlocks(text){const save=pg;const tmp={blocks:[]};pg=tmp;try{insertMD(text,null)}finally{pg=save}return tmp.blocks}
return{insert:k=>{if(!pg||pg.lock)return;const b=blk(lastB)||pg.blocks.at(-1);applyBlock(k,edOf(b),b)},style:k=>{if(!pg||pg.lock)return;const b=blk(lastB)||pg.blocks.at(-1);if(TEXTY.includes(b.type)||b.type==='code')convert(b,k);else{const nb=ins(b,B(k));render();focusB(nb);touch(pg)}},fmt:(k,btn)=>fmtCmd(k,btn),toHTML,mdBlocks,
  mount,headings,text:p=>textOf(p.blocks),textOf,toMD,aiPage:k=>aiPage(k),
  scrollTo(id){const e=host?.querySelector(`[data-b="${id}"]`);if(!e)return;e.scrollIntoView({behavior:'smooth',block:'center'});e.classList.remove('flash');void e.offsetWidth;e.classList.add('flash')},
  focusFirst(){if(!pg)return;let b=pg.blocks.find(x=>TEXTY.includes(x.type));if(!b){b=B('p');pg.blocks.unshift(b);render()}focusB(b,'end')}}
})();
