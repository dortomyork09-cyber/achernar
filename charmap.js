/* 문자표 — 한글(HWP)의 Ctrl+F10처럼 특수문자를 골라 넣기 */
const CharMap=(()=>{
const S=s=>[...s.replace(/\s+/g,'')];
const SETS=[
 ['자주 쓰는','※★☆●○◎◇◆□■△▲▽▼→←↑↓↔·…‥「」『』【】〈〉《》“”‘’°℃±×÷≠≤≥∞√∴∵♡♥✓✔✕'],
 ['원·괄호 숫자','①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳❶❷❸❹❺❻❼❽❾❿⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑'],
 ['원·괄호 한글','㉠㉡㉢㉣㉤㉥㉦㉧㉨㉩㉪㉫㉬㉭㉮㉯㉰㉱㉲㉳㉴㉵㉶㉷㉸㉹㉺㉻㈀㈁㈂㈃㈄㈅㈆㈇㈈㈉㈎㈏㈐㈑㈒㈓㈔㈕㈖㈗㈘㈙㈚㈛'],
 ['원·괄호 영문','ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⒜⒝⒞⒟⒠⒡⒢⒣'],
 ['로마 숫자','ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ'],
 ['화살표','→←↑↓↔↕↗↘↙↖⇒⇐⇔⇑⇓⇄⇆↻↺➔➜➝➞➡⟶⟵⟷▶◀▷◁►◄'],
 ['도형','●○◎◉◐◑◒◓■□▣▤▥▦▧▨▩▪▫◆◇◈▲△▼▽◀◁▶▷★☆✦✧❖♠♤♣♧♥♡♦♢☐☑☒'],
 ['수학','+−×÷=≠≈≡≤≥<>±∓∞∝√∛∑∏∫∬∮∂∇∆∈∉∋⊂⊃⊆⊇∪∩∧∨¬∀∃∅∴∵∠⊥∥°′″‰%½⅓⅔¼¾⅛⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ₀₁₂₃₄₅₆₇₈₉'],
 ['단위','℃℉°Å㎜㎝㎞㎎㎏㎖㎗㎘㎡㎥㎢㎐㎑㎒㎳㎲㎰㎾㎿㎽㏃㏈㏊₩$€£¥¢'],
 ['그리스','αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'],
 ['문장 부호','·•‥…¨〃―‐–—～∼‖|¦§¶†‡‰※〓「」『』【】〔〕〈〉《》（）［］｛｝“”‘’„«»¡¿'],
 ['한글 자모','ㄱㄲㄳㄴㄵㄶㄷㄸㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅃㅄㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣㆍㅿㆆ'],
 ['일본어','あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテト'],
 ['이모지','😀😂😊😍🤔😎😭😡👍👎👏🙏💪🔥✨⭐🎉🎯📌📎📝📚📖✏️💡🔍⏰📅✅❌⚠️❓❗💯🏀⚽🎸🎵🎮🌱🌍🚀']
];
const RK='ach-cm-recent';let recent=[];try{recent=JSON.parse(localStorage.getItem(RK)||'[]')}catch(e){}
let lastEd=null,lastRange=null;
const isEd=el=>el&&el.nodeType===1&&(el.isContentEditable||el.tagName==='TEXTAREA'||(el.tagName==='INPUT'&&/^(text|search|)$/.test(el.type)));
document.addEventListener('focusin',e=>{if(isEd(e.target)&&!e.target.closest('#cmap'))lastEd=e.target},true);
document.addEventListener('selectionchange',()=>{const s=getSelection();if(!s.rangeCount)return;const n=s.anchorNode;const el=n&&(n.nodeType===1?n:n.parentElement);if(el&&el.closest&&el.closest('[contenteditable]')&&!el.closest('#cmap')){lastEd=el.closest('[contenteditable]');lastRange=s.getRangeAt(0).cloneRange()}});
let mark=null;
function offOf(ed,r){try{const x=document.createRange();x.selectNodeContents(ed);x.setEnd(r.startContainer,r.startOffset);return x.toString().length}catch(e){return null}}
function remember(ed,r){const card=ed.closest('.card');mark={cid:card&&card.dataset.id,f:ed.dataset.f||null,blk:ed.closest('[data-bid]')?.dataset.bid||null,off:r?offOf(ed,r):null}}
function refind(){if(lastEd&&lastEd.isConnected)return lastEd;if(!mark)return null;let host=mark.cid?document.querySelector(`.card[data-id="${mark.cid}"]`):document;if(!host)return null;if(mark.blk)host=host.querySelector(`[data-bid="${mark.blk}"]`)||host;
  const el=host.querySelector(mark.f?`[contenteditable][data-f="${mark.f}"]`:'[contenteditable]');if(!el)return null;lastEd=el;
  if(mark.off!=null){const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n,left=mark.off,r=document.createRange();r.selectNodeContents(el);r.collapse(false);while(n=w.nextNode()){if(left<=n.length){r.setStart(n,left);r.collapse(true);break}left-=n.length}lastRange=r}return el}
function put(ch){
  const ed=refind();
  if(ed&&(ed.tagName==='TEXTAREA'||ed.tagName==='INPUT')){ed.focus();const a=ed.selectionStart??ed.value.length,b=ed.selectionEnd??a;ed.setRangeText(ch,a,b,'end');ed.dispatchEvent(new Event('input',{bubbles:true}))}
  else if(ed){ed.focus();const s=getSelection();if(lastRange&&ed.contains(lastRange.startContainer)){s.removeAllRanges();s.addRange(lastRange)}
    if(!document.execCommand('insertText',false,ch)){const r=s.getRangeAt(0);r.deleteContents();r.insertNode(document.createTextNode(ch));r.collapse(false)}
    if(s.rangeCount){lastRange=s.getRangeAt(0).cloneRange();remember(ed,lastRange)}}
  else if(typeof Canvas!=='undefined'&&Canvas.api.C&&Canvas.api.C()){const A=Canvas.api,[x,y]=A.center();const n=A.mk('text',x-60,y-30,{text:ch,w:140,h:70});A.push();A.render();A.save();A.setSel([n.id]);
    setTimeout(()=>{const el=document.querySelector(`.card[data-id="${n.id}"] [contenteditable]`);if(el){lastEd=el;el.focus();const r=document.createRange();r.selectNodeContents(el);r.collapse(false);const s=getSelection();s.removeAllRanges();s.addRange(r);lastRange=r.cloneRange()}},30)}
  else{navigator.clipboard?.writeText(ch);typeof toast==='function'&&toast(`‘${ch}’ 복사했어요 · 붙여넣기 하세요`)}
  recent=[ch,...recent.filter(c=>c!==ch)].slice(0,24);try{localStorage.setItem(RK,JSON.stringify(recent))}catch(e){}
}
let tab=0;
function grid(){const p=document.querySelector('#cmap');if(!p)return;const q=p.querySelector('.cmq').value.trim();
  let list=q?[...new Set(SETS.flatMap(s=>S(s[1])))].filter(c=>c===q||c.includes(q)):(tab===-1?recent:S(SETS[tab][1]));
  p.querySelector('.cmg').innerHTML=list.length?list.map(c=>`<button data-ch="${c}" title="${c}  U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}">${c}</button>`).join(''):`<p class="cme">${tab===-1?'아직 쓴 문자가 없어요':'없어요'}</p>`;
  p.querySelectorAll('.cmt button').forEach(b=>b.classList.toggle('on',+b.dataset.t===tab))}
function open(){let p=document.querySelector('#cmap');if(p){p.remove();return}if(lastEd&&lastEd.isConnected)remember(lastEd,lastRange);
  p=document.createElement('div');p.id='cmap';
  p.innerHTML=`<div class="cmh"><b>문자표</b><span class="cmk">Ctrl+F10</span><input class="cmq" placeholder="문자 검색 (예: →)" maxlength="4"><button class="cmx" aria-label="닫기">✕</button></div><div class="cmt"><button data-t="-1">최근</button>${SETS.map((s,i)=>`<button data-t="${i}">${s[0]}</button>`).join('')}</div><div class="cmg"></div><p class="cmf">글 쓰다가 \\ 를 누르면 바로 불러올 수 있어요</p>`;
  document.body.appendChild(p);
  // 누를 때 편집기 포커스를 빼앗지 않도록
  p.addEventListener('mousedown',e=>{if(!e.target.closest('.cmq'))e.preventDefault()});
  p.addEventListener('pointerdown',e=>e.stopPropagation());
  p.onclick=e=>{const c=e.target.closest('[data-ch]');if(c)return put(c.dataset.ch);const t=e.target.closest('[data-t]');if(t){tab=+t.dataset.t;p.querySelector('.cmq').value='';return grid()}if(e.target.closest('.cmx'))p.remove()};
  p.querySelector('.cmq').oninput=grid;
  p.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();p.remove()}});
  // 머리 부분 끌어서 옮기기
  const h=p.querySelector('.cmh');h.addEventListener('pointerdown',e=>{if(e.target.closest('input,button'))return;const r=p.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top;
    const mv=ev=>{p.style.left=Math.max(0,Math.min(innerWidth-r.width,ev.clientX-ox))+'px';p.style.top=Math.max(0,Math.min(innerHeight-40,ev.clientY-oy))+'px';p.style.right='auto';p.style.bottom='auto'};
    const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};addEventListener('pointermove',mv);addEventListener('pointerup',up)});
  if(!recent.length&&tab===-1)tab=0;grid()}

/* ---------- 글 쓰다가 \ 로 바로 부르기 ---------- */
const NAMES=[
 ['→←↑↓↔⇒⇐⇔↗↘↻','화살표 arrow 오른쪽 왼쪽 위 아래 따라서'],['★☆✦','별 star'],['✓✔☑','체크 check 확인 v'],['✕✗☒','엑스 x 틀림 아니오'],
 ['●○◎◉','동그라미 원 circle 점'],['■□▣','네모 사각 square 박스'],['▲△▼▽▶◀','세모 삼각 triangle 재생'],['◆◇','마름모 diamond'],['♥♡','하트 heart 사랑'],
 ['①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮','원숫자 동그라미숫자 1 2 3 4 5 6 7 8 9 10 번호'],['❶❷❸❹❺','검은원숫자 1 2 3 4 5 번호'],['⑴⑵⑶⑷⑸','괄호숫자 1 2 3 4 5'],
 ['㉠㉡㉢㉣㉤㉥㉦㉧','원한글 ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ 기역'],['㉮㉯㉰㉱㉲','원한글 가 나 다 라 마'],['ⓐⓑⓒⓓⓔ','원영문 a b c d e'],['ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ','로마 roman 1 2 3 4 5'],
 ['·…‥','점 가운뎃점 말줄임 dot'],['「」『』【】〈〉《》','괄호 낫표 책 제목 bracket'],['“”‘’','따옴표 quote'],['※','참고 주의 쌀미'],['〃','같음 ditto'],
 ['±×÷≠≈≤≥∞√∑∫','수학 math 곱하기 나누기 같지않다 약 이하 이상 무한 루트 합 적분 플러스마이너스'],['∴∵','따라서 왜냐하면 therefore'],['∠⊥∥△','각 수직 평행 기하'],
 ['²³¹⁰ⁿ','제곱 위첨자 세제곱 지수'],['₁₂₃₀','아래첨자 화학'],['½⅓¼¾','분수 반 fraction'],['°℃℉','도 온도 섭씨 화씨'],['%‰','퍼센트 퍼밀'],
 ['㎜㎝㎞㎎㎏㎖ℓ㎡㎥','단위 cm kg ml 미터 그램 리터'],['₩$€£¥','돈 원 달러 유로 엔 화폐'],['αβγδθλμπσω','그리스 알파 베타 감마 델타 세타 람다 뮤 파이 시그마 오메가'],
 ['♠♣♦♪♬','카드 음표 음악 note'],['☀☁☂☎✉✂✏','날씨 해 구름 우산 전화 편지 가위 연필'],['😀😂😊🥲😭👍👏🙏🔥✨🎉📌💡❗❓','이모지 emoji 웃음 좋아 박수 불 반짝 축하 핀 아이디어 느낌표 물음표']
];
const COMMON=[...'→⇒↔·…※★☆●○■□▲△✓✕①②③④⑤「」『』“”±×÷≠≤≥°℃∴∵²'];
const ALL=(()=>{const m=new Map();for(const[cs,k]of NAMES)for(const c of [...cs])m.set(c,(m.get(c)||'')+' '+k);return m})();
let qp=null,qsel=0,qlist=[];
function qFind(q){q=q.trim().toLowerCase();if(!q)return[...new Set([...recent.slice(0,10),...COMMON])];
  if(/^\d{1,2}$/.test(q)){const n=+q,r=[];if(n>=1&&n<=20)r.push(String.fromCodePoint(0x245F+n));if(n>=1&&n<=10)r.push(String.fromCodePoint(0x2775+n),String.fromCodePoint(0x2473+n),String.fromCodePoint(0x215F+n));return r}
  const out=[];for(const[c,k]of ALL){if(c===q||k.split(' ').some(w=>w&&w.startsWith(q))||k.includes(q))out.push(c)}return out.slice(0,60)}
function qDraw(){if(!qp)return;const q=qp.querySelector('input').value;qlist=qFind(q);if(qsel>=qlist.length)qsel=0;
  qp.querySelector('.qg').innerHTML=qlist.length?qlist.map((c,i)=>`<button data-ch="${c}" class="${i===qsel?'on':''}">${c}</button>`).join(''):`<p>‘${q.replace(/[<&]/g,'')}’ 없어요</p>`}
function qClose(back=true){if(!qp)return;qp.remove();qp=null;document.removeEventListener('pointerdown',qOut,true);const ed=back&&refind();if(ed){ed.focus();const s=getSelection();if(lastRange){s.removeAllRanges();s.addRange(lastRange)}}}
function qOut(e){if(qp&&!qp.contains(e.target))qClose(false)}
function qPick(c){qClose(false);put(c)}
function quick(){qClose(false);const s=getSelection();let r=s.rangeCount?s.getRangeAt(0).getBoundingClientRect():null;if(!r||(!r.width&&!r.height&&!r.left)){const e=lastEd&&lastEd.getBoundingClientRect();r=e||{left:innerWidth/2,bottom:innerHeight/2,top:innerHeight/2}}
  qp=document.createElement('div');qp.id='cmq';qp.innerHTML=`<input placeholder="이름으로 찾기 · 화살표, 별, 체크, 1" spellcheck="false"><div class="qg"></div><div class="qf"><span>↵ 넣기 · Esc 닫기 · \\ 한 번 더: \\ 입력</span><button data-all>전체 보기</button></div>`;
  document.body.appendChild(qp);const W=300,H=qp.offsetHeight||220;let x=Math.min(Math.max(8,r.left-12),innerWidth-W-8),y=r.bottom+6;if(y+H>innerHeight-8)y=Math.max(8,r.top-H-6);qp.style.left=x+'px';qp.style.top=y+'px';
  const inp=qp.querySelector('input');qsel=0;qDraw();inp.focus();
  inp.oninput=()=>{qsel=0;qDraw()};
  inp.onkeydown=e=>{if(e.isComposing)return;const cols=8;
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();return qClose()}
    if(e.key==='Enter'){e.preventDefault();if(qlist[qsel])qPick(qlist[qsel]);return}
    if(e.key==='\\'&&!inp.value){e.preventDefault();qClose();document.execCommand('insertText',false,'\\');return}
    if(e.key==='Backspace'&&!inp.value){e.preventDefault();return qClose()}
    const mv={ArrowRight:1,ArrowLeft:-1,ArrowDown:cols,ArrowUp:-cols}[e.key];if(mv!=null&&qlist.length){e.preventDefault();qsel=(qsel+mv+qlist.length)%qlist.length;qDraw();qp.querySelector('.qg .on')?.scrollIntoView({block:'nearest'})}};
  qp.addEventListener('mousedown',e=>{if(!e.target.closest('input'))e.preventDefault()});
  qp.onclick=e=>{const b=e.target.closest('[data-ch]');if(b)return qPick(b.dataset.ch);if(e.target.closest('[data-all]')){qClose();open()}};
  setTimeout(()=>document.addEventListener('pointerdown',qOut,true),0)}
document.addEventListener('keydown',e=>{if(e.code!=='Backslash'&&e.key!=='\\')return;if(e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
  const t=e.target;if(!(t&&t.nodeType===1&&t.isContentEditable))return;const ce=t.closest('[contenteditable]');if(!ce||ce.getAttribute('contenteditable')==='plaintext-only'||ce.closest('.lang,#cmap,#cmq'))return;
  e.preventDefault();lastEd=ce;const s=getSelection();if(s.rangeCount)lastRange=s.getRangeAt(0).cloneRange();remember(ce,lastRange);quick()},true);
document.addEventListener('keydown',e=>{if(e.key==='F10'&&(e.ctrlKey||e.metaKey)){e.preventDefault();open()}},true);
return{open,put,quick}})();
