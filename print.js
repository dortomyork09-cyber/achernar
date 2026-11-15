/* Achernar — 인쇄: 캔버스·선택·화면·프레임·슬라이드·문서를 종이로 */
const Print=(()=>{
const ap=()=>Canvas.api;
const PAPER={a4p:['A4 세로','210mm','297mm'],a4l:['A4 가로','297mm','210mm'],a3l:['A3 가로','420mm','297mm'],ltp:['레터 세로','216mm','279mm']};
let opt={what:'all',paper:'a4l',margin:'n',gray:false,head:true};
try{Object.assign(opt,JSON.parse(localStorage.getItem('ms-print')||'{}'))}catch(e){}
const saveOpt=()=>{try{localStorage.setItem('ms-print',JSON.stringify({paper:opt.paper,margin:opt.margin,gray:opt.gray,head:opt.head}))}catch(e){}};
const toURL=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
function boxesOf(its){return its.map(i=>ap().box(i.id)).filter(Boolean)}
function union(bs,p=24){if(!bs.length)return null;const x0=Math.min(...bs.map(b=>b.x))-p,y0=Math.min(...bs.map(b=>b.y))-p,x1=Math.max(...bs.map(b=>b.x+b.w))+p,y1=Math.max(...bs.map(b=>b.y+b.h))+p;return{x:x0,y:y0,w:x1-x0,h:y1-y0}}
function choices(){const C=ap().C();const sel=Canvas.sel();const frames=C.items.filter(i=>i.type==='frame'&&!i.slide);const slides=typeof DocPPT!=='undefined'?DocPPT.slides():[];const docs=C.items.filter(i=>i.type==='doc');
  return[['all','캔버스 전체',`카드 ${C.items.length}개를 한 장에`],...(sel.length?[['sel','선택한 것만',`${sel.length}개`]]:[]),['view','지금 보이는 화면','화면 그대로'],...(frames.length?[['frames','프레임마다 한 장',`${frames.length}장`]]:[]),...(slides.length?[['slides','슬라이드',`${slides.length}장 (발표 자료)`]]:[]),...(docs.length?[['doc','문서',docs.length>1?`문서 ${docs.length}개 중 선택한 것`:'글 문서 그대로']]:[])]}
/* 인쇄할 영역(그림) 만들기 */
async function regions(){const a=ap(),C=a.C();
  if(opt.what==='sel'){const r=union(boxesOf(Canvas.sel()));return r?[{r,t:'선택한 것'}]:[]}
  if(opt.what==='view'){const v=a.view(),vp=a.vpEl();return[{r:{x:-v.px/v.z,y:-v.py/v.z,w:vp.clientWidth/v.z,h:vp.clientHeight/v.z},t:'지금 화면'}]}
  if(opt.what==='frames')return C.items.filter(i=>i.type==='frame'&&!i.slide).sort((p,q)=>(Math.round(p.y/200)-Math.round(q.y/200))||(p.x-q.x)).map(f=>{const b=a.box(f.id);return{r:{x:b.x-4,y:b.y-34,w:b.w+8,h:b.h+38},t:(f.text||'').replace(/<[^>]+>/g,'')||'프레임'}});
  if(opt.what==='slides')return DocPPT.slides().map(f=>({r:{x:f.x,y:f.y,w:f.w,h:f.h},t:'슬라이드 '+f.sn,slide:1}));
  const r=union(C.items.map(i=>a.box(i.id)).filter(Boolean),40);return r?[{r,t:One.main().title||'캔버스'}]:[]}
async function pages(){const rs=await regions();const out=[];for(const g of rs){const sc=Math.max(.5,Math.min(3,5000/Math.max(g.r.w,g.r.h)));try{out.push({...g,u:await toURL(await ap().png(g.r,sc))})}catch(e){}}return out}
function css(){const[,W,H]=PAPER[opt.paper];const m=opt.margin==='0'?'0':opt.margin==='s'?'6mm':'12mm';
  return `@page{size:${W} ${H};margin:${m}}html,body{margin:0;background:#fff;font:12px "Pretendard","Noto Sans KR",sans-serif;color:#555}${opt.gray?'img{filter:grayscale(1)}':''}
  .pg{width:calc(${W} - 2*${m});height:calc(${H} - 2*${m});display:flex;flex-direction:column;page-break-after:always;break-after:page;overflow:hidden}.pg:last-child{page-break-after:auto;break-after:auto}
  .hd{display:flex;justify-content:space-between;padding:0 0 3mm;font-size:10px;color:#888}.im{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}.im img{max-width:100%;max-height:100%;object-fit:contain}`}
function pagesHTML(ps){const ttl=esc(One.main().title||'Achernar'),d=new Date().toLocaleDateString('ko-KR');return ps.map((p,i)=>`<div class="pg">${opt.head&&!p.slide?`<div class="hd"><span>${ttl} · ${esc(p.t)}</span><span>${d} · ${i+1}/${ps.length}</span></div>`:''}<div class="im"><img src="${p.u}"></div></div>`).join('')}
function frame(body,style,title){const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0';document.body.appendChild(f);const d=f.contentDocument;d.open();d.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${style}</style></head><body>${body}</body></html>`);d.close();
  const imgs=[...d.images];Promise.all(imgs.map(im=>im.complete?0:new Promise(r=>{im.onload=im.onerror=r}))).then(()=>setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){toast('인쇄 창을 열 수 없어요 · ‘인쇄용 파일’로 받아서 열어 보세요')}setTimeout(()=>f.remove(),60000)},200))}
function fileOf(body,style,title){const html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${style}</style></head><body>${body}<script>addEventListener('load',()=>setTimeout(()=>print(),300))<\/script></body></html>`;saveFile(title+' (인쇄용).html',new Blob([html],{type:'text/html'}))}
async function build(){if(opt.what==='doc'){const C=ap().C();const sel=Canvas.sel().find(i=>i.type==='doc');const it=sel||C.items.find(i=>i.type==='doc');const[,W,H]=PAPER[opt.paper.replace('l','p')]||PAPER.a4p;
    return{body:it.text||'',style:DocPPT.DOCCSS+`@page{size:${W} ${H};margin:${opt.margin==='0'?'0':opt.margin==='s'?'10mm':'18mm'}}body{margin:0 auto;max-width:none}${opt.gray?'*{color:#000!important}':''}`,title:DocPPT.titleOf(it)}}
  const ps=await pages();if(!ps.length)return null;return{body:pagesHTML(ps),style:css(),title:(One.main().title||'Achernar')+(opt.what==='slides'?' 슬라이드':''),n:ps.length,ps}}
/* 인쇄 창 */
async function open(what){One.home();await new Promise(r=>setTimeout(r,120));const ch=choices();opt.what=what&&ch.some(c=>c[0]===what)?what:(Canvas.sel().length?'sel':ch.some(c=>c[0]==='slides')&&opt.what==='slides'?'slides':'all');if(opt.what==='slides'||opt.what==='frames')opt.paper='a4l';
  const radio=(k,list,cur)=>list.map(([v,t,s])=>`<label class="prc${v===cur?' on':''}"><input type="radio" name="${k}" value="${v}" ${v===cur?'checked':''}><b>${t}</b>${s?`<small>${s}</small>`:''}</label>`).join('');
  modal({title:'인쇄',cls:'wide prmod',html:`<div class="prw"><div class="prl">
     <h6>무엇을</h6><div class="prg">${radio('what',ch,opt.what)}</div>
     <h6>종이</h6><div class="prg two">${radio('paper',Object.entries(PAPER).map(([k,v])=>[k,v[0]]),opt.paper)}</div>
     <h6>여백</h6><div class="prg three">${radio('margin',[['0','없음'],['s','좁게'],['n','보통']],opt.margin)}</div>
     <label class="prx"><input type="checkbox" id="prHead" ${opt.head?'checked':''}> 위에 제목·날짜·쪽수 넣기</label><label class="prx"><input type="checkbox" id="prGray" ${opt.gray?'checked':''}> 흑백으로 (잉크 아끼기)</label></div>
    <div class="prr"><div class="prv" id="prv"><div class="prload">미리보기 만드는 중…</div></div><div class="prinfo" id="prinfo"></div>
     <div class="prbtn"><button class="btn ghost" id="prFile">${ic('dl')}인쇄용 파일 받기</button><button class="btn pr" id="prGo">${ic('page')}인쇄하기</button></div><p class="note">인쇄 창에서 ‘PDF로 저장’을 고르면 PDF 파일이 돼요.</p></div></div>`,
   onOpen:()=>{const body=$('#mbody');let tk=0;
     const refresh=async()=>{const my=++tk;const pv=$('#prv');pv.innerHTML='<div class="prload">미리보기 만드는 중…</div>';const[,W,H]=PAPER[opt.what==='doc'?opt.paper.replace('l','p'):opt.paper];const ar=parseFloat(W)/parseFloat(H);
       if(opt.what==='doc'){const it=Canvas.sel().find(i=>i.type==='doc')||ap().C().items.find(i=>i.type==='doc');if(my!==tk)return;pv.innerHTML=`<div class="prpg doc" style="aspect-ratio:${ar}"><div class="prdoc">${it.text||''}</div></div>`;$('#prinfo').textContent=`문서 · ${DocPPT.titleOf(it)}`;return}
       const ps=await pages();if(my!==tk)return;pv.innerHTML=ps.length?ps.slice(0,12).map((p,i)=>`<div class="prpg" style="aspect-ratio:${ar}">${opt.head&&!p.slide?`<span class="prhd">${esc(p.t)} · ${i+1}/${ps.length}</span>`:''}<img src="${p.u}" style="${opt.gray?'filter:grayscale(1)':''}"></div>`).join(''):'<div class="prload">인쇄할 내용이 없어요</div>';$('#prinfo').textContent=ps.length?`${ps.length}장 · ${PAPER[opt.paper][0]}${ps.length>12?' · 앞 12장만 미리 보여요':''}`:''};
     body.addEventListener('change',e=>{const t=e.target;if(t.name){opt[t.name]=t.value;t.closest('.prg').querySelectorAll('.prc').forEach(l=>l.classList.toggle('on',l.querySelector('input').checked));if(t.name==='what'&&['slides','frames'].includes(t.value)){opt.paper='a4l';body.querySelector('input[name=paper][value=a4l]').checked=true;body.querySelectorAll('input[name=paper]').forEach(i=>i.closest('.prc').classList.toggle('on',i.checked))}}if(t.id==='prHead')opt.head=t.checked;if(t.id==='prGray')opt.gray=t.checked;saveOpt();refresh()});
     $('#prGo').onclick=async()=>{const b=await build();if(!b)return toast('인쇄할 내용이 없어요');closeModal();frame(b.body,b.style,b.title)};
     $('#prFile').onclick=async()=>{const b=await build();if(!b)return toast('인쇄할 내용이 없어요');fileOf(b.body,b.style,b.title);toast('받은 파일을 열면 바로 인쇄 창이 떠요',{ms:2400})};refresh()}})}
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='p'&&One.on()&&!$('#docf')&&!$('#osb')){e.preventDefault();e.stopPropagation();open()}},true);
return{open}})();
