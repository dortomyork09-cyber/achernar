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
function put(ch){
  const ed=lastEd&&lastEd.isConnected?lastEd:null;
  if(ed&&(ed.tagName==='TEXTAREA'||ed.tagName==='INPUT')){ed.focus();const a=ed.selectionStart??ed.value.length,b=ed.selectionEnd??a;ed.setRangeText(ch,a,b,'end');ed.dispatchEvent(new Event('input',{bubbles:true}))}
  else if(ed){ed.focus();const s=getSelection();if(lastRange&&ed.contains(lastRange.startContainer)){s.removeAllRanges();s.addRange(lastRange)}
    if(!document.execCommand('insertText',false,ch)){const r=s.getRangeAt(0);r.deleteContents();r.insertNode(document.createTextNode(ch));r.collapse(false)}
    if(s.rangeCount)lastRange=s.getRangeAt(0).cloneRange()}
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
function open(){let p=document.querySelector('#cmap');if(p){p.remove();return}
  p=document.createElement('div');p.id='cmap';
  p.innerHTML=`<div class="cmh"><b>문자표</b><span class="cmk">Ctrl+F10</span><input class="cmq" placeholder="문자 검색 (예: →)" maxlength="4"><button class="cmx" aria-label="닫기">✕</button></div><div class="cmt"><button data-t="-1">최근</button>${SETS.map((s,i)=>`<button data-t="${i}">${s[0]}</button>`).join('')}</div><div class="cmg"></div><p class="cmf">누르면 글자를 쓰던 곳에 들어가요 · 쓰던 곳이 없으면 새 글 카드로</p>`;
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
document.addEventListener('keydown',e=>{if(e.key==='F10'&&(e.ctrlKey||e.metaKey)){e.preventDefault();open()}},true);
return{open,put}})();
