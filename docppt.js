/* MINDSPACE — 캔버스 안의 문서 · 슬라이드(PPT) · 서식 도구 */
const DocPPT=(()=>{
const ap=()=>Canvas.api;const SW=960,SH=540;
const COLS=['#202124','#5F6368','#D93025','#E8710A','#F9AB00','#188038','#1A73E8','#2563EB','#A142F4','#E52592'];
const HILS=[['노랑','#FFF3A3'],['주황','#FFD8B5'],['분홍','#FFD0DC'],['초록','#C9F2DC'],['하늘','#CFE6FF'],['보라','#E4DAFF'],['형광펜 지우기','transparent']];
const THEMES=[['흰색','#FFFFFF'],['연보라','#F1EEFF'],['하늘','#EAF4FF'],['민트','#E7F7EF'],['크림','#FFF7E3'],['연회색','#F3F4F7']];
const plain=h=>{const d=document.createElement('div');d.innerHTML=h||'';return d.textContent||''};
const cardOf=el=>el?.closest?.('.card');const itemOf=el=>{const c=cardOf(el);return c?ap().I(c.dataset.id):null};
const isRich=el=>el&&el.isContentEditable&&el.getAttribute('contenteditable')!=='plaintext-only'&&(el.closest('#vp .card .ed')||el.closest('#docf .dfe'));
const host=el=>el?.closest?.('#docf .dfe')||el?.closest?.('.card .ed');
/* =============== 서식 막대 =============== */
let bar=null,hideT=0;
function ensureBar(){if(bar)return bar;bar=document.createElement('div');bar.id='fmtb';bar.hidden=true;
  const b=(f,i,t,txt)=>`<button data-f="${f}" title="${t}" aria-label="${t}">${i?ic(i):''}${txt?`<span>${txt}</span>`:''}</button>`;
  bar.innerHTML=`<span class="fgrip" title="끌어서 옮기기 · 더블클릭: 자동 위치">⋮⋮</span>${b('blk','','문단 모양','본문 ▾')}<i></i>${b('b','','굵게 (Ctrl+B)','<b>B</b>')}${b('i','','기울임 (Ctrl+I)','<i>I</i>')}${b('u','','밑줄 (Ctrl+U)','<u>U</u>')}${b('s','','취소선','<s>S</s>')}${b('col','','글자색','<span class="fca">A</span>')}${b('hil','hl','형광펜')}<i></i>
   ${b('ul','list','글머리 목록')}${b('ol','','번호 목록','1.')}${b('chk','todo','체크리스트')}${b('quote','','인용','❝')}${b('hr','dash','구분선')}${b('link','link','링크')}<i></i>
   ${b('al','','정렬','≡')}${b('dn','','글자 작게','A−')}${b('up','','글자 크게','A+')}${b('clr','','서식 지우기','Tx')}<span class="fdoc"><i></i>${b('tbl','table','표 넣기')}${b('toc','list','목차 만들기','목차')}${b('focus','fit','문서 집중 모드','집중')}${b('exp','dl','PDF·Word·마크다운','내보내기')}<em class="fwc"></em></span><button data-f="pin" class="fpin" title="이 자리에 고정 / 자동 위치">${ic('lock')}</button><button data-f="close" title="막대 닫기 (다시 누르면 나와요)">${ic('x')}</button>`;
  document.body.appendChild(bar);bar.addEventListener('mousedown',e=>e.preventDefault());bar.addEventListener('pointerdown',e=>e.stopPropagation());
  bar.onclick=e=>{const btn=e.target.closest('[data-f]');if(!btn)return;if(btn.dataset.f==='close'){bar.hidden=true;userHid=true;return}if(btn.dataset.f==='pin'){if(pinPos){pinPos=null;savePin();toast('막대가 다시 글 위를 따라다녀요',{ms:1400})}else{const r=bar.getBoundingClientRect();pinPos={x:r.left,y:r.top};savePin();toast('막대를 이 자리에 고정했어요 · ⋮⋮ 를 끌어서 옮길 수 있어요',{ms:1800})}bar.classList.toggle('pinned',!!pinPos);return}act(btn.dataset.f,btn)};
  const g=bar.querySelector('.fgrip');g.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();g.setPointerCapture(e.pointerId);const r=bar.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top;const mv=ev=>{pinPos={x:Math.max(0,Math.min(innerWidth-bar.offsetWidth,ev.clientX-ox)),y:Math.max(0,Math.min(innerHeight-bar.offsetHeight,ev.clientY-oy))};bar.style.left=pinPos.x+'px';bar.style.top=pinPos.y+'px';bar.classList.add('pinned')};const upf=()=>{g.removeEventListener('pointermove',mv);g.removeEventListener('pointerup',upf);savePin()};g.addEventListener('pointermove',mv);g.addEventListener('pointerup',upf)});
  g.addEventListener('dblclick',()=>{pinPos=null;savePin();bar.classList.remove('pinned');place()});bar.classList.toggle('pinned',!!pinPos);return bar}
let pinPos=(()=>{try{return JSON.parse(localStorage.getItem('ms-fmt-pin')||'null')}catch(e){return null}})(),userHid=false;
function savePin(){try{localStorage.setItem('ms-fmt-pin',JSON.stringify(pinPos))}catch(e){}}
function act(f,btn){const ed=host(document.activeElement);if(!ed)return;const X=(c,v=null)=>{document.execCommand(c,false,v);ed.dispatchEvent(new Event('input',{bubbles:true}))};const r=btn.getBoundingClientRect();
  switch(f){case 'b':return X('bold');case 'i':return X('italic');case 'u':return X('underline');case 's':return X('strikeThrough');case 'ul':return X('insertUnorderedList');case 'ol':return X('insertOrderedList');case 'hr':return X('insertHorizontalRule');case 'clr':X('removeFormat');return X('formatBlock','<p>');
    case 'quote':return X('formatBlock','<blockquote>');
    case 'blk':return menu(r.left,r.bottom+6,[['본문','<p>'],['제목 1','<h1>'],['제목 2','<h2>'],['제목 3','<h3>'],['인용','<blockquote>'],['코드','<pre>']].map(([t,v])=>({t,fn:()=>{ed.focus();X('formatBlock',v)}})));
    case 'col':return menu(r.left,r.bottom+6,COLS.map((c,k)=>({t:['검정','회색','빨강','주황','노랑','초록','파랑','보라','진보라','분홍'][k],i:'color',fn:()=>{ed.focus();X('foreColor',c)}})));
    case 'hil':return menu(r.left,r.bottom+6,HILS.map(([t,c])=>({t,i:'hl',fn:()=>{ed.focus();X('hiliteColor',c)}})));
    case 'chk':{const li=getSelection().anchorNode?.parentElement?.closest('li');const ul=li?.closest('ul');if(ul&&ed.contains(ul)){ul.classList.toggle('dchk');return ed.dispatchEvent(new Event('input',{bubbles:true}))}return X('insertHTML','<ul class="dchk"><li><br></li></ul>')}
    case 'link':{const sel=getSelection();const rg=sel.rangeCount?sel.getRangeAt(0).cloneRange():null;return ask('링크 넣기',{ph:'https://',sub:'고른 글자에 링크가 걸려요'}).then(u=>{if(!u)return;ed.focus();if(rg){sel.removeAllRanges();sel.addRange(rg)}u=/^[a-z]+:/i.test(u)?u:'https://'+u;if(rg&&!rg.collapsed)X('createLink',u);else X('insertHTML',`<a href="${esc(u)}">${esc(u)}</a>`)})}
    case 'al':return menu(r.left,r.bottom+6,[['왼쪽 정렬','justifyLeft'],['가운데 정렬','justifyCenter'],['오른쪽 정렬','justifyRight'],['양쪽 정렬','justifyFull']].map(([t,c])=>({t,fn:()=>{ed.focus();X(c)}})));
    case 'up':case 'dn':return size(ed,f==='up'?1:-1);
    case 'tbl':return X('insertHTML','<table class="dtb"><tr><th><br></th><th><br></th><th><br></th></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></table><p><br></p>');
    case 'toc':return toc(ed);
    case 'focus':{const it=itemOf(ed);if(it)focusDoc(it);return}
    case 'exp':{const it=itemOf(ed)||curFocus?.it;if(!it)return;return menu(r.left,r.bottom+6,[{t:'PDF로 저장 (인쇄)',i:'page',fn:()=>docPDF(it)},{t:'Word 파일 (.doc)',i:'file',fn:()=>docWord(it)},{t:'마크다운 (.md)',i:'text',fn:()=>docMD(it)},{t:'글만 복사',i:'copy',fn:()=>navigator.clipboard?.writeText(toMD(it.text)).then(()=>toast('복사했어요'))}])}}}
function size(ed,d){const cd=cardOf(ed);if(cd){const it=ap().I(cd.dataset.id);const base=it.fs||parseFloat(getComputedStyle(ed).fontSize)||16;it.fs=Math.max(8,Math.min(160,Math.round(base+(base>=40?6:base>=24?3:2)*d)));cd.classList.add('cfs');cd.style.setProperty('--cfs',it.fs+'px');ap().save();toast(`글자 크기 ${it.fs}`,{ms:900});return}
  const sz=parseFloat(getComputedStyle(ed).fontSize)||17;ed.style.fontSize=Math.max(12,Math.min(30,sz+d))+'px'}
function place(){const a=document.activeElement;if(!bar||bar.hidden)return;if(!isRich(a)||!$('#modal').hidden||document.body.classList.contains('presenting')){bar.hidden=true;return}const cd=cardOf(a);const it=itemOf(a);const isDoc=!!a.closest('#docf')||it?.type==='doc'||it?.type==='text';bar.classList.toggle('isdoc',isDoc);
  if(pinPos){bar.style.left=Math.min(pinPos.x,innerWidth-bar.offsetWidth-4)+'px';bar.style.top=Math.min(pinPos.y,innerHeight-bar.offsetHeight-4)+'px'}else{const r=(a.closest('#docf')?a:cd||a).getBoundingClientRect();const bw=bar.offsetWidth,bh=bar.offsetHeight;let x=Math.max(8,Math.min(innerWidth-bw-8,r.left+r.width/2-bw/2));let y=r.top-bh-10;if(a.closest('#docf'))y=64;if(y<62)y=Math.min(innerHeight-bh-8,Math.max(62,r.bottom+10));if(r.top-bh-10<62&&r.bottom+bh+20>innerHeight)y=62;bar.style.left=x+'px';bar.style.top=y+'px'}
  const blk=getSelection().anchorNode?.parentElement?.closest('h1,h2,h3,blockquote,pre,p,li');const nm={H1:'제목 1',H2:'제목 2',H3:'제목 3',BLOCKQUOTE:'인용',PRE:'코드',LI:'목록'}[blk?.tagName]||'본문';bar.querySelector('[data-f=blk] span').textContent=nm+' ▾';
  if(isDoc){const t=a.innerText||'';bar.querySelector('.fwc').textContent=`${t.replace(/\s/g,'').length.toLocaleString()}자`}}
document.addEventListener('focusin',e=>{if(!isRich(e.target)||!$('#modal').hidden)return;clearTimeout(hideT);userHid=false;ensureBar().hidden=false;requestAnimationFrame(place)});
document.addEventListener('focusout',()=>{hideT=setTimeout(()=>{if(bar&&!isRich(document.activeElement))bar.hidden=true},120)});
document.addEventListener('selectionchange',()=>{if(bar&&!bar.hidden)place()});addEventListener('resize',()=>bar&&!bar.hidden&&place());
setInterval(()=>{if(bar&&!bar.hidden)place()},400);
document.addEventListener('pointerdown',e=>{if(!bar)return;if(e.target.closest('#fmtb,#menu,.menu,#modal'))return;const a=document.activeElement;const inEd=isRich(a)&&(host(a)?.contains(e.target));if(inEd){if(bar.hidden&&!userHid){bar.hidden=false;place()}else if(bar.hidden&&userHid){userHid=false;bar.hidden=false;place()}return}bar.hidden=true},true);
/* 마크다운처럼 바로 쓰기: # ## ### - 1. [] > --- */
function caretIn(el,end){const r=document.createRange();r.selectNodeContents(el);r.collapse(!end);const s=getSelection();s.removeAllRanges();s.addRange(r)}
document.addEventListener('keydown',e=>{const a=document.activeElement;if(!isRich(a)||e.isComposing||e.key!==' ')return;const h=host(a);const sel=getSelection();if(!sel.rangeCount||!sel.isCollapsed)return;const rg=sel.getRangeAt(0);
  const blk=(rg.startContainer.nodeType===3?rg.startContainer.parentElement:rg.startContainer).closest('p,div,h1,h2,h3,blockquote');if(!blk||blk===h||!h.contains(blk)||blk.closest('li,table,.dtoc'))return;
  const pre=document.createRange();pre.setStart(blk,0);pre.setEnd(rg.startContainer,rg.startOffset);const t=pre.toString();
  const map={'#':'h1','##':'h2','###':'h3','>':'blockquote','-':'ul','*':'ul','1.':'ol','[]':'chk','[ ]':'chk','---':'hr'};const k=map[t];if(!k)return;e.preventDefault();pre.deleteContents();
  const rest=document.createRange();rest.selectNodeContents(blk);const frag=rest.extractContents();let el,tg;
  if(k==='hr'){el=document.createElement('hr');const p=document.createElement('p');p.appendChild(frag);if(!p.textContent)p.innerHTML='<br>';blk.replaceWith(el);el.after(p);caretIn(p)}
  else{if(k==='ul'||k==='ol'||k==='chk'){el=document.createElement(k==='ol'?'ol':'ul');if(k==='chk')el.className='dchk';tg=document.createElement('li');el.appendChild(tg)}else{el=tg=document.createElement(k)}tg.appendChild(frag);if(!tg.textContent)tg.innerHTML='<br>';blk.replaceWith(el);caretIn(tg)}
  h.dispatchEvent(new Event('input',{bubbles:true}))},true);
document.addEventListener('focusin',e=>{if(isRich(e.target))try{document.execCommand('defaultParagraphSeparator',false,'p')}catch(x){}});
/* 체크리스트 누르기 */
document.addEventListener('pointerdown',e=>{const li=e.target.closest?.('ul.dchk>li');if(!li)return;const r=li.getBoundingClientRect();if(e.clientX-r.left>26)return;e.preventDefault();e.stopPropagation();li.classList.toggle('done');host(li)?.dispatchEvent(new Event('input',{bubbles:true}));const it=itemOf(li);if(it&&!li.closest('#docf')){it.text=host(li).innerHTML;ap().save()}},true);
function toc(ed){ed.querySelector('.dtoc')?.remove();const hs=[...ed.querySelectorAll('h1,h2,h3')];if(!hs.length)return toast('제목(# 제목)이 있어야 목차를 만들 수 있어요');
  const html=`<div class="dtoc" contenteditable="false"><b>목차</b>${hs.map(h=>`<div class="l${h.tagName[1]}">${esc(h.textContent)}</div>`).join('')}</div>`;const first=ed.querySelector('h1');if(first&&first===ed.firstElementChild)first.insertAdjacentHTML('afterend',html);else ed.insertAdjacentHTML('afterbegin',html);ed.dispatchEvent(new Event('input',{bubbles:true}));toast('목차를 넣었어요')}
/* =============== 문서 집중 모드 =============== */
let curFocus=null;
function focusDoc(it){if(curFocus)return;document.activeElement?.blur?.();const el=document.createElement('div');el.id='docf';
  el.innerHTML=`<div class="dfbar"><button class="w3b" data-d="x">${ic('back')}캔버스로</button><span class="dft"></span><span class="sp"></span><button class="w3b" data-d="pdf">${ic('page')}인쇄·PDF</button><button class="w3b" data-d="word">${ic('file')}Word</button><button class="w3b" data-d="md">${ic('text')}MD</button></div><div class="dfsc"><div class="dpage"><div class="dfe ed" contenteditable data-ph="# 제목 · - 목록 · [] 체크 · > 인용">${it.text||''}</div></div></div>`;
  document.body.appendChild(el);document.body.classList.add('docfopen');curFocus={el,it};const ed=el.querySelector('.dfe');const t=el.querySelector('.dft');const upd=()=>{const s=ed.innerText||'';t.textContent=`${s.replace(/\s/g,'').length.toLocaleString()}자 · 단어 ${(s.trim().match(/\S+/g)||[]).length.toLocaleString()}개 · 약 ${Math.max(1,Math.round(s.length/500))}분 읽기`};upd();
  let sv=0;ed.addEventListener('input',()=>{it.text=ed.innerHTML;upd();clearTimeout(sv);sv=setTimeout(()=>ap().save(),400)});
  el.querySelector('.dfbar').onclick=e=>{const d=e.target.closest('[data-d]')?.dataset.d;if(d==='x')closeDoc();if(d==='pdf')docPDF(it);if(d==='word')docWord(it);if(d==='md')docMD(it)};
  curFocus.k=e=>{if(e.key==='Escape'&&$('#modal').hidden){e.preventDefault();e.stopPropagation();closeDoc()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='p'){e.preventDefault();e.stopPropagation();docPDF(it)}};addEventListener('keydown',curFocus.k,true);setTimeout(()=>{ed.focus()},60)}
function closeDoc(){if(!curFocus)return;curFocus.it.text=curFocus.el.querySelector('.dfe').innerHTML;removeEventListener('keydown',curFocus.k,true);curFocus.el.remove();document.body.classList.remove('docfopen');curFocus=null;ap().render();ap().save();if(bar)bar.hidden=true}
/* =============== 문서 내보내기 =============== */
const DOCCSS=`body{font:16px/1.75 "Pretendard","Noto Sans KR","Apple SD Gothic Neo",sans-serif;color:#202124;max-width:720px;margin:40px auto;padding:0 24px}h1{font-size:30px;line-height:1.3;margin:.6em 0 .4em}h2{font-size:23px;margin:1.2em 0 .4em}h3{font-size:19px;margin:1em 0 .3em}blockquote{border-left:4px solid #C9CBF5;margin:1em 0;padding:.2em 1em;color:#4a4f5a}pre{background:#F4F5F8;padding:12px 14px;border-radius:8px;white-space:pre-wrap}table{border-collapse:collapse;width:100%;margin:1em 0}td,th{border:1px solid #D9DBE3;padding:6px 10px}th{background:#F4F5F8}ul.dchk{list-style:none;padding-left:4px}ul.dchk li::before{content:"☐ "}ul.dchk li.done::before{content:"☑ "}ul.dchk li.done{color:#999;text-decoration:line-through}.dtoc{background:#F6F6FB;border-radius:10px;padding:12px 16px;margin:1em 0}.dtoc .l2{padding-left:14px}.dtoc .l3{padding-left:28px}hr{border:0;border-top:1px solid #DDD;margin:1.5em 0}@page{margin:18mm}`;
const titleOf=it=>(plain((it.text||'').match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1]||'')||plain(it.text).split('\n')[0]||'문서').trim().slice(0,40)||'문서';
function printHTML(body,css,title){const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0';document.body.appendChild(f);const d=f.contentDocument;d.open();d.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>${body}</body></html>`);d.close();
  setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print();toast('인쇄 창에서 ‘PDF로 저장’을 고르세요',{ms:3000})}catch(e){toast('이 화면에서는 인쇄 창을 열 수 없어요 · Word로 내보낸 뒤 PDF로 저장해 보세요')}setTimeout(()=>f.remove(),60000)},500)}
function docPDF(it){printHTML(it.text||'',DOCCSS,titleOf(it))}
function docWord(it){const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(titleOf(it))}</title><style>${DOCCSS}</style></head><body>${it.text||''}</body></html>`;saveFile(titleOf(it)+'.doc',new Blob(['﻿',html],{type:'application/msword'}))}
function toMD(h){const d=document.createElement('div');d.innerHTML=h||'';const w=(n,ind='')=>[...n.childNodes].map(c=>{if(c.nodeType===3)return c.textContent;if(c.nodeType!==1)return'';const t=c.tagName,inn=()=>w(c,ind);
  if(/^H[1-3]$/.test(t))return '\n'+'#'.repeat(+t[1])+' '+inn().trim()+'\n';if(t==='P'||t==='DIV')return c.classList.contains('dtoc')?'':'\n'+inn().trim()+'\n';if(t==='BR')return '\n';if(t==='B'||t==='STRONG')return '**'+inn()+'**';if(t==='I'||t==='EM')return '*'+inn()+'*';if(t==='S'||t==='STRIKE')return '~~'+inn()+'~~';if(t==='A')return `[${inn()}](${c.getAttribute('href')})`;if(t==='BLOCKQUOTE')return '\n> '+inn().trim()+'\n';if(t==='PRE')return '\n```\n'+c.textContent+'\n```\n';if(t==='HR')return '\n---\n';
  if(t==='UL'||t==='OL'){const chk=c.classList.contains('dchk');return '\n'+[...c.children].map((li,i)=>ind+(chk?(li.classList.contains('done')?'- [x] ':'- [ ] '):t==='OL'?`${i+1}. `:'- ')+w(li,ind+'  ').trim()).join('\n')+'\n'}
  if(t==='TABLE'){const rows=[...c.querySelectorAll('tr')].map(r=>'| '+[...r.children].map(x=>x.textContent.trim()).join(' | ')+' |');if(rows.length)rows.splice(1,0,'|'+' --- |'.repeat(c.querySelector('tr').children.length));return '\n'+rows.join('\n')+'\n'}return inn()}).join('');return w(d).replace(/\n{3,}/g,'\n\n').trim()+'\n'}
function docMD(it){saveFile(titleOf(it)+'.md',new Blob([toMD(it.text)],{type:'text/markdown'}))}
/* =============== 슬라이드 (PPT) =============== */
const slides=()=>(ap().C()?.items||[]).filter(i=>i.slide&&i.type==='frame').sort((a,b)=>(a.sn||0)-(b.sn||0));
function renumber(){slides().forEach((f,i)=>f.sn=i+1)}
function inside(f){const fb={x:f.x,y:f.y,w:f.w,h:f.h};return ap().C().items.filter(o=>{if(o===f)return false;const b=ap().box(o.id)||{x:o.x,y:o.y,w:o.w||100,h:o.h||60};const cx=b.x+b.w/2,cy=b.y+b.h/2;return cx>fb.x&&cx<fb.x+fb.w&&cy>fb.y&&cy<fb.y+fb.h})}
const sTitle=f=>{const t=inside(f).filter(o=>o.type==='text').sort((a,b)=>a.y-b.y)[0];return plain(t?.text||f.text||'').trim().slice(0,30)||'빈 슬라이드'};
const LAYOUTS=[['title','제목 슬라이드','board'],['content','제목 + 내용','list'],['two','두 칸','layout'],['image','사진 + 글','image'],['quote','큰 문장','text'],['blank','빈 슬라이드','frame']];
async function newSlide(kind='content',after){const a=ap();One.home();await new Promise(r=>setTimeout(r,60));const ss=slides();const ref=after||ss.at(-1);let x,y;if(ref){x=ref.x+ref.w+80;y=ref.y;ss.filter(f=>f.sn>ref.sn).forEach(f=>{const mv=inside(f);f.x+=SW+80;mv.forEach(o=>o.x+=SW+80)})}else{const its=a.C().items;if(its.length){const bs=its.map(i=>a.box(i.id)||{x:i.x,y:i.y,w:i.w||100,h:i.h||60});x=Math.round(Math.max(...bs.map(b=>b.x+b.w))+160);y=Math.round(Math.min(...bs.map(b=>b.y)))}else{const[cx,cy]=a.center();x=Math.round(cx-SW/2);y=Math.round(cy-SH/2)}}
  a.push();const bg=ss[0]?.bg||'#FFFFFF';const f=a.mk('frame',x,y,{w:SW,h:SH,text:'',slide:1,c:'w',bg,sn:ref?ref.sn+.5:0});const T=(tx,ty,w,html,fs,al,h)=>a.mk('text',x+tx,y+ty,{w,text:html,fs,...(al?{al}:{}),...(h?{h}:{h:0}),plain:1});
  if(kind==='title'){T(80,170,800,'<b>발표 제목</b>',58,'center');T(160,320,640,'부제목 · 이름 · 날짜',24,'center')}
  if(kind==='content'){T(60,44,840,'<b>슬라이드 제목</b>',40);T(60,140,840,'<ul><li>첫 번째 내용</li><li>두 번째 내용</li><li>세 번째 내용</li></ul>',26,'',340)}
  if(kind==='two'){T(60,44,840,'<b>비교하기</b>',40);T(60,140,400,'<b>왼쪽</b><ul><li>내용</li><li>내용</li></ul>',24,'',340);T(500,140,400,'<b>오른쪽</b><ul><li>내용</li><li>내용</li></ul>',24,'',340)}
  if(kind==='image'){T(60,44,840,'<b>사진 설명</b>',40);T(60,150,380,'사진에 대한 설명을 적어 보세요',24,'',300)}
  if(kind==='quote'){T(100,180,760,'<b>“기억에 남을 한 문장”</b>',48,'center');T(260,360,440,'— 말한 사람',22,'center')}
  renumber();a.render();a.save();openPanel();setTimeout(()=>show(f),80);
  if(kind==='image'){const fs=await pickFile('image/*');if(fs?.length){const before=new Set(a.C().items.map(i=>i.id));await a.files([fs[0]],x+480,y+150);const im=a.C().items.find(i=>!before.has(i.id)&&i.type==='image');if(im){im.x=x+480;im.y=y+140;im.w=420;a.render();a.save()}}}
  return f}
function show(f){const a=ap();a.setSel([]);const r=a.vpEl().getBoundingClientRect();const zz=Math.min((r.width-140)/f.w,(r.height-180)/f.h);a.goto(f.x+f.w/2,f.y+f.h/2,zz)}
function dupSlide(f){const a=ap();a.push();const mv=inside(f);const dx=0;slides().filter(s=>s.sn>f.sn).forEach(s=>{const m=inside(s);s.x+=SW+80;m.forEach(o=>o.x+=SW+80)});
  const map={};const nf={...JSON.parse(JSON.stringify(f)),id:uid(),x:f.x+f.w+80,sn:f.sn+.5};a.C().items.push(nf);mv.forEach(o=>{const n={...JSON.parse(JSON.stringify(o)),id:uid(),x:o.x+f.w+80};map[o.id]=n.id;a.C().items.push(n)});a.C().links.filter(l=>map[l.a]&&map[l.b]).forEach(l=>a.C().links.push({...l,id:uid(),a:map[l.a],b:map[l.b]}));renumber();a.render();a.save();panel();toast('슬라이드를 복제했어요')}
async function delSlide(f){if(!await confirmDlg('이 슬라이드를 지울까요?','슬라이드 안의 카드도 함께 지워져요. Ctrl+Z로 되돌릴 수 있어요.','지우기',1))return;const a=ap();a.push();const ids=new Set([f.id,...inside(f).map(o=>o.id)]);const C=a.C();C.items=C.items.filter(i=>!ids.has(i.id));C.links=C.links.filter(l=>!ids.has(l.a)&&!ids.has(l.b));renumber();a.render();a.save();panel()}
function reorder(id,beforeId){const ss=slides();const m=ss.find(s=>s.id===id);if(!m)return;const rest=ss.filter(s=>s!==m);const k=beforeId?rest.findIndex(s=>s.id===beforeId):rest.length;rest.splice(k<0?rest.length:k,0,m);ap().push();rest.forEach((s,i)=>s.sn=i+1);ap().render();ap().save();panel()}
function lineUp(){const ss=slides();if(!ss.length)return;const a=ap();a.push();const x0=ss[0].x,y0=ss[0].y;ss.forEach((f,i)=>{const mv=inside(f);const nx=x0+i*(SW+80),dx=nx-f.x,dy=y0-f.y;f.x=nx;f.y=y0;mv.forEach(o=>{o.x+=dx;o.y+=dy})});a.render();a.save();a.fit();toast('슬라이드를 순서대로 한 줄로 놓았어요')}
function theme(bg){const a=ap();a.push();slides().forEach(f=>f.bg=bg);a.render();a.save();panel()}
async function slideNote(f){const v=await ask('발표자 메모',{val:f.pnote||'',multi:true,ph:'발표할 때 나만 보는 메모 (N 키로 보기)',ok:'저장'});if(v==null)return;f.pnote=v;ap().save();panel()}
/* 슬라이드 패널 */
let pnl=null,thT=0;const thumbs={};
function openPanel(){if(!pnl){pnl=document.createElement('div');pnl.id='slidep';document.body.appendChild(pnl);document.body.classList.add('slidepopen')}panel()}
function closePanel(){pnl?.remove();pnl=null;document.body.classList.remove('slidepopen')}
function panel(){if(!pnl)return;const ss=slides();
  pnl.innerHTML=`<div class="sph"><b>슬라이드 ${ss.length}장</b><button class="ib sm" data-p="x" aria-label="닫기">${ic('x')}</button></div>
   <div class="spl">${ss.map(f=>`<div class="spi" draggable="true" data-sid="${f.id}"><span class="spn">${f.sn}</span><div class="spt" style="background:${f.bg||'#fff'}">${thumbs[f.id]?`<img src="${thumbs[f.id]}" alt="">`:`<em>${esc(sTitle(f))}</em>`}</div><div class="spb"><button data-p="note" title="발표자 메모">${ic('text')}</button><button data-p="dup" title="복제">${ic('copy')}</button><button data-p="del" title="삭제">${ic('trash')}</button></div>${f.pnote?'<i class="spm" title="메모 있음"></i>':''}</div>`).join('')||'<div class="spe">아직 슬라이드가 없어요</div>'}</div>
   <div class="spf"><button class="btn pr" data-p="new">${ic('plus')}새 슬라이드</button><div class="spr"><button class="btn sm ghost" data-p="play">${ic('play')}발표</button><button class="btn sm ghost" data-p="theme">${ic('color')}배경</button><button class="btn sm ghost" data-p="more">${ic('more')}</button></div></div>`;
  pnl.onclick=e=>{const b=e.target.closest('[data-p]');const it=e.target.closest('[data-sid]');const f=it&&slides().find(s=>s.id===it.dataset.sid);
    if(b){const p=b.dataset.p,r=b.getBoundingClientRect();if(p==='x')return closePanel();if(p==='new')return menu(r.left,r.top-8-LAYOUTS.length*40,LAYOUTS.map(([k,t,i])=>({t,i,fn:()=>newSlide(k)})));if(p==='play')return present();if(p==='theme')return menu(r.left,r.top-260,THEMES.map(([t,c])=>({t,i:'color',fn:()=>theme(c)})));
      if(p==='more')return menu(r.left,r.top-180,[{t:'인쇄 · PDF (옵션 고르기)',i:'page',fn:()=>Print.open('slides')},{t:'PDF로 바로 저장',i:'page',fn:slidesPDF},{t:'지금 슬라이드 그림(PNG)',i:'image',fn:()=>slidePNG(slides()[0])},{t:'순서대로 한 줄 정렬',i:'layout',fn:lineUp},{t:'미리보기 새로 고침',i:'restore',fn:()=>makeThumbs(true)}]);
      if(f&&p==='dup')return dupSlide(f);if(f&&p==='del')return delSlide(f);if(f&&p==='note')return slideNote(f)}
    if(f){pnl.querySelectorAll('.spi').forEach(x=>x.classList.toggle('on',x===it));show(f)}};
  pnl.querySelectorAll('.spi').forEach(el=>{el.ondragstart=e=>{e.dataTransfer.setData('text/x-slide',el.dataset.sid);el.classList.add('drag')};el.ondragend=()=>el.classList.remove('drag');el.ondragover=e=>{e.preventDefault();el.classList.add('over')};el.ondragleave=()=>el.classList.remove('over');el.ondrop=e=>{e.preventDefault();el.classList.remove('over');const id=e.dataTransfer.getData('text/x-slide');if(id&&id!==el.dataset.sid)reorder(id,el.dataset.sid)}});
  clearTimeout(thT);thT=setTimeout(()=>makeThumbs(),900)}
async function makeThumbs(force){if(!pnl)return;const ss=slides();let ch=false;for(const f of ss){const key=f.id;if(thumbs[key]&&!force&&thumbs[key+':v']===JSON.stringify([f.x,f.y,f.bg,inside(f).map(o=>[o.x,o.y,o.w,o.text,o.fs])]))continue;try{const b=await ap().png({x:f.x,y:f.y,w:f.w,h:f.h},.25);thumbs[key]=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)});thumbs[key+':v']=JSON.stringify([f.x,f.y,f.bg,inside(f).map(o=>[o.x,o.y,o.w,o.text,o.fs])]);ch=true}catch(e){}}
  if(ch&&pnl){pnl.querySelectorAll('.spi').forEach(el=>{const u=thumbs[el.dataset.sid];if(u)el.querySelector('.spt').innerHTML=`<img src="${u}" alt="">`})}}
setInterval(()=>{if(pnl&&!document.hidden&&!pres)makeThumbs()},6000);
async function slidePNG(f){if(!f)return;const b=await ap().png({x:f.x,y:f.y,w:f.w,h:f.h},2);saveFile(`슬라이드 ${f.sn}.png`,b)}
async function slidesPDF(){const ss=slides();if(!ss.length)return toast('슬라이드가 없어요');toast('PDF를 준비하는 중…',{ms:1500});const imgs=[];for(const f of ss){const b=await ap().png({x:f.x,y:f.y,w:f.w,h:f.h},2);imgs.push(await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(b)}))}
  printHTML(imgs.map(u=>`<div class="pg"><img src="${u}"></div>`).join(''),`@page{size:297mm 167mm;margin:0}html,body{margin:0}.pg{width:297mm;height:167mm;page-break-after:always;display:flex;align-items:center;justify-content:center;overflow:hidden}.pg img{width:100%;height:100%;object-fit:contain}`,(One.main().title||'발표')+' 슬라이드')}
/* =============== 발표 모드 =============== */
let pres=null;
function present(start){One.home();setTimeout(()=>{let list=slides();if(!list.length)list=ap().C().items.filter(i=>i.type==='frame').sort((p,q)=>(Math.round(p.y/200)-Math.round(q.y/200))||(p.x-q.x));if(!list.length)return toast('슬라이드를 먼저 만들어 보세요 · ⋯ 메뉴 → 슬라이드 만들기');
  document.body.classList.add('presenting','pres2');try{document.documentElement.requestFullscreen?.().catch(()=>{})}catch(e){}
  const el=document.createElement('div');el.id='pres2';el.innerHTML=`<div class="prprog"><i></i></div><div class="prcatch"></div><div class="prlaser" hidden></div><div class="prblank" hidden></div><div class="prnote" hidden></div>
   <div class="prbar"><button data-v="-1" aria-label="이전">${ic('back')}</button><span class="prn"></span><button data-v="1" aria-label="다음" class="nx">${ic('back')}</button><i></i><span class="prt">0:00</span><button data-v="laser" title="레이저 포인터 (L)">●</button><button data-v="note" title="발표자 메모 (N)">${ic('text')}</button><button data-v="x" title="끝내기 (Esc)">끝내기</button></div>`;
  document.body.appendChild(el);pres={list,i:Math.max(0,list.findIndex(f=>f.id===start)),el,t0:Date.now(),laser:false,num:''};
  pres.tm=setInterval(()=>{const s=Math.floor((Date.now()-pres.t0)/1000);el.querySelector('.prt').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`},1000);
  el.querySelector('.prbar').onclick=e=>{const v=e.target.closest('[data-v]')?.dataset.v;if(!v)return;if(v==='x')return end();if(v==='laser')return laser();if(v==='note')return note();go(pres.i+ +v)};
  const ca=el.querySelector('.prcatch');ca.onclick=()=>go(pres.i+1);ca.oncontextmenu=e=>{e.preventDefault();go(pres.i-1)};ca.onpointermove=e=>{if(!pres.laser)return;const l=el.querySelector('.prlaser');l.style.left=e.clientX+'px';l.style.top=e.clientY+'px'};
  ca.onwheel=e=>{e.preventDefault();if(Math.abs(e.deltaY)>30){clearTimeout(pres.wt);pres.wt=setTimeout(()=>go(pres.i+(e.deltaY>0?1:-1)),60)}};
  pres.k=e=>{if(!pres)return;const k=e.key;if(!$('#modal').hidden)return;e.stopPropagation();
    if(['ArrowRight','ArrowDown','PageDown',' '].includes(k)||(k==='Enter'&&!pres.num)){e.preventDefault();go(pres.i+1)}else if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(k)){e.preventDefault();go(pres.i-1)}
    else if(k==='Home')go(0);else if(k==='End')go(pres.list.length-1);else if(k==='Escape'){e.preventDefault();end()}else if(/^[0-9]$/.test(k)){pres.num+=k}else if(k==='Enter'&&pres.num){go(+pres.num-1);pres.num=''}
    else if(k.toLowerCase()==='b'||k==='.'){blank('#000')}else if(k.toLowerCase()==='w'||k===','){blank('#fff')}else if(k.toLowerCase()==='l')laser();else if(k.toLowerCase()==='n')note()};
  addEventListener('keydown',pres.k,true);pres.fs=()=>{if(!document.fullscreenElement&&pres)setTimeout(()=>pres&&ap().vpEl()&&go(pres.i),120)};document.addEventListener('fullscreenchange',pres.fs);setTimeout(()=>go(pres.i),250)},120)}
function go(i){if(!pres)return;i=Math.max(0,Math.min(pres.list.length-1,i));pres.i=i;const f=pres.list[i];const a=ap();a.setSel([]);document.activeElement?.blur?.();const vp=a.vpEl();const zz=Math.min(vp.clientWidth/f.w,vp.clientHeight/f.h)*.985;a.goto(f.x+f.w/2,f.y+f.h/2,zz);
  pres.el.querySelector('.prn').textContent=`${i+1} / ${pres.list.length}`;pres.el.querySelector('.prprog i').style.width=`${(i+1)/pres.list.length*100}%`;const n=pres.el.querySelector('.prnote');n.innerHTML=f.pnote?`<b>메모</b>${esc(f.pnote).replace(/\n/g,'<br>')}`:'<small>이 슬라이드에는 메모가 없어요 · 슬라이드 패널에서 메모를 달 수 있어요</small>'}
function blank(c){const b=pres.el.querySelector('.prblank');if(!b.hidden&&b.style.background===c||!b.hidden){b.hidden=true;return}b.style.background=c;b.hidden=false}
function laser(){pres.laser=!pres.laser;pres.el.querySelector('.prlaser').hidden=!pres.laser;pres.el.classList.toggle('lz',pres.laser)}
function note(){const n=pres.el.querySelector('.prnote');n.hidden=!n.hidden}
function end(){if(!pres)return;clearInterval(pres.tm);removeEventListener('keydown',pres.k,true);document.removeEventListener('fullscreenchange',pres.fs);pres.el.remove();pres=null;document.body.classList.remove('presenting','pres2');try{document.fullscreenElement&&document.exitFullscreen()}catch(e){}setTimeout(()=>ap().fit(),150)}
/* =============== 메뉴 연결 =============== */
function addMenu(pt){return[{t:'문서 (글쓰기)',i:'page',fn:()=>newDoc(pt)},{t:'슬라이드 만들기',i:'board',sub:LAYOUTS.map(([k,t,i])=>({t,i,fn:()=>newSlide(k)}))}]}
function newDoc(pt){const a=ap();One.home();setTimeout(()=>{const[x,y]=pt||a.center();a.push();const n=a.mk('doc',x-340,y-200);a.render();a.save();a.editNew?.(n);setTimeout(()=>{const e=document.querySelector(`.card[data-id="${n.id}"] .ed`);if(e){e.focus();const h=e.querySelector('h1');if(h){const r=document.createRange();r.selectNodeContents(h);const s=getSelection();s.removeAllRanges();s.addRange(r)}}},120)},80)}
function moreMenu(){const n=slides().length;return[{t:'문서 새로 쓰기',i:'page',fn:()=>newDoc()},{t:n?`슬라이드 패널 (${n}장)`:'슬라이드 만들기 (PPT)',i:'board',fn:()=>n?openPanel():newSlide('title')},...(n?[{t:'발표 시작',i:'play',k:'F5',fn:()=>present()}]:[])]}
function cardMenu(its){const it=its[0],n=its.length;const out=[];
  if(n===1&&it.type==='doc')out.push({t:'문서 집중 모드로 쓰기',i:'fit',fn:()=>focusDoc(it)},{t:'PDF로 저장',i:'page',fn:()=>docPDF(it)},{t:'Word로 내보내기',i:'file',fn:()=>docWord(it)},{t:'마크다운으로 내보내기',i:'text',fn:()=>docMD(it)});
  if(n===1&&it.slide)out.push({t:'여기서부터 발표',i:'play',fn:()=>present(it.id)},{t:'발표자 메모',i:'text',fn:()=>slideNote(it)},{t:'슬라이드 복제',i:'copy',fn:()=>dupSlide(it)},{t:'슬라이드 패널 열기',i:'board',fn:openPanel});
  if(n===1&&it.type==='frame'&&!it.slide)out.push({t:'이 프레임을 슬라이드로',i:'board',fn:()=>{const a=ap();a.push();it.slide=1;it.sn=(slides().at(-1)?.sn||0)+1;renumber();a.render();a.save();openPanel()}});
  out.push({t:'선택한 것 인쇄',i:'page',fn:()=>Print.open('sel')},{t:'선택한 것만 그림(PNG)으로',i:'image',fn:()=>selPNG(its)},{t:'선택한 것 그림으로 복사',i:'copy',fn:()=>selPNG(its,1)});
  if(its.some(i=>['text','sticky','node','shape','doc','code','frame','check','table'].includes(i.type)))out.push({t:'글자 크기',i:'text',sub:[{t:'크게 (A+)',fn:()=>fsAll(its,1)},{t:'작게 (A−)',fn:()=>fsAll(its,-1)},{t:'원래대로',fn:()=>fsAll(its,0)}]});
  return out}
function fsAll(its,d){const a=ap();a.push();its.forEach(i=>{if(!d){delete i.fs;return}const el=document.querySelector(`.card[data-id="${i.id}"] .ed`)||document.querySelector(`.card[data-id="${i.id}"]`);const base=i.fs||parseFloat(el?getComputedStyle(el).fontSize:16)||16;i.fs=Math.max(8,Math.min(160,Math.round(base*(d>0?1.25:.8))))});a.render();a.save()}
async function selPNG(its,copy){const a=ap();const bs=its.map(i=>a.box(i.id)).filter(Boolean);if(!bs.length)return;const p=24,x0=Math.min(...bs.map(b=>b.x))-p,y0=Math.min(...bs.map(b=>b.y))-p,x1=Math.max(...bs.map(b=>b.x+b.w))+p,y1=Math.max(...bs.map(b=>b.y+b.h))+p;const pr=a.png({x:x0,y:y0,w:x1-x0,h:y1-y0},Math.min(3,8000/(x1-x0)));
  if(copy){try{await navigator.clipboard.write([new ClipboardItem({'image/png':pr})]);return toast('그림으로 복사했어요 · 카톡·문서에 붙여넣기 하세요')}catch(e){}}saveFile('선택.png',await pr)}
addEventListener('keydown',e=>{if(e.key==='F5'&&One.on()&&!pres){e.preventDefault();present()}});
return{addMenu,moreMenu,cardMenu,newSlide,newDoc,present,openPanel,focusDoc,slides,toMD,DOCCSS,titleOf,docPDF}})();
