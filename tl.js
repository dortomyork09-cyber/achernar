/* Achernar — 타임랩스: 캔버스가 어떻게 자라났는지 다시 보기
   캔버스가 바뀌면 20초마다 작은 기록(카드 위치·종류·앞글자·쓴 사람)을 이 기기에 남겨요. */
const TL=(()=>{
const A=()=>typeof Canvas!=='undefined'?Canvas.api:null;
const MAX=400,EVERY=20000;let lastSig='',busy=false;
const TC={text:'#FFFFFF',sticky:'#FDE68A',node:'#DBEAFE',shape:'#E0E7FF',check:'#DCFCE7',table:'#F1F5F9',chart:'#FCE7F3',doc:'#FFFFFF',link:'#E0F2FE',frame:'rgba(0,0,0,.035)',image:'#E5E7EB',file:'#E5E7EB',flip:'#FEF3C7',dday:'#FEE2E2'};
const key=id=>'tl:'+id;
const strip=h=>{const d=document.createElement('div');d.innerHTML=h||'';return (d.textContent||'').replace(/\s+/g,' ').trim()};
async function load(id){try{return (await tx('kv','readonly',s=>s.get(key(id))))||[]}catch(e){return[]}}
async function store(id,L){try{await tx('kv','readwrite',s=>s.put(L,key(id)))}catch(e){}}
function frame(){const a=A();if(!a||!a.C())return null;const c=a.C();
  const it=(c.items||[]).map(i=>[Math.round(i.x),Math.round(i.y),Math.round(i.w||200),Math.round(i.h||(i.type==='frame'?300:70)),i.type,strip(i.text||i.front||i.title||i.name||'').slice(0,18),i.byn||'',i.c||'']);
  const ln=(c.links||[]).map(l=>[l.a,l.b]).filter(x=>x[0]&&x[1]);const ids=(c.items||[]).map(i=>i.id);
  return{t:Date.now(),it,ln:ln.map(([a,b])=>[ids.indexOf(a),ids.indexOf(b)]).filter(x=>x[0]>=0&&x[1]>=0)}}
async function rec(){if(busy||document.hidden)return;const a=A();if(!a||!a.C())return;const p=One.main();if(!p)return;const f=frame();if(!f)return;
  const sig=JSON.stringify([f.it,f.ln]);if(sig===lastSig)return;busy=true;try{let L=await load(p.id);if(L.length&&JSON.stringify([L[L.length-1].it,L[L.length-1].ln])===sig){lastSig=sig;return}
    L.push(f);if(L.length>MAX)L=L.filter((x,i)=>i%2===0||i>L.length-100);await store(p.id,L);lastSig=sig}finally{busy=false}}
setInterval(rec,EVERY);addEventListener('beforeunload',()=>{rec()});

/* ---------- 보기 ---------- */
const COL=['#2563EB','#DB2777','#059669','#D97706','#7C3AED','#0891B2','#DC2626','#4B5563'];
async function open(){await rec();const p=One.main();const L=await load(p.id);if(L.length<2)return toast('아직 기록이 적어요 · 캔버스를 쓰다 보면 20초마다 쌓여요',{ms:3200});
  const all=L.flatMap(f=>f.it);const x0=Math.min(...all.map(i=>i[0])),y0=Math.min(...all.map(i=>i[1])),x1=Math.max(...all.map(i=>i[0]+i[2])),y1=Math.max(...all.map(i=>i[1]+i[3]));
  const pad=60,VW=x1-x0+pad*2,VH=y1-y0+pad*2;const authors=[...new Set(all.map(i=>i[6]).filter(Boolean))];const ac=n=>COL[authors.indexOf(n)%COL.length];
  modal({title:'타임랩스 · 만들어진 과정',cls:'wide tlm',html:`<div class="tlv"><svg id="tlsvg" viewBox="${x0-pad} ${y0-pad} ${VW} ${VH}" preserveAspectRatio="xMidYMid meet"></svg></div>
    <div class="tlc"><button class="btn pr" id="tlplay">재생</button><input type="range" id="tlr" min="0" max="${L.length-1}" value="0"><span id="tlt"></span></div>
    ${authors.length?`<div class="tla">${authors.map(n=>`<span><i style="background:${ac(n)}"></i>${esc(n)}</span>`).join('')}</div>`:''}
    <p class="note" style="margin:8px 0 0">기록 ${L.length}개 · ${new Date(L[0].t).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit'})}부터. 테두리 색은 처음 만든 사람이에요.</p>`,
    onOpen:()=>{const svg=document.querySelector('#tlsvg'),r=document.querySelector('#tlr'),tt=document.querySelector('#tlt'),pb=document.querySelector('#tlplay');let k=0,timer=0;const fs=Math.max(12,VW/90);
      const show=i=>{const f=L[i];const prev=i?new Set(L[i-1].it.map(x=>x[0]+','+x[1]+','+x[4]+','+x[5])):new Set();
        const ln=f.ln.map(([a,b])=>{const A0=f.it[a],B0=f.it[b];return A0&&B0?`<line x1="${A0[0]+A0[2]/2}" y1="${A0[1]+A0[3]/2}" x2="${B0[0]+B0[2]/2}" y2="${B0[1]+B0[3]/2}" stroke="#A1A1AA" stroke-width="${fs/6}"/>`:''}).join('');
        const sorted=f.it.slice().sort((a,b)=>(a[4]==='frame'?-1:0)-(b[4]==='frame'?-1:0));
        svg.innerHTML=ln+sorted.map(c=>{const nw=!prev.has(c[0]+','+c[1]+','+c[4]+','+c[5]);return `<g class="${nw&&i?'nw':''}"><rect x="${c[0]}" y="${c[1]}" width="${c[2]}" height="${c[3]}" rx="${fs*.6}" fill="${TC[c[4]]||'#fff'}" stroke="${c[6]?ac(c[6]):'#D4D4D8'}" stroke-width="${c[6]?fs/4:fs/8}"/>${c[5]?`<text x="${c[0]+fs*.7}" y="${c[1]+fs*1.5}" font-size="${fs}" fill="#27272A">${esc(c[5])}</text>`:''}</g>`}).join('');
        tt.textContent=new Date(f.t).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit'})+` · 카드 ${f.it.filter(c=>c[4]!=='frame').length}개`;r.value=i;k=i};
      const stop=()=>{clearInterval(timer);timer=0;pb.textContent='재생'};
      pb.onclick=()=>{if(timer)return stop();if(k>=L.length-1)k=0;pb.textContent='멈춤';timer=setInterval(()=>{if(k>=L.length-1)return stop();show(k+1)},Math.max(120,Math.min(600,9000/L.length)))};
      r.oninput=()=>{stop();show(+r.value)};show(0);setTimeout(()=>pb.click(),350);
      const obs=new MutationObserver(()=>{if(!document.body.contains(svg)){stop();obs.disconnect()}});obs.observe(document.body,{childList:true,subtree:true})}})}
return{open,rec,_load:load}})();
