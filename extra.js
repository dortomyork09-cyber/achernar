'use strict';
/* =========================================================
   수식 엔진 · PDF 뷰어 · 미리보기 · 알림 · 단축키 · 투어 · 지식 산책
   ========================================================= */
const Formula=(()=>{
  const pad=n=>String(n).padStart(2,'0'),fmtD=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const D=s=>{if(s instanceof Date)return s;const t=String(s||'');return new Date(t.length<=10?t+'T00:00':t)};
  const UNIT={days:864e5,day:864e5,'일':864e5,weeks:6048e5,'주':6048e5,hours:36e5,'시간':36e5};
  const mdiff=(a,b)=>(a.getFullYear()-b.getFullYear())*12+a.getMonth()-b.getMonth();
  const FN={if:(c,a,b)=>c?a:b,and:(...a)=>a.every(Boolean),or:(...a)=>a.some(Boolean),not:a=>!a,round:(x,n=0)=>Math.round(+x*10**n)/10**n,floor:x=>Math.floor(+x),ceil:x=>Math.ceil(+x),abs:x=>Math.abs(+x),
    min:(...a)=>Math.min(...a.flat().map(Number)),max:(...a)=>Math.max(...a.flat().map(Number)),sum:(...a)=>a.flat().reduce((s,x)=>s+(+x||0),0),avg:(...a)=>{const f=a.flat();return f.length?f.reduce((s,x)=>s+(+x||0),0)/f.length:0},
    concat:(...a)=>a.join(''),length:s=>Array.isArray(s)?s.length:String(s??'').length,contains:(s,t)=>String(s??'').includes(String(t)),empty:x=>x===''||x==null||(Array.isArray(x)&&!x.length),replace:(s,a,b)=>String(s??'').split(a).join(b),upper:s=>String(s).toUpperCase(),lower:s=>String(s).toLowerCase(),
    today:()=>fmtD(new Date()),now:()=>fmtD(new Date()),year:d=>D(d).getFullYear(),month:d=>D(d).getMonth()+1,day:d=>D(d).getDate(),toNumber:x=>+x||0,format:x=>String(x??''),
    dateBetween:(a,b,u='days')=>{const x=D(a),y=D(b);if(/^(months?|개월|달)$/.test(u))return mdiff(x,y);if(/^(years?|년)$/.test(u))return Math.floor(mdiff(x,y)/12);return Math.floor((x-y)/(UNIT[u]||864e5))},
    dateAdd:(d,n,u='days')=>{const x=D(d);if(/^(months?|개월|달)$/.test(u))x.setMonth(x.getMonth()+ +n);else if(/^(years?|년)$/.test(u))x.setFullYear(x.getFullYear()+ +n);else x.setTime(x.getTime()+n*(UNIT[u]||864e5));return fmtD(x)}};
  const KO={만약:'if',그리고:'and',또는:'or',반올림:'round',합계:'sum',평균:'avg',최소:'min',최대:'max',오늘:'today',길이:'length',포함:'contains',비었나:'empty',날짜차이:'dateBetween',날짜더하기:'dateAdd',연결:'concat'};
  function tok(s){const t=[];const re=/\s*(?:(\d+(?:\.\d+)?)|"((?:[^"\\]|\\.)*)"|\{([^}]+)\}|([A-Za-z_가-힣][\w가-힣]*)|(==|!=|>=|<=|&&|\|\||[-+*/%^(),<>!=]))/y;let i=0;
    while(i<s.length){re.lastIndex=i;const m=re.exec(s);if(!m)throw Error(`‘${s[i]}’를 이해하지 못했어요`);if(m.slice(1).every(x=>x===undefined))break;i=re.lastIndex;
      if(m[1])t.push({t:'n',v:+m[1]});else if(m[2]!==undefined)t.push({t:'s',v:m[2].replace(/\\(.)/g,'$1')});else if(m[3])t.push({t:'p',v:m[3].trim()});else if(m[4])t.push({t:'id',v:m[4]});else t.push({t:'o',v:m[5]})}return t}
  function parse(src){const t=tok(src);let i=0;const isO=v=>t[i]?.t==='o'&&t[i].v===v,nx=()=>t[i++];
    const bin=(next,ops)=>()=>{let a=next();while(t[i]?.t==='o'&&ops.includes(t[i].v)){const o=nx().v;a={o,a,b:next()}}return a};
    function pr(){const k=nx();if(!k)throw Error('식이 덜 끝났어요');if(k.t==='n'||k.t==='s')return{v:k.v};if(k.t==='p')return{p:k.v};
      if(k.t==='o'&&k.v==='('){const e=ex();if(!isO(')'))throw Error('‘)’가 빠졌어요');nx();return e}
      if(k.t==='id'){if(k.v==='true'||k.v==='참')return{v:true};if(k.v==='false'||k.v==='거짓')return{v:false};if(isO('(')){nx();const args=[];if(!isO(')')){args.push(ex());while(isO(',')){nx();args.push(ex())}}if(!isO(')'))throw Error('‘)’가 빠졌어요');nx();if(k.v==='prop'||k.v==='속성')return{p:args[0]?.v};return{f:k.v,args}}throw Error(`모르는 이름: ${k.v}`)}
      throw Error(`여기에 ‘${k.v}’가 올 수 없어요`)}
    function un(){if(isO('-')){nx();return{o:'neg',a:un()}}if(isO('!')){nx();return{o:'!',a:un()}}return pr()}
    function pw(){const a=un();if(isO('^')){nx();return{o:'^',a,b:pw()}}return a}
    const mul=bin(pw,['*','/','%']),add=bin(mul,['+','-']),cmp=bin(add,['==','!=','>','<','>=','<=','=']),and=bin(cmp,['&&']),or=bin(and,['||']);function ex(){return or()}
    const e=ex();if(i<t.length)throw Error('식 끝에 남는 글자가 있어요');return e}
  function ev(n,get){if('v'in n)return n.v;if('p'in n)return get(n.p);if(n.f){const f=FN[n.f]||FN[KO[n.f]];if(!f)throw Error(`모르는 함수: ${n.f}`);return f(...n.args.map(a=>ev(a,get)))}
    if(n.o==='neg')return -ev(n.a,get);if(n.o==='!')return!ev(n.a,get);const a=ev(n.a,get),b=ev(n.b,get);
    switch(n.o){case '+':return typeof a==='string'||typeof b==='string'?String(a??'')+String(b??''):(+a||0)+(+b||0);case '-':return a-b;case '*':return a*b;case '/':return+b===0?NaN:a/b;case '%':return a%b;case '^':return a**b;case '==':case '=':return a==b;case '!=':return a!=b;case '>':return a>b;case '<':return a<b;case '>=':return a>=b;case '<=':return a<=b;case '&&':return a&&b;case '||':return a||b}}
  const cache=new Map();
  function run(src,get){try{let a=cache.get(src);if(!a){a=parse(src);cache.set(src,a)}return ev(a,get)}catch(e){return{err:e.message}}}
  function show(r){if(r&&r.err)return'⚠ '+r.err;if(typeof r==='boolean')return r?'✓':'✗';if(typeof r==='number')return isFinite(r)?String(Math.round(r*100)/100):'⚠ 계산할 수 없어요';return r==null?'':String(r)}
  return{run,show,parse}})();

async function getBlob(id){const b=await tx('blobs','readonly',s=>s.get(id));if(b)return b;const a=S.assets?.[id];if(a){try{const r=await fetch('/_blob/'+a);if(r.ok)return await r.blob()}catch(e){}}return null}
async function dlBlob(id){const b=await getBlob(id);if(!b)return toast('파일을 찾을 수 없어요');saveFile(blobs[id]?.name||'파일',b)}

/* ---------- PDF 뷰어 (pdf.js) ---------- */
const PDFV=(()=>{let lib=null;const base='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  const add=src=>new Promise((r,j)=>{const s=document.createElement('script');s.src=src;s.onload=r;s.onerror=j;document.head.appendChild(s)});
  async function load(){if(lib)return lib;await add(base+'pdf.worker.min.js');await add(base+'pdf.min.js');lib=window.pdfjsLib;lib.GlobalWorkerOptions.workerSrc=base+'pdf.worker.min.js';return lib}
  function open(id,store,onSave){store.hl??={};store.notes??={};const st={n:1,z:1.2,hl:false,doc:null};
    modal({title:blobs[id]?.name||'PDF',cls:'wide',html:`<div class="pdfbar"><button class="ib" data-pp="-1" aria-label="이전 쪽">${ic('back')}</button><b id="pdfpg">…</b><button class="ib" data-pp="1" aria-label="다음 쪽">${ic('chev')}</button><span class="vsep"></span><button class="ib" data-pz="-1" aria-label="축소">−</button><span id="pdfz" class="note">120%</span><button class="ib" data-pz="1" aria-label="확대">+</button><span class="vsep"></span><button class="tbtn" data-phl>${ic('mark')}형광 표시</button><input class="inp" id="pdfq" placeholder="문서 안 찾기 (Enter)" style="height:36px;width:190px"><span id="pdfhits"></span><span class="sp"></span><button class="tbtn" data-pdl>${ic('dl')}내려받기</button></div><div class="pdfwrap"><div class="pdfstage" id="pdfst"><p class="note" style="padding:30px">PDF를 여는 중…</p></div><aside class="pdfside"><b>이 쪽 메모</b><textarea class="inp" id="pdfn" placeholder="이 쪽에 대한 메모"></textarea><p class="note" id="pdfhl"></p></aside></div>`,btns:[{t:'닫기',cls:'pr'}],
      onOpen:async()=>{const stg=$('#pdfst');try{const L=await load();const bl=await getBlob(id);if(!bl){stg.innerHTML='<p class="note" style="padding:30px">파일을 찾을 수 없어요.</p>';return}st.doc=await L.getDocument({data:new Uint8Array(await bl.arrayBuffer())}).promise}catch(e){stg.innerHTML='<p class="note" style="padding:30px">PDF 미리보기를 불러오지 못했어요. ‘내려받기’로 열어 주세요.</p>';return}
        stg.innerHTML='<div style="position:relative;display:inline-block"><canvas id="pdfc"></canvas><div class="pdfov" id="pdfov"></div></div>';draw();
        const ov=$('#pdfov');ov.addEventListener('pointerdown',e=>{const hi=e.target.closest('[data-hi]');if(hi){store.hl[st.n].splice(+hi.dataset.hi,1);onSave();return draw()}if(!st.hl)return;e.preventDefault();const r=ov.getBoundingClientRect(),x0=(e.clientX-r.left)/r.width,y0=(e.clientY-r.top)/r.height;const box=document.createElement('i');ov.appendChild(box);
          const mv=ev=>{const x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;Object.assign(box.style,{left:Math.min(x,x0)*100+'%',top:Math.min(y,y0)*100+'%',width:Math.abs(x-x0)*100+'%',height:Math.abs(y-y0)*100+'%'})};
          const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);const x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;if(Math.abs(x-x0)>.01&&Math.abs(y-y0)>.005){(store.hl[st.n]||(store.hl[st.n]=[])).push({x:Math.min(x,x0),y:Math.min(y,y0),w:Math.abs(x-x0),h:Math.abs(y-y0)});onSave()}draw()};addEventListener('pointermove',mv);addEventListener('pointerup',up)})}});
    async function draw(){if(!st.doc)return;const pg=await st.doc.getPage(st.n),vp=pg.getViewport({scale:st.z}),c=$('#pdfc');if(!c)return;const dpr=devicePixelRatio||1;c.width=vp.width*dpr;c.height=vp.height*dpr;c.style.width=vp.width+'px';c.style.height=vp.height+'px';const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);await pg.render({canvasContext:g,viewport:vp}).promise;
      const ov=$('#pdfov');ov.style.width=vp.width+'px';ov.style.height=vp.height+'px';ov.classList.toggle('on',st.hl);ov.innerHTML=(store.hl[st.n]||[]).map((h,i)=>`<i style="left:${h.x*100}%;top:${h.y*100}%;width:${h.w*100}%;height:${h.h*100}%" data-hi="${i}" title="눌러서 지우기"></i>`).join('');
      $('#pdfpg').textContent=`${st.n} / ${st.doc.numPages}`;$('#pdfz').textContent=Math.round(st.z*100)+'%';$('#pdfn').value=store.notes[st.n]||'';const k=(store.hl[st.n]||[]).length;$('#pdfhl').textContent=k?`형광 표시 ${k}개 · 눌러서 지울 수 있어요`:'‘형광 표시’를 켜고 끌어서 칠해요'}
    const mb=$('#mbody');mb.addEventListener('click',e=>{const pp=e.target.closest('[data-pp]'),pz=e.target.closest('[data-pz]');if(!st.doc&&!e.target.closest('[data-pdl]'))return;
      if(pp){st.n=cl(st.n+ +pp.dataset.pp,1,st.doc.numPages);draw()}if(pz){st.z=cl(st.z+ +pz.dataset.pz*.2,.4,3);draw()}if(e.target.closest('[data-phl]')){st.hl=!st.hl;e.target.closest('[data-phl]').classList.toggle('on',st.hl);draw()}if(e.target.closest('[data-pdl]'))dlBlob(id);const h=e.target.closest('[data-hit]');if(h){st.n=+h.dataset.hit;draw()}});
    mb.addEventListener('input',e=>{if(e.target.id==='pdfn'){store.notes[st.n]=e.target.value;onSave()}});
    mb.addEventListener('keydown',async e=>{if(e.target.id!=='pdfq'||e.key!=='Enter'||e.isComposing||!st.doc)return;e.preventDefault();const q=e.target.value.trim().toLowerCase();if(!q)return;const hits=[];for(let i=1;i<=st.doc.numPages;i++){const tc=await(await st.doc.getPage(i)).getTextContent();if(tc.items.map(x=>x.str).join(' ').toLowerCase().includes(q))hits.push(i)}
      $('#pdfhits').innerHTML=hits.length?hits.slice(0,12).map(n=>`<button class="mini" data-hit="${n}">${n}쪽</button>`).join(' '):'<span class="note">없어요</span>';if(hits[0]){st.n=hits[0];draw()}})}
  return{open}})();

/* ---------- 미리보기 (호버 카드 · 가운데 팝업) ---------- */
const Peek=(()=>{let t=null,el=null;
  function html(p){if(p.type==='doc')return Editor.toHTML(p.blocks);if(p.type==='db')return DBV.toHTML(p);if(p.type==='canvas')return `<ul>${Canvas.textOf(p.cv).split('\n').filter(Boolean).slice(0,40).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;return `<ul>${kids(p.id).map(k=>`<li>${esc(pTitle(k))}</li>`).join('')||'<li>빈 폴더</li>'}</ul>`}
  function card(p,x,y){hide();el=document.createElement('div');el.id='peek';el.innerHTML=`<div class="pk-h" style="${p.cover?coverCSS(p.cover):'background:'+TYPES[p.type].g}"><span class="pk-i">${pIcon(p)}</span></div><div class="pk-b"><b>${esc(pTitle(p))}</b><small>${TYPES[p.type].n} · ${ago(p.updated)}</small><p>${esc(pageText(p).replace(p.title,'').trim().slice(0,170))||'비어 있어요'}</p><small>Shift+클릭하면 크게 미리 봐요</small></div>`;document.body.appendChild(el);place(el,x,y)}
  function hide(){el?.remove();el=null}
  function big(p){modal({title:pTitle(p),cls:'mid',html:`<div class="peekdoc">${html(p)}</div>`,btns:[{t:'옆에 펼쳐 보기',fn:()=>{ui.sideId=p.id;ui.ptab='side';togglePanel(true)}},{t:'열기',cls:'pr',fn:()=>go('page:'+p.id)}]})}
  function bind(){document.addEventListener('mouseover',e=>{if(!S.settings.mods.peek||!matchMedia('(hover:hover)').matches)return;const a=e.target.closest('a.pl,.subp,[data-peek]');if(!a)return;clearTimeout(t);const id=a.dataset.page||a.dataset.open||a.dataset.peek;const p=P(id);if(!p||p.trash)return;t=setTimeout(()=>{const r=a.getBoundingClientRect();card(p,r.left,r.bottom+8)},420)});
    document.addEventListener('mouseout',e=>{if(e.target.closest('a.pl,.subp,[data-peek]')){clearTimeout(t);hide()}});document.addEventListener('pointerdown',()=>{clearTimeout(t);hide()},true)}
  return{bind,html,big,hide}})();

/* ---------- 알림 (마감일) ---------- */
const Remind=(()=>{
  function due(){const out=[];live().filter(p=>p.type==='db').forEach(p=>DBV.dueRows(p).forEach(x=>out.push({...x,p})));return out.sort((a,b)=>a.date<b.date?-1:1)}
  function badge(){const n=S.settings.mods.remind?due().length:0,b=$('#bellN');if(b){b.textContent=n>9?'9+':n;b.hidden=!n}}
  function open(x,y){const ds=due(),td=today();const it=d=>({t:d.title,s:d.date===td?'오늘':d.date.slice(5).replace('-','/'),em:d.date<td?'⏰':'📌',fn:()=>{DBV.openLater(d.row.id);go('page:'+d.p.id)}});const past=ds.filter(d=>d.date<td),now2=ds.filter(d=>d.date===td);
    menu(x,y,[...(past.length?[{h:`지난 일정 ${past.length}`},...past.slice(0,8).map(it)]:[]),...(now2.length?[{h:`오늘 ${now2.length}`},...now2.slice(0,8).map(it)]:[]),...(!ds.length?[{h:'오늘까지 할 일이 없어요 🎉'}]:[]),'-',{t:'브라우저 알림 받기',i:'bell',fn:askPerm},{t:'반복 작업은 데이터베이스의 ‘반복’ 속성으로',i:'info',dis:1}])}
  async function askPerm(){try{if(!('Notification'in window))throw 0;const r=await Notification.requestPermission();toast(r==='granted'?'오늘 할 일이 있으면 알려 드릴게요':'브라우저가 알림을 막았어요. 종 버튼에서 확인할 수 있어요')}catch(e){toast('이 화면에서는 브라우저 알림을 쓸 수 없어요. 종 버튼에서 확인해 주세요')}}
  function notify(){try{if(!S.settings.mods.remind||!('Notification'in window)||Notification.permission!=='granted')return;const td=today();if(S.notified===td)return;const ds=due();if(!ds.length)return;new Notification(`ULTIMATE NOTE · 할 일 ${ds.length}개`,{body:ds.slice(0,4).map(d=>'• '+d.title).join('\n')});S.notified=td;save()}catch(e){}}
  function start(){badge();notify();setInterval(()=>{badge();notify()},5*60*1000)}
  return{due,badge,open,start,askPerm}})();

/* ---------- 단축키 ---------- */
const Keys=(()=>{const DEF={newDoc:['새 문서','Ctrl+N'],newFolder:['새 폴더','Ctrl+Shift+N'],palette:['빠른 실행 · 검색','Ctrl+P'],cmd:['명령 팔레트','Ctrl+Shift+P'],search:['전체 검색','Ctrl+Shift+F'],quick:['빠른 메모','Ctrl+Shift+M'],drawer:['서랍 열고 닫기','Ctrl+\\'],panel:['오른쪽 패널','Ctrl+.'],save:['저장 확인','Ctrl+S'],back:['뒤로','Alt+ArrowLeft'],fwd:['앞으로','Alt+ArrowRight'],graph:['그래프','Ctrl+Shift+G'],home:['홈','Ctrl+Shift+H']};
  const RES=['Ctrl+B','Ctrl+I','Ctrl+U','Ctrl+Z','Ctrl+Y','Ctrl+C','Ctrl+V','Ctrl+X','Ctrl+A','Ctrl+K','Ctrl+D','Ctrl+F','Ctrl+G'];
  const name=e=>{if(['Control','Shift','Alt','Meta','Process'].includes(e.key))return'';const k=e.key===' '?'Space':e.key.length===1?e.key.toUpperCase():e.key;return[(e.ctrlKey||e.metaKey)&&'Ctrl',e.shiftKey&&'Shift',e.altKey&&'Alt',k].filter(Boolean).join('+')};
  const get=a=>S.settings.keys?.[a]||DEF[a][1];const match=e=>{const n=name(e).toUpperCase();if(!n)return null;return Object.keys(DEF).find(a=>get(a).toUpperCase()===n)||null};
  const label=a=>get(a).replace('ArrowLeft','←').replace('ArrowRight','→');
  function record(a,done){toast('바꿀 키를 눌러 주세요 (Esc 취소)',{ms:8000});const h=e=>{e.preventDefault();e.stopPropagation();if(e.key==='Escape'){fin();return toast('취소했어요')}const n=name(e);if(!n)return;if(!/^(Ctrl|Alt)/.test(n)){fin();return toast('Ctrl이나 Alt와 함께 눌러 주세요')}
      if(RES.includes(n)){fin();return toast(`${n}은 글쓰기에 쓰는 키라 쓸 수 없어요`)}const clash=Object.keys(DEF).find(b=>b!==a&&get(b).toUpperCase()===n.toUpperCase());if(clash){fin();return toast(`${n}은 이미 ‘${DEF[clash][0]}’에 쓰이고 있어요`)}
      (S.settings.keys??={})[a]=n;save();fin();toast(`‘${DEF[a][0]}’ → ${n}`);done?.()};const fin=()=>removeEventListener('keydown',h,true);addEventListener('keydown',h,true)}
  return{DEF,name,get,match,label,record}})();

/* ---------- 처음 사용 안내 ---------- */
function tour(i=0){const ST=[['plus','무엇이든 + 로 시작해요','왼쪽 위 동그란 + 버튼이나 아래 독의 ‘새로’로 문서·데이터베이스·캔버스·객체를 만들어요. 템플릿 30개도 있어요.'],['page','종이에 쓰듯 쓰고, 리본으로 꾸며요','위쪽 리본에서 제목·목록·표·사진·AI를 한 번에 눌러 넣어요. 글 중간에 / 를 쳐도 돼요. [[ 를 치면 다른 문서와 연결돼요.'],['more','헷갈리면 오른쪽 클릭','블록·카드·페이지·빈 곳 어디든 오른쪽 클릭(휴대폰은 길게 누르기)하면 거기서 할 수 있는 일이 다 나와요.'],['search','찾고 싶으면 Ctrl+P','문서·태그·명령을 한 곳에서 찾아요. tag:사업, type:db 처럼 조건도 돼요. 단축키는 설정에서 바꿀 수 있어요.']];
  const s=ST[i];modal({cls:'tour',html:`<div class="tour-i">${ic(s[0])}</div><div class="tour-dots">${ST.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div><h3>${s[1]}</h3><p>${s[2]}</p>`,btns:[{t:i?'이전':'건너뛰기',fn:()=>{if(i){setTimeout(()=>tour(i-1));}else{S.toured=1;save()}}},{t:i<ST.length-1?'다음':'시작하기',cls:'pr',fn:()=>{if(i<ST.length-1)setTimeout(()=>tour(i+1));else{S.toured=1;save()}}}],onClose:()=>{S.toured=1;save()}})}

/* ---------- 오늘의 지식 산책 ---------- */
function walk(){const d=new Date();let seed=d.getFullYear()*400+d.getMonth()*31+d.getDate();const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};
  const pool=live().filter(p=>p.type!=='folder'&&!p.objOf);const old=pool.filter(p=>now()-p.updated>3*864e5);const pick=[...(old.length>=3?old:pool)].map(p=>[rnd(),p]).sort((a,b)=>a[0]-b[0]).slice(0,3).map(x=>x[1]);
  let pair=null;const ls=pool.filter(p=>p.tags?.length&&p.type==='doc');outer:for(const a of ls)for(const b of ls){if(a.id<b.id&&a.tags.some(t=>b.tags.includes(t))&&!linksFrom(a).includes(b.id)&&!linksFrom(b).includes(a.id)){pair=[a,b];break outer}}
  return{pick,pair}}
function connectPair(a,b){a.blocks.push(B('p',`관련: <a class="pl" data-page="${b.id}" contenteditable="false">${esc(pTitle(b))}</a>&nbsp;`));touch(a);toast(`‘${pTitle(a)}’에 ‘${pTitle(b)}’ 연결을 넣었어요`,{act:'열기',fn:()=>go('page:'+a.id)});render()}
