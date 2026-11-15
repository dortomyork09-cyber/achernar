'use strict';
/* =========================================================
   그래프 뷰 — 문서 연결 지도, 로컬 그래프, 연결 분석
   ========================================================= */
const Graph=(()=>{
let raf=0,ac=null;
function mount(el){ac=new AbortController();const sig={signal:ac.signal};const st={q:'',hier:true,iso:true,types:{doc:1,db:1,canvas:1,folder:1},center:ui.gcenter||'',depth:2};ui.gcenter='';
  el.innerHTML=`<div class="gwrap"><div class="gbar"><h2>그래프 뷰</h2><input class="inp" style="height:36px;width:min(200px,40vw)" type="search" placeholder="문서 찾기" data-gq aria-label="노드 검색">
   <select class="selx" data-gc aria-label="중심 문서"><option value="">전체 그래프</option>${live().sort((a,b)=>b.updated-a.updated).map(p=>`<option value="${p.id}"${st.center===p.id?' selected':''}>중심: ${esc(pTitle(p))}</option>`).join('')}</select>
   <select class="selx" data-gd aria-label="연결 단계"${st.center?'':' disabled'}><option value="1">1단계</option><option value="2" selected>2단계</option><option value="3">3단계</option></select>
   <label><input type="checkbox" data-gh checked>상하위 관계</label><label><input type="checkbox" data-gi checked>고립된 문서</label>
   ${Object.entries(TYPES).map(([k,t])=>`<label><input type="checkbox" data-gt="${k}" checked><span style="color:${t.c}">●</span>${t.n}</label>`).join('')}<span class="sp"></span><button class="btn sm ghost" data-gfit>${ic('fit')}전체 보기</button></div>
   <canvas id="gcv" aria-label="문서 연결 그래프. 노드를 누르면 문서가 열려요"></canvas><div class="glegend"><span><i style="--c:var(--mute)"></i>실선: 문서 링크</span><span><i style="--c:transparent;border:1.5px dashed var(--mute)"></i>점선: 상하위 페이지</span><span><i style="--c:transparent;border:2px solid #E5484D"></i>빨간 테두리: 고립된 문서</span></div><div class="gstats" id="gstats"></div></div>`;
  const cv=$('#gcv',el),g=cv.getContext('2d');let W=0,H=0,dpr=1,px=0,py=0,z=1,nodes=[],edges=[],map={},alpha=1,hover=null,drag=null,P=new Map(),pinch=null;
  function build(){const old=map;map={};const all=live().filter(p=>st.types[p.type]);const ids=new Set(all.map(p=>p.id));let E2=[];
    all.forEach(p=>{linksFrom(p).forEach(t=>{if(ids.has(t))E2.push({a:p.id,b:t,h:0})});if(st.hier&&p.parent&&ids.has(p.parent))E2.push({a:p.parent,b:p.id,h:1})});
    let keep=ids;if(st.center&&ids.has(st.center)){keep=new Set([st.center]);let fr=[st.center];for(let d=0;d<st.depth;d++){const nx=[];E2.forEach(e=>{if(fr.includes(e.a)&&!keep.has(e.b)){keep.add(e.b);nx.push(e.b)}if(fr.includes(e.b)&&!keep.has(e.a)){keep.add(e.a);nx.push(e.a)}});fr=nx}}
    E2=E2.filter(e=>keep.has(e.a)&&keep.has(e.b));const deg={};E2.forEach(e=>{deg[e.a]=(deg[e.a]||0)+1;deg[e.b]=(deg[e.b]||0)+1});
    nodes=all.filter(p=>keep.has(p.id)&&(st.iso||deg[p.id])).map((p,i)=>{const o=old[p.id];const a=i*2.4,r=40+Math.sqrt(i)*38;const n=o?{...o,p}:{id:p.id,p,x:Math.cos(a)*r,y:Math.sin(a)*r,vx:0,vy:0};n.deg=deg[p.id]||0;n.r=7+Math.sqrt(n.deg)*3.2;map[p.id]=n;return n});
    edges=E2.filter(e=>map[e.a]&&map[e.b]);alpha=1;stats();kick()}
  function stats(){const top=[...nodes].sort((a,b)=>b.deg-a.deg).filter(n=>n.deg).slice(0,5),iso=nodes.filter(n=>!n.deg).slice(0,8),rec=[...nodes].sort((a,b)=>b.p.updated-a.p.updated).slice(0,4);
    const norm=t=>(t||'').replace(/\s|\(사본\)/g,'').toLowerCase();const seen={},dups=[];live().forEach(p=>{const k=norm(p.title);if(!k)return;if(seen[k])dups.push([seen[k],p]);else seen[k]=p});
    const L=a=>a.map(n=>`<button data-gn="${n.id||n.p.id}">${n.p?(n.p.icon||'•'):'•'} ${esc(pTitle(n.p||n))}${n.deg!==undefined&&n.deg?` <span class="note">${n.deg}</span>`:''}</button>`).join('');
    $('#gstats',el).innerHTML=`<h5>문서 ${nodes.length}개 · 연결 ${edges.length}개</h5><h5>가장 많이 연결된 문서</h5>${L(top)||'<p class="note">아직 없어요</p>'}<h5>연결되지 않은 문서 (${nodes.filter(n=>!n.deg).length})</h5>${L(iso)||'<p class="note">모두 연결돼 있어요</p>'}<h5>최근 수정</h5>${L(rec)}${dups.length?`<h5>제목이 겹치는 문서 (중복 후보)</h5>${dups.slice(0,4).map(([a,b])=>`<button data-gn="${b.id}">${esc(pTitle(a))} ↔ ${esc(pTitle(b))}</button>`).join('')}`:''}`}
  function size(){const r=cv.getBoundingClientRect();dpr=devicePixelRatio||1;W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;if(!px&&!py){px=W/2;py=H/2}draw()}
  function step(){const k=alpha;for(let i=0;i<nodes.length;i++){const a=nodes[i];for(let j=i+1;j<nodes.length;j++){const b=nodes[j];let dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy||1;if(d2>250000)continue;const f=2600/d2*k,d=Math.sqrt(d2);dx/=d;dy/=d;a.vx-=dx*f;a.vy-=dy*f;b.vx+=dx*f;b.vy+=dy*f}}
    edges.forEach(e=>{const a=map[e.a],b=map[e.b];const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,L=e.h?70:100,f=(d-L)*.02*k;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f});
    nodes.forEach(n=>{n.vx-=n.x*.004*k;n.vy-=n.y*.004*k;if(drag&&drag.n===n)return;n.vx*=.6;n.vy*=.6;n.x+=n.vx;n.y+=n.vy});alpha*=.985}
  const col=t=>TYPES[t]?.c||'#6478E8';
  function draw(){if(!g)return;const cs=getComputedStyle(document.documentElement),ink=getComputedStyle(document.body).color,mute=getComputedStyle($('#saveSt')||document.body).color;const q=st.q.trim().toLowerCase();
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);g.save();g.translate(px,py);g.scale(z,z);const hit=q?new Set(nodes.filter(n=>pTitle(n.p).toLowerCase().includes(q)).map(n=>n.id)):null;const nb=hover?new Set([hover.id,...edges.filter(e=>e.a===hover.id||e.b===hover.id).flatMap(e=>[e.a,e.b])]):null;
    edges.forEach(e=>{const a=map[e.a],b=map[e.b];const fade=(hit&&!(hit.has(e.a)||hit.has(e.b)))||(nb&&!(nb.has(e.a)&&nb.has(e.b)));g.globalAlpha=fade?.12:e.h?.35:.55;g.strokeStyle=nb&&!fade?(cs.getPropertyValue('--acc').trim()||'#6478E8'):mute;g.lineWidth=(e.h?1:1.6)/Math.max(.6,z);g.setLineDash(e.h?[4/z,4/z]:[]);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()});g.setLineDash([]);
    nodes.forEach(n=>{const fade=(hit&&!hit.has(n.id))||(nb&&!nb.has(n.id));g.globalAlpha=fade?.2:1;g.fillStyle=col(n.p.type);g.beginPath();g.arc(n.x,n.y,n.r,0,7);g.fill();if(!n.deg){g.strokeStyle='#E5484D';g.lineWidth=2/z;g.stroke()}if(n.id===st.center||hit?.has(n.id)||hover===n){g.strokeStyle=ink;g.lineWidth=2.5/z;g.beginPath();g.arc(n.x,n.y,n.r+4/z,0,7);g.stroke()}
      if(z>.55||hover===n||hit?.has(n.id)||n.deg>3){g.font=`${hover===n?700:500} ${13/Math.max(z,.8)}px "Noto Sans KR",sans-serif`;g.fillStyle=ink;g.textAlign='center';g.textBaseline='top';g.fillText((n.p.icon?n.p.icon+' ':'')+pTitle(n.p).slice(0,24),n.x,n.y+n.r+4)}});
    g.restore();if(!nodes.length){g.fillStyle=mute;g.font='16px "Noto Sans KR"';g.textAlign='center';g.fillText('표시할 문서가 없어요. 필터를 바꿔 보세요.',W/2,H/2)}}
  function loop(){raf=0;step();draw();if(alpha>.02||drag)raf=requestAnimationFrame(loop)}
  function kick(){alpha=Math.max(alpha,.5);if(!raf)raf=requestAnimationFrame(loop)}
  function fitG(){if(!nodes.length)return;const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);const x0=Math.min(...xs)-60,x1=Math.max(...xs)+60,y0=Math.min(...ys)-60,y1=Math.max(...ys)+60;z=cl(Math.min(W/(x1-x0),H/(y1-y0)),.2,2.2);px=W/2-(x0+x1)/2*z;py=H/2-(y0+y1)/2*z;draw()}
  const toW=(cx,cy)=>{const r=cv.getBoundingClientRect();return[(cx-r.left-px)/z,(cy-r.top-py)/z]};const pick=(x,y)=>{for(let i=nodes.length-1;i>=0;i--){const n=nodes[i];if(Math.hypot(n.x-x,n.y-y)<n.r+5/z)return n}return null};
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);if(P.size===2){const[a,b]=[...P.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z0:z,px0:px,py0:py,c:[(a[0]+b[0])/2,(a[1]+b[1])/2]};drag=null;return}
    const[x,y]=toW(e.clientX,e.clientY),n=pick(x,y);drag={n,sx:e.clientX,sy:e.clientY,px0:px,py0:py,moved:false};if(n)kick()},sig);
  cv.addEventListener('pointermove',e=>{if(P.has(e.pointerId))P.set(e.pointerId,[e.clientX,e.clientY]);if(pinch&&P.size===2){const[a,b]=[...P.values()],r=cv.getBoundingClientRect();const nz=cl(pinch.z0*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d,.15,4);const c=[pinch.c[0]-r.left,pinch.c[1]-r.top];px=c[0]-(c[0]-pinch.px0)*nz/pinch.z0;py=c[1]-(c[1]-pinch.py0)*nz/pinch.z0;z=nz;return draw()}
    const[x,y]=toW(e.clientX,e.clientY);if(!drag){const h=pick(x,y);if(h!==hover){hover=h;cv.style.cursor=h?'pointer':'grab';draw()}return}
    const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;if(drag.n){drag.n.x=x;drag.n.y=y;drag.n.vx=drag.n.vy=0;kick()}else{px=drag.px0+dx;py=drag.py0+dy;draw()}},sig);
  const up=e=>{P.delete(e.pointerId);if(P.size<2)pinch=null;if(!drag)return;const d=drag;drag=null;if(d.n&&!d.moved)go('page:'+d.n.id)};cv.addEventListener('pointerup',up,sig);cv.addEventListener('pointercancel',up,sig);
  cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top;const f=Math.exp(-e.deltaY*(e.ctrlKey?.01:.0016)),nz=cl(z*f,.15,4);px=cx-(cx-px)*nz/z;py=cy-(cy-py)*nz/z;z=nz;draw()},{passive:false,signal:ac.signal});
  el.addEventListener('input',e=>{const t=e.target;if(t.dataset.gq!==undefined){st.q=t.value;draw();const m=nodes.find(n=>pTitle(n.p).toLowerCase().includes(st.q.toLowerCase()));if(m&&st.q){px=W/2-m.x*z;py=H/2-m.y*z;draw()}}},sig);
  el.addEventListener('change',e=>{const t=e.target;if(t.dataset.gh!==undefined)st.hier=t.checked;if(t.dataset.gi!==undefined)st.iso=t.checked;if(t.dataset.gt)st.types[t.dataset.gt]=t.checked?1:0;if(t.dataset.gc!==undefined){st.center=t.value;$('[data-gd]',el).disabled=!t.value}if(t.dataset.gd!==undefined)st.depth=+t.value;build();setTimeout(fitG,700)},sig);
  el.addEventListener('click',e=>{if(e.target.closest('[data-gfit]'))fitG();const n=e.target.closest('[data-gn]');if(n)go('page:'+n.dataset.gn)},sig);
  const ro=new ResizeObserver(size);ro.observe(cv);size();build();for(let i=0;i<160;i++)step();alpha=.3;fitG();kick();
  return{unmount(){ac.abort();ro.disconnect();cancelAnimationFrame(raf);raf=0},onKey(e){if(e.key==='0'&&!/INPUT|SELECT/.test(document.activeElement?.tagName)){fitG();return true}return false}}}
return{mount}
})();
