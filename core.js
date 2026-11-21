'use strict';
/* 클립보드: 권한이 막히면 옛 방식으로 한 번 더 */
(()=>{const c=navigator.clipboard;if(!c||!c.writeText)return;const o=c.writeText.bind(c);c.writeText=t=>o(t).catch(e=>{try{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(a);a.select();const ok=document.execCommand('copy');a.remove();if(ok)return}catch(_){}throw e})})();
/* =========================================================
   ULTIMATE NOTE — core: 저장, 라우팅, 사이드바, 홈, 검색, 설정, 패널
   ========================================================= */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const strip=h=>{const d=document.createElement('div');d.innerHTML=String(h||'').replace(/<br\s*\/?>/gi,'\n').replace(/<\/(div|p|li|h\d)>/gi,'\n');return d.textContent.replace(/\n{3,}/g,'\n\n').trim()};
const cl=(v,a,b)=>Math.min(b,Math.max(a,v));
const now=()=>Date.now();
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const kdate=(t=now())=>{const d=new Date(t);return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`};
function ago(t){if(!t)return'';const d=(now()-t)/1000;if(d<45)return'방금';if(d<3600)return Math.floor(d/60)+'분 전';if(d<86400)return Math.floor(d/3600)+'시간 전';if(d<86400*7)return Math.floor(d/86400)+'일 전';const x=new Date(t);return `${x.getFullYear()}.${x.getMonth()+1}.${x.getDate()}`}
const IC={home:'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',page:'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',db:'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',canvas:'M3 3h7v7H3zM14 14h7v7h-7zM14 6.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M10 6.5h4M17.5 10v4M6.5 10v7.5H14',graph:'M4 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0M16 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0M10 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M7 8l4 8M17 8l-4 8M8 6h8',tag:'M3 12V3h9l9 9-9 9zM7.5 7.5h.01',trash:'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',settings:'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3.1 14H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1A2 2 0 1 1 7 4.2l.1.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 20.9 10H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',search:'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14M20 20l-4-4',plus:'M12 5v14M5 12h14',chev:'M9 6l6 6-6 6',down:'M7 10l5 5 5-5',more:'M4.5 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0M17.5 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0',star:'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z',clock:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 7v5l3 2',folder:'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',bolt:'M13 2L4 14h7l-1 8 9-12h-7z',list:'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',olist:'M10 6h10M10 12h10M10 18h10M4 4h1v4M4 10.5a1.2 1.2 0 0 1 2 .8L4 14h2.2M4 16.5h2l-1.2 1.5a1 1 0 1 1-.8 1.8',todo:'M4 5h6v6H4zM5.5 8l1.5 1.5L9.5 6.5M4 14h6v6H4zM13 8h7M13 17h7',toggle:'M8 6l5 4-5 4zM14 18h6M8 18h3',quote:'M7 7h3v5c0 2-1 3-3 4M15 7h3v5c0 2-1 3-3 4',callout:'M4 5h16v11H9l-5 4zM12 8v3M12 13.5h.01',divider:'M3 12h18',code:'M8 8l-5 4 5 4M16 8l5 4-5 4M14 4l-4 16',image:'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01',file:'M6 3h8l4 4v14H6zM14 3v4h4',link:'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1',table:'M4 5h16v14H4zM4 10h16M4 15h16M10 5v14',toc:'M4 6h16M8 12h12M12 18h8',date:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',ai:'M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z',text:'M5 6h14M12 6v13M9 19h6',h1:'M4 6v12M11 6v12M4 12h7M16 10l3-2v10',h2:'M4 6v12M11 6v12M4 12h7M15.5 10a2.5 2.5 0 1 1 4.3 1.7L15.5 18H20',h3:'M4 6v12M11 6v12M4 12h7M15.5 8.5a2 2 0 1 1 2.5 3 2.2 2.2 0 1 1-2.5 3.5',copy:'M8 8h12v12H8zM4 16V4h12',up:'M12 19V5M5 12l7-7 7 7',dn:'M12 5v14M19 12l-7 7-7-7',move:'M5 12h14M13 6l6 6-6 6',color:'M12 3a9 9 0 0 0 0 18c1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1a1.6 1.6 0 0 1 1.2-2.7H17a4 4 0 0 0 4-4c0-4.7-4-8.6-9-8.6zM7.5 11.5h.01M10 7.5h.01M15 7.5h.01',lock:'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',unlock:'M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.5-2',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6',menu:'M4 7h16M4 12h16M4 17h16',x:'M6 6l12 12M18 6L6 18',back:'M15 6l-6 6 6 6',edit:'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',dl:'M12 4v12M7 11l5 5 5-5M5 20h14',ul:'M12 20V8M7 13l5-5 5 5M5 4h14',restore:'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',board:'M4 4h5v16H4zM10.5 4h5v10h-5zM17 4h3v7h-3z',gallery:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',cal:'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2',chart:'M4 20V10M10 20V4M16 20v-8M22 20H2',filter:'M3 5h18l-7 8v6l-4 2v-8z',sort:'M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4',hide:'M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3 3.5M6.6 6.6A17 17 0 0 0 2 12s4 6 10 6c1.7 0 3.2-.5 4.5-1.2',num:'M5 9h14M5 15h14M10 4L8 20M16 4l-2 16',check:'M4 12l5 5L20 6',sel:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M8 12l3 3 5-6',mail:'M3 6h18v12H3zM3 7l9 6 9-6',phone:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',user:'M12 12a4 4 0 1 0 0-8a4 4 0 1 0 0 8M4 21a8 8 0 0 1 16 0',fx:'M9 20c2 0 3-1 3-3V7c0-2 1-3 3-3M7 11h8M15 14l5 5M20 14l-5 5',rel:'M7 7h10v10M7 17L17 7',pen:'M4 20l1-4L16 5l3 3L8 19z',hl:'M9 11l-6 6v3h9l3-3M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4',erase:'M3 17l9-9 6 6-5 5H7zM10 20h11',select:'M5 3l13 7-6 1.5L9.5 18z',sticky:'M4 4h16v10l-6 6H4zM14 20v-6h6',node:'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6M15 11l4-4M15 13l4 4M9 12H3',shape:'M3 3h8v8H3zM14 7a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M7 14l4 7H3zM14 14h7v7h-7z',frame:'M7 3v18M17 3v18M3 7h18M3 17h18',music:'M9 18V5l11-2v13M3 18a3 3 0 1 0 6 0a3 3 0 1 0-6 0M14 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0',video:'M3 6h13v12H3zM16 10l5-3v10l-5-3z',fit:'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',arrow:'M5 12h14M13 6l6 6-6 6',dash:'M3 12h4M10 12h4M17 12h4',bold:'M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z',italic:'M10 4h8M6 20h8M14 4l-4 16',underline:'M7 4v7a5 5 0 0 0 10 0V4M5 20h14',strike:'M5 12h14M16 7a4 3 0 0 0-4-2c-2.5 0-4 1.3-4 3 0 4 8 2.5 8 7 0 1.7-1.8 3-4 3a4.5 3.5 0 0 1-4.5-2.5',mark:'M4 20h16M7 16l9-9-3-3-9 9v3z',sun:'M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',moon:'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',help:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01',layout:'M3 4h18v16H3zM9 4v16',history:'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',info:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 11v6M12 7.5h.01',web:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',archive:'M3 4h18v5H3zM5 9v11h14V9M10 13h4',inbox:'M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5',share:'M4 12v7h16v-7M12 3v12M7 8l5-5 5 5',bell:'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4',obj:'M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12v10M12 12L3 7',drawer:'M3 4h18v6H3zM3 14h18v6H3zM10 7h4M10 17h4',drag:'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01'};
let ic=(n,a='')=>`<svg viewBox="0 0 24 24" ${a}><path d="${IC[n]||IC.page}"/></svg>`;
const TYPES={doc:{n:'노트',i:'page',c:'#2563EB',g:'light-dark(#EFEFFD,#26264A)'},db:{n:'데이터',i:'db',c:'#2B8A3E',g:'light-dark(#EBF5EE,#16301E)'},canvas:{n:'캔버스',i:'canvas',c:'#D9480F',g:'light-dark(#FBF0EA,#3A2416)'},folder:{n:'폴더',i:'folder',c:'#5C6370',g:'light-dark(#F1F3F5,#2A2D33)'}};
const COVERS=['linear-gradient(135deg,#6478E8,#8B5CF6)','linear-gradient(135deg,#22C3E6,#6478E8)','linear-gradient(135deg,#F472B6,#FB923C)','linear-gradient(135deg,#34D399,#22C3E6)','linear-gradient(135deg,#FBBF24,#F97316)','linear-gradient(135deg,#A78BFA,#F472B6)','linear-gradient(135deg,#0EA5E9,#22D3EE)','linear-gradient(135deg,#1F2937,#4B5563)','linear-gradient(135deg,#FDE68A,#FCA5A5)','linear-gradient(135deg,#86EFAC,#FDE68A)','linear-gradient(120deg,#6478E8 0%,#8B5CF6 48%,#22C3E6 100%)','linear-gradient(135deg,#F43F5E,#8B5CF6)'];
const EMOJI='📄 📝 📌 📚 💡 🚀 🎯 📊 🗂️ 🎨 🎵 🎮 🏀 ⚽ 🧠 🌱 🔥 ⭐ ❤️ ✅ 📅 🧪 💼 🏠 ✈️ 🍜 📷 🎬 🛠️ 💬 🔗 🧩 🌙 ☀️ 🌊 🏔️ 🐱 🐶 🦊 🍀 🎁 📦 🔒 🔑 🧭 💰 📈 🗺️ 🎸 🎤 🧾 🏆 👋 🗓️ 📖 🎓 🏢 🤝 🧑‍💻 🌍'.split(' ');
const STATUS0=[{k:'예정',c:'#7A8290'},{k:'진행 중',c:'#2563EB'},{k:'대기',c:'#E8730C'},{k:'완료',c:'#12A150'},{k:'보류',c:'#E5484D'}];
const PRIO=[{k:'낮음',c:'#7A8290'},{k:'보통',c:'#2563EB'},{k:'높음',c:'#E5484D'}];
const TAGC=['#6478E8','#10B981','#F59E0B','#EC4899','#8B5CF6','#06B6D4','#E8730C','#E5484D','#64748B'];
const tagColor=t=>{let h=0;for(const c of String(t))h=(h*31+c.charCodeAt(0))>>>0;return TAGC[h%TAGC.length]};

/* ---------- 상태 ---------- */
let S=null,V={},IDB=null,DL=null,AI=null,VIEW=null,route='home',hist=[],hp=-1;
const blobs={};const ui={allType:'all',sort:'upd',mode:'grid',msel:new Set(),ptab:'pages',lastSel:null};
const defSettings=()=>({theme:'light',lang:'ko',start:'last',accent:'#2563EB',font:'sans',fs:16,width:'normal',anim:true,sideW:260,panelW:300,side:true,panel:false,sideItems:{home:1,quick:1,recent:1,favs:1,all:1,shared:1,trash:1,tags:1,graph:1,linked:1,archive:1},statuses:STATUS0.map(s=>({...s})),aiOk:false,presets:[],one:1,simple:1,mods:{graph:1,ai:1,peek:1,remind:1,walk:0,pen:1,sync:1},keys:{}});
function freshState(){return{v:1,ws:'내 워크스페이스',pages:{},open:{},recent:[],recentQ:[],tpls:[],settings:defSettings()}}

/* ---------- 저장소 ---------- */
function idbOpen(){return new Promise(r=>{try{const q=indexedDB.open('ultimate-note',1);q.onupgradeneeded=()=>{q.result.createObjectStore('kv');q.result.createObjectStore('blobs')};q.onsuccess=()=>{IDB=q.result;r()};q.onerror=()=>r()}catch(e){r()}})}
function tx(store,mode,fn){return new Promise(r=>{if(!IDB)return r(null);try{const t=IDB.transaction(store,mode);const q=fn(t.objectStore(store));t.oncomplete=()=>r(q?q.result:true);t.onerror=()=>r(null);t.onabort=()=>r(null)}catch(e){r(null)}})}
let saveT=null,saveState='saved',lastSaved=0;
function save(){(typeof Sync!=='undefined'&&Sync.mark());setSave('busy');clearTimeout(saveT);saveT=setTimeout(flush,350)}
async function flush(){clearTimeout(saveT);let ok=await tx('kv','readwrite',s=>s.put(JSON.stringify(S),'state'));
  if(ok===null){try{localStorage.setItem('un-fallback',JSON.stringify(S));ok='ls'}catch(e){}}
  lastSaved=now();setSave(ok===null?'bad':ok==='ls'?'ls':'ok')}
function setSave(st){saveState=st;const t={busy:'저장 중…',ok:'저장됨',ls:'임시 저장됨',bad:'저장 실패'}[st];const e=$('#saveSt');if(e)e.textContent=t;const f=$('#sideFoot .dot');if(f){f.className='dot'+(st==='busy'?' busy':st==='bad'?' bad':'');$('#sideFoot .sst').textContent=st==='bad'?'저장 실패 — 백업을 받아 두세요':st==='busy'?'저장 중…':st==='ls'?'임시 저장소에 보관 중':'이 기기에 저장됨'}}
async function putBlob(file){const id=uid();blobs[id]={url:URL.createObjectURL(file),name:file.name||'파일',type:file.type||'',size:file.size||0};await tx('blobs','readwrite',s=>s.put(file,id));setTimeout(()=>(typeof Sync!=='undefined'&&Sync.up(id)),50);return id}
const burl=id=>blobs[id]?.url||(S?.assets?.[id]?'/_blob/'+S.assets[id]:'');
let verT={},verDirty={};
function snapVersion(p,label=''){if(!p||p.trash)return;const data=JSON.stringify(content(p));const list=V[p.id]||(V[p.id]=[]);if(list.length&&list[0].data===data)return;list.unshift({t:now(),title:p.title,data,label});if(list.length>40)list.length=40;verDirty[p.id]=0;tx('kv','readwrite',s=>s.put(JSON.stringify(V),'versions'))}
function schedVersion(p){verDirty[p.id]=1;clearTimeout(verT[p.id]);verT[p.id]=setTimeout(()=>snapVersion(p),25000)}
const content=p=>p.type==='doc'?{blocks:p.blocks}:p.type==='db'?{db:p.db}:p.type==='canvas'?{cv:{...p.cv,view:null}}:{};

/* ---------- 페이지 ---------- */
const P=id=>S.pages[id];
const live=()=>Object.values(S.pages).filter(p=>!p.trash);
const kids=id=>live().filter(p=>p.parent===id&&!p.archived&&!p.objOf).sort((a,b)=>a.order-b.order);
function ancestors(p){const a=[];let c=p,g=0;while(c&&c.parent&&g++<60){c=P(c.parent);if(c)a.unshift(c)}return a}
function isDesc(id,anc){let c=P(id),g=0;while(c&&g++<80){if(c.parent===anc)return true;c=P(c.parent)}return false}
const nextOrder=par=>Math.max(0,...Object.values(S.pages).filter(p=>p.parent===par).map(p=>p.order||0))+1;
const B=(type,html='',x={})=>({id:uid(),type,html,...x});
function newPage(type,o={}){const p={id:uid(),type,title:o.title??'',icon:o.icon??'',cover:o.cover??null,parent:o.parent??null,order:nextOrder(o.parent??null),fav:false,trash:false,archived:false,tags:o.tags||[],status:o.status||'',prio:'',created:now(),updated:now()};
  if(type==='doc')p.blocks=o.blocks||[B('p')];
  if(type==='db')p.db=o.db||DBV.make('blank');
  if(type==='canvas')p.cv=o.cv||Canvas.make('blank');
  S.pages[p.id]=p;if(p.parent)S.open[p.parent]=true;save();return p}
function touch(p,{meta=true}={}){p.updated=now();save();schedVersion(p);if(meta){const m=$('.pmeta');if(m&&curPage()?.id===p.id)m.textContent='수정 '+ago(p.updated)}}
const curPage=()=>route.startsWith('page:')?P(route.slice(5)):null;
const pIcon=(p,big)=>p.icon?`<span class="emj">${p.icon}</span>`:ic(TYPES[p.type]?.i||'page');
const pTitle=p=>p?.title||'제목 없음';
function create(type,o={}){const par=o.parent!==undefined?o.parent:null;const p=newPage(type,{...o,parent:par});go('page:'+p.id);renderSide();
  if(type==='doc'||type==='folder'||type==='db')requestAnimationFrame(()=>{const t=$('.ptitle');if(t&&!p.title){t.focus()}});return p}
function quickNote(){const d=new Date();create('doc',{title:`빠른 메모 ${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,icon:'⚡',tags:['빠른 메모']});requestAnimationFrame(()=>Editor.focusFirst?.())}
function trashPage(id){const p=P(id);if(!p)return;const t=now();const mark=x=>{x.trash=true;x.trashedAt=t;x.trashRoot=id;live().filter(c=>c.parent===x.id).forEach(mark)};mark(p);ui.msel.delete(id);save();
  toast(`‘${pTitle(p)}’을 휴지통으로 옮겼어요`,{act:'되돌리기',fn:()=>restorePage(id)});if(curPage()&&curPage().trash)go('home');else{renderSide();if(route==='home'||route.startsWith('all')||route==='recent'||route==='favs')render()}}
function restorePage(id){const p=P(id);if(!p)return;Object.values(S.pages).filter(x=>x.trashRoot===id).forEach(x=>{x.trash=false;delete x.trashRoot;delete x.trashedAt});p.trash=false;if(p.parent&&(!P(p.parent)||P(p.parent).trash))p.parent=null;save();renderSide();render();toast('복원했어요')}
function purgePage(id){const all=[id];const walk=x=>Object.values(S.pages).filter(c=>c.parent===x).forEach(c=>{all.push(c.id);walk(c.id)});walk(id);all.forEach(i=>{delete S.pages[i];delete V[i]});S.recent=S.recent.filter(i=>S.pages[i]);save();tx('kv','readwrite',s=>s.put(JSON.stringify(V),'versions'))}
function dupPage(id,par){const p=P(id);const c=JSON.parse(JSON.stringify(p));c.id=uid();c.title=(p.title||'제목 없음')+(par===undefined?' (사본)':'');c.parent=par===undefined?p.parent:par;c.order=par===undefined?p.order+.5:nextOrder(c.parent);c.created=c.updated=now();c.fav=false;
  if(c.blocks)c.blocks.forEach(b=>b.id=uid());S.pages[c.id]=c;kids(id).forEach(k=>dupPage(k.id,c.id));if(par===undefined){reorder(c.parent);save();renderSide();toast('복제했어요',{act:'열기',fn:()=>go('page:'+c.id)})}return c}
function reorder(par){kids(par).forEach((k,i)=>k.order=i+1)}
function movePage(id,par,before){const p=P(id);if(!p||id===par||(par&&isDesc(par,id)))return false;p.parent=par;const sib=kids(par).filter(x=>x.id!==id);let i=before?sib.findIndex(x=>x.id===before):sib.length;if(i<0)i=sib.length;sib.splice(i,0,p);sib.forEach((x,j)=>x.order=j+1);if(par)S.open[par]=true;p.updated=now();save();return true}
function addRecent(id){S.recent=[id,...S.recent.filter(x=>x!==id)].slice(0,30)}
function allTags(){const m={};live().forEach(p=>(p.tags||[]).forEach(t=>m[t]=(m[t]||0)+1));return m}
function pageText(p){let t=p.title+' '+(p.tags||[]).join(' ');if(p.type==='doc')t+=' '+Editor.text(p);if(p.type==='db')t+=' '+DBV.text(p);if(p.type==='canvas')t+=' '+Canvas.text(p);return t}
function linksFrom(p){const ids=new Set();const scan=h=>String(h||'').replace(/data-page="([^"]+)"/g,(_,i)=>{ids.add(i);return''});
  if(p.type==='doc')p.blocks.forEach(b=>{scan(b.html);scan(b.body);if(b.type==='page'&&b.page)ids.add(b.page)});
  if(p.type==='canvas')p.cv.items.forEach(i=>{if(i.type==='page'&&i.page)ids.add(i.page);scan(i.text)});
  if(p.type==='db')p.db.rows.forEach(r=>scan(r.note));
  if(p.objOf&&DBV.objLinks)try{DBV.objLinks(p).forEach(i=>ids.add(i))}catch(e){}
  ids.delete(p.id);return[...ids].filter(i=>P(i)&&!P(i).trash)}
const backlinks=id=>live().filter(p=>p.id!==id&&linksFrom(p).includes(id));
function resolveTitle(t){t=String(t).trim().toLowerCase();return live().find(p=>(p.title||'').toLowerCase()===t)}
function coverCSS(c){if(!c)return'';if(c.img)return `background-image:url(${burl(c.img)})`;return `background:${COVERS[c.g||0]}`}

/* ---------- 라우팅 ---------- */
function go(r,{push=true}={}){closeMenu();if(push){hist=hist.slice(0,hp+1);if(hist[hp]!==r){hist.push(r);hp=hist.length-1}}route=r;S.lastRoute=r;save();document.body.classList.remove('drawer');if(S.settings.side){S.settings.side=false;applySettings()}render()}
function back(){if(hp>0){hp--;route=hist[hp];S.lastRoute=route;save();render()}}
function fwd(){if(hp<hist.length-1){hp++;route=hist[hp];S.lastRoute=route;save();render()}}
function render(){const prev=VIEW;VIEW=null;try{prev?.unmount?.()}catch(e){}
  const old=curPageId;curPageId=null;if(old&&P(old)&&verDirty[old])snapVersion(P(old));
  closeMenu();hidePop();const m=$('#main');m.className='';m.onclick=null;m.oncontextmenu=null;m.scrollTop=0;m.innerHTML='';
  const[k,arg]=[route.split(':')[0],route.slice(route.indexOf(':')+1)];
  try{
    if(k==='page'){const p=P(arg);if(!p)vMissing();else if(p.trash)vTrashed(p);else{curPageId=p.id;addRecent(p.id);openPage(p)}}
    else if(k==='all')vAll(route.includes(':')?arg:'all');
    else if(k==='recent')vAll('recent');else if(k==='favs')vAll('favs');else if(k==='archive')vAll('archive');else if(k==='linked')vAll('linked');
    else if(k==='trash')vTrash();else if(k==='tags')vTags();else if(k==='tag')vTag(arg);
    else if(k==='graph'){m.className='full';VIEW=Graph.mount(m,{})}
    else if(k==='objects')vObjects();else if(k==='kind')vKind(arg);else if(k==='media')vMedia();else if(k==='lab')vLab();else if(k==='memory')vMemory();else if(k==='shared')vShared();
    else vHome();
  }catch(e){console.error(e);m.innerHTML=`<div class="wrap"><div class="empty"><b>화면을 그리다 문제가 생겼어요</b>${esc(e.message)}</div></div>`}
  renderSide();crumbs();railActive();renderPanel();renderRibbon();try{Remind.badge();MS.after()}catch(e){console.warn(e)}document.body.dataset.view=k==='page'?(P(arg)?.type||'x'):k;
  $('#backBtn').disabled=hp<=0;$('#fwdBtn').disabled=hp>=hist.length-1;
  const cp=curPage();$('#pageMenuBtn').disabled=!cp;$('#panelBtn').disabled=false}
let curPageId=null;
function crumbs(){const c=$('#crumbs');const cp=curPage();let h=`<button data-go="home">${esc(S.ws)}</button>`;
  if(cp){ancestors(cp).forEach(a=>h+=`<span class="sl">/</span><button data-go="page:${a.id}">${a.icon?a.icon+' ':''}${esc(pTitle(a))}</button>`);h+=`<span class="sl">/</span><button data-go="page:${cp.id}" class="cur">${cp.icon?cp.icon+' ':''}${esc(pTitle(cp))}</button>`}
  else{const lab={home:'홈',all:'모든 페이지','all:doc':'문서','all:db':'데이터베이스','all:canvas':'캔버스','all:folder':'폴더',recent:'최근 열어본 문서',favs:'즐겨찾기',trash:'휴지통',tags:'태그',graph:'그래프 뷰',archive:'아카이브',linked:'링크된 문서'}[route]||(route.startsWith('tag:')?'#'+route.slice(4):'')||MS.label(route);if(lab&&route!=='home')h+=`<span class="sl">/</span><button>${esc(lab)}</button>`}
  c.innerHTML=h}
const RAIL=[['home','홈','home'],['drawer','서랍','drawer'],['graph','그래프','graph']];const RAIL_OLD=[['db','데이터','db'],['canvas','캔버스','canvas'],['graph','그래프','graph'],['tags','태그','tag'],['trash','휴지통','trash']];
function railActive(){const cp=curPage();const k=route==='home'?'home':route==='graph'?'graph':route==='trash'?'trash':route.startsWith('tag')?'tags':route==='objects'||cp?.objOf?'objects':route==='all:db'||cp?.type==='db'?'db':route==='all:canvas'||cp?.type==='canvas'?'canvas':(route.startsWith('all')||cp||['recent','favs','archive','linked'].includes(route))?'pages':'';$$('#railList .ritem').forEach(b=>b.classList.toggle('on',b.dataset.rail===k))}

/* ---------- 사이드바 ---------- */
function rowHTML(p,d,flat){const ks=flat?[]:kids(p.id);const open=!!S.open[p.id];const on=curPage()?.id===p.id;
  return `<div class="tr${on?' on':''}${ui.msel.has(p.id)?' msel':''}" data-id="${p.id}" style="--d:${d}" draggable="true" title="${esc(pTitle(p))}">${flat?'':`<button class="tw${ks.length?'':' leaf'}${open?' open':''}" data-tw aria-label="펼치기">${ic('chev')}</button>`}<span class="ti" style="${p.tint?`background:${p.tint}22;color:${p.tint}`:''}">${pIcon(p)}</span><span class="tt">${esc(pTitle(p))}</span><button class="tb" data-tm aria-label="메뉴">${ic('more')}</button>${p.type!=='canvas'?`<button class="tb" data-ta aria-label="하위 페이지 추가">${ic('plus')}</button>`:''}</div>`+(open&&ks.length?ks.map(k=>rowHTML(k,d+1)).join(''):'')}
function renderSide(){const b=$('#sideBody');if(!b)return;const si=S.settings.sideItems,favs=live().filter(p=>p.fav&&!p.archived).sort((a,c)=>a.order-c.order),roots=kids(null),tc=Object.values(S.pages).filter(p=>p.trash&&p.trashRoot===p.id).length;
  const qa=(k,r,i,n,extra='')=>si[k]?`<button class="qa${route===r?' on':''}" ${r.startsWith('@')?`data-a="${r.slice(1)}"`:`data-go="${r}"`}>${ic(i)}${n}${extra}</button>`:'';
  let h=`<div class="sec" style="margin-top:2px">${qa('home','home','home','홈')}${qa('quick','@quick','bolt','빠른 메모')}${qa('recent','recent','clock','최근 열어본 문서')}${qa('favs','favs','star','즐겨찾기')}${qa('all','all','grid','모든 메모')}${qa('shared','shared','share','공유된 문서')}${qa('all','objects','obj','객체')}${qa('trash','trash','trash','휴지통',tc?`<span class="cnt">${tc}</span>`:'')}</div>`;
  if(ui.msel.size)h+=`<div class="bulk"><b>${ui.msel.size}개 선택</b><button class="btn sm ghost" data-a="bmove">이동</button><button class="btn sm ghost" data-a="bfav">즐겨찾기</button><button class="btn sm dg" data-a="btrash">휴지통</button><button class="ib sm" data-a="bclear" aria-label="선택 해제">${ic('x')}</button></div>`;
  if(favs.length)h+=`<div class="sec"><div class="sech">즐겨찾기</div><div class="tree">${favs.map(p=>rowHTML(p,0,true)).join('')}</div></div>`;
  h+=`<div class="sec"><div class="sech" data-droproot>내 문서<span style="display:flex;gap:2px"><button data-a="newfolder" title="새 폴더 (Ctrl+Shift+N)" aria-label="새 폴더">${ic('folder')}</button><button data-a="newdoc" title="새 문서 (Ctrl+N)" aria-label="새 문서">${ic('plus')}</button></span></div><div class="tree" id="tree">${roots.map(p=>rowHTML(p,0)).join('')||'<div class="empty-s">아직 문서가 없어요</div>'}</div></div>`;
  h+=`<div class="sec"><div class="sech">지식 관리</div>${qa('tags','tags','tag','태그')}${qa('graph','graph','graph','그래프 뷰')}${qa('linked','linked','link','링크된 문서')}${qa('archive','archive','archive','아카이브')}</div>`;
  b.innerHTML=h;$('#wsName').textContent=S.ws}
function renderFoot(){const f=$('#sideFoot');f.innerHTML=`<div class="row"><span class="dot"></span><span class="sst">이 기기에 저장됨</span></div><div class="row" id="stor">저장 공간 계산 중…</div><div class="row"><button class="qa" style="height:30px;padding:0 6px" data-a="help">${ic('help')}도움말 · 단축키</button></div>`;setSave(saveState);
  if(navigator.storage?.estimate)navigator.storage.estimate().then(e=>{$('#stor').textContent=`저장 공간 ${(e.usage/1048576).toFixed(1)}MB 사용`}).catch(()=>$('#stor').textContent='');else $('#stor').textContent=''}
function visibleRows(){return $$('#tree .tr').map(r=>r.dataset.id)}
function sideClick(e){const a=e.target.closest('[data-a]');if(a){sideAction(a.dataset.a);return}
  const g=e.target.closest('[data-go]');if(g){go(g.dataset.go);return}
  const row=e.target.closest('.tr');if(!row)return;const id=row.dataset.id;
  if(e.target.closest('[data-tw]')){S.open[id]=!S.open[id];save();renderSide();return}
  if(e.target.closest('[data-tm]')){const r=e.target.closest('[data-tm]').getBoundingClientRect();pageMenu(P(id),r.left,r.bottom+4);return}
  if(e.target.closest('[data-ta]')){const r=e.target.closest('[data-ta]').getBoundingClientRect();menu(r.left,r.bottom+4,newItems(id));return}
  if(e.ctrlKey||e.metaKey){ui.msel.has(id)?ui.msel.delete(id):ui.msel.add(id);ui.lastSel=id;renderSide();return}
  if(e.shiftKey&&ui.lastSel){const v=visibleRows(),a2=v.indexOf(ui.lastSel),b2=v.indexOf(id);if(a2>=0&&b2>=0){v.slice(Math.min(a2,b2),Math.max(a2,b2)+1).forEach(x=>ui.msel.add(x));renderSide();return}}
  ui.msel.clear();ui.lastSel=id;go('page:'+id)}
function sideAction(a){const sel=[...ui.msel];
  if(a==='quick')return quickNote();if(a==='newdoc')return create('doc');if(a==='newfolder')return create('folder',{title:'새 폴더',icon:'📁'});if(a==='help')return showKeys();
  if(a==='bclear'){ui.msel.clear();return renderSide()}
  if(a==='bfav'){sel.forEach(i=>P(i).fav=true);save();ui.msel.clear();renderSide();return toast(`${sel.length}개를 즐겨찾기에 넣었어요`)}
  if(a==='btrash'){sel.forEach(i=>{if(P(i)&&!P(i).trash)trashPage(i)});ui.msel.clear();return renderSide()}
  if(a==='bmove'){pickPage('어디로 옮길까요?',{root:true,exclude:sel}).then(t=>{if(t===undefined)return;let n=0;sel.forEach(i=>{if(movePage(i,t))n++});ui.msel.clear();renderSide();render();toast(`${n}개를 옮겼어요`)})}}
let dragIds=[];
function sideDnD(){const b=$('#sideBody');
  b.addEventListener('dragstart',e=>{const r=e.target.closest('.tr');if(!r)return;const id=r.dataset.id;dragIds=ui.msel.has(id)?[...ui.msel]:[id];e.dataTransfer.setData('text/plain',id);e.dataTransfer.setData('application/x-un-page',id);e.dataTransfer.effectAllowed='move'});
  b.addEventListener('dragover',e=>{const r=e.target.closest('.tr'),root=e.target.closest('[data-droproot]');if(!dragIds.length)return;e.preventDefault();$$('.dz-in,.dz-a,.dz-b',b).forEach(x=>x.classList.remove('dz-in','dz-a','dz-b'));
    if(r){const rc=r.getBoundingClientRect(),y=(e.clientY-rc.top)/rc.height;r.classList.add(y<.28?'dz-b':y>.72?'dz-a':'dz-in')}else if(root)root.classList.add('dz-in')});
  b.addEventListener('dragleave',e=>{if(!b.contains(e.relatedTarget))$$('.dz-in,.dz-a,.dz-b',b).forEach(x=>x.classList.remove('dz-in','dz-a','dz-b'))});
  b.addEventListener('drop',e=>{const r=e.target.closest('.tr'),root=e.target.closest('[data-droproot]');e.preventDefault();const z=r?(r.classList.contains('dz-b')?'b':r.classList.contains('dz-a')?'a':'in'):'root';$$('.dz-in,.dz-a,.dz-b',b).forEach(x=>x.classList.remove('dz-in','dz-a','dz-b'));
    let ok=0;if(r){const t=P(r.dataset.id);dragIds.forEach(id=>{if(id===t.id)return;if(z==='in'){if(movePage(id,t.id))ok++}else{const sib=kids(t.parent);const idx=sib.findIndex(x=>x.id===t.id);const before=z==='b'?t.id:sib[idx+1]?.id;if(movePage(id,t.parent,before))ok++}})}
    else if(root)dragIds.forEach(id=>{if(movePage(id,null))ok++});
    if(dragIds.length&&!ok)toast('그 위치로는 옮길 수 없어요');dragIds=[];ui.msel.clear();renderSide();crumbs()});
  b.addEventListener('dragend',()=>{dragIds=[]});
  b.addEventListener('dblclick',e=>{const r=e.target.closest('.tr .tt');if(!r)return;renameInline(r.closest('.tr').dataset.id)});
  b.addEventListener('contextmenu',e=>{const r=e.target.closest('.tr');if(!r)return;e.preventDefault();pageMenu(P(r.dataset.id),e.clientX,e.clientY)})}
function renameInline(id){const row=$(`#sideBody .tr[data-id="${id}"] .tt`);if(!row)return renamePage(id);const p=P(id);row.innerHTML=`<input value="${esc(p.title)}" aria-label="이름">`;const i=row.firstChild;i.focus();i.select();
  const done=ok=>{if(ok){p.title=i.value.trim();touch(p);updTitle(p)}renderSide()};i.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();done(true)}if(e.key==='Escape')done(false)};i.onblur=()=>done(true)}
function renamePage(id){const p=P(id);ask('이름 바꾸기',{val:p.title}).then(v=>{if(v===null)return;p.title=v;touch(p);updTitle(p);renderSide()})}
function updTitle(p){crumbs();const t=$('.ptitle');if(t&&curPage()?.id===p.id&&document.activeElement!==t)t.textContent=p.title;$$(`#sideBody .tr[data-id="${p.id}"] .tt`).forEach(e=>{if(!e.querySelector('input'))e.textContent=pTitle(p)});$$(`a.pl[data-page="${p.id}"]:not(.al)`).forEach(a=>a.textContent=pTitle(p))}
const newItems=par=>[{t:'문서',i:'page',fn:()=>create('doc',{parent:par})},{t:'데이터베이스',i:'db',fn:()=>create('db',{parent:par,title:'새 데이터베이스'})},{t:'캔버스',i:'canvas',fn:()=>create('canvas',{parent:par,title:'새 캔버스'})},{t:'폴더',i:'folder',fn:()=>create('folder',{parent:par,title:'새 폴더',icon:'📁'})},'-',{t:'템플릿에서…',i:'gallery',fn:()=>openTemplates(par)}];
function pageMenu(p,x,y){if(!p)return;const lock=!!p.lock;menu(x,y,[
  {t:'열기',i:'eye',fn:()=>go('page:'+p.id)},
  ...(p.type!=='canvas'?[{t:'하위 페이지 추가',i:'plus',sub:newItems(p.id)}]:[]),
  '-',{t:'이름 바꾸기',i:'edit',k:'더블클릭',fn:()=>renameInline(p.id)},{t:'아이콘 바꾸기',i:'star',fn:()=>iconPicker(p)},
  {colors:[{k:'',v:'transparent',n:'없음'},...TAGC.map(c=>({k:c,v:c}))],cur:p.tint||'',fn:c=>{p.tint=c||'';touch(p);renderSide()}},
  {t:p.fav?'즐겨찾기 해제':'즐겨찾기',i:'star',fn:()=>{p.fav=!p.fav;save();renderSide();if(route==='home')render()}},
  {t:'복제',i:'copy',fn:()=>dupPage(p.id)},{t:'이동…',i:'move',fn:()=>pickPage(`‘${pTitle(p)}’을 어디로 옮길까요?`,{root:true,exclude:[p.id]}).then(t=>{if(t===undefined)return;if(movePage(p.id,t)){renderSide();crumbs();toast('옮겼어요')}else toast('그 위치로는 옮길 수 없어요')})},
  {t:lock?'잠금 해제':'편집 잠금',i:lock?'unlock':'lock',fn:()=>{p.lock=!lock;save();if(curPage()?.id===p.id)render();toast(p.lock?'이 페이지는 읽기 전용이에요':'다시 편집할 수 있어요')}},
  {t:p.archived?'아카이브에서 꺼내기':'아카이브로 보내기',i:'archive',fn:()=>{p.archived=!p.archived;save();renderSide();toast(p.archived?'아카이브로 보냈어요':'다시 꺼냈어요')}},
  {t:'내보내기',i:'dl',fn:()=>{const b=$('#expBtn');MS.exportMenu(b&&b.offsetParent?b:$('#pageMenuBtn'))}},{t:'분위기 모드 바꾸기',i:'sun',fn:()=>MS2.mood()},{t:S.settings.simple!==0?'모든 도구 보기 (간단 모드 끄기)':'간단 모드 켜기',i:'layout',fn:()=>{S.settings.simple=S.settings.simple!==0?0:1;applySettings();save();render()}},'-',
  ...(p.type==='db'?[{t:'🧰 도구 카드로 내보내기',i:'dl',fn:()=>MS2.exportTool(p)}]:[]),...(p.kind==='story'&&p.type==='db'?[{t:'🗺 분기 지도 그리기',i:'graph',fn:()=>MS2.storyMap(p)}]:[]),
  ...(p.type==='doc'?[{t:'마인드맵으로 펼치기',i:'node',fn:()=>{const c=newPage('canvas',{title:pTitle(p)+' 마인드맵',icon:'🧠',parent:p.parent,cv:Canvas.fromDoc(p)});go('page:'+c.id);toast('제목과 목록을 가지로 펼쳤어요')}}]:[]),
  {t:'옆에 펼쳐 보기',i:'layout',fn:()=>{ui.sideId=p.id;ui.ptab='side';togglePanel(true)}},
  {t:p.sharedAt?'공유 멈추기':'공유하기 (beta)',i:'share',fn:()=>p.sharedAt?Sync.unshare(p):Sync.share(p)},
  {t:'템플릿으로 저장',i:'gallery',fn:()=>saveAsTemplate(p)},{t:'마크다운으로 내보내기',i:'dl',fn:()=>exportMD(p)},
  '-',{t:'휴지통으로',i:'trash',dg:1,fn:()=>trashPage(p.id)}])}

/* ---------- 메뉴 ---------- */
let MENU=null;
function menu(x,y,items,o={}){const m=$('#menu');MENU={items,x,y,o,stack:o.stack||[],act:-1};m.innerHTML=menuHTML(items,MENU.stack.length);const was=!m.hidden;m.hidden=false;m.scrollTop=0;place(m,x,y);const d=o.dir||(was?'':'open');m.classList.remove('mv-open','mv-fwd','mv-back');if(d){void m.offsetWidth;m.classList.add('mv-'+d)}}
function menuHTML(items,back){return(back?`<button class="mi" data-mi="back">${ic('back')}뒤로</button><div class="msep"></div>`:'')+items.map((it,i)=>{if(!it)return'';if(it==='-')return'<div class="msep"></div>';if(it.h)return`<div class="mh">${esc(it.h)}</div>`;
  if(it.colors)return`<div class="mcol">${it.colors.map(c=>`<button class="swt${c.k===it.cur?' on':''}" data-mi="${i}" data-c="${esc(c.k)}" style="--v:${c.v}" title="${esc(c.n||'')}" aria-label="${esc(c.n||'색')}"></button>`).join('')}</div>`;
  return`<button class="mi${it.dg?' dg':''}${it.ai?' ai':''}" role="menuitem" data-mi="${i}" ${it.dis?`disabled title="${esc(typeof it.dis==='string'?it.dis:'')}"`:''}>${it.em?`<span class="em">${it.em}</span>`:it.i?ic(it.i):'<span class="em"></span>'}<span style="overflow:hidden;text-overflow:ellipsis">${esc(String(it.t).replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+(?=[^\p{Extended_Pictographic}\uFE0F\u200D\s])/u,''))}</span>${it.on?'<span class="ck">✓</span>':''}${it.sub?'<small>›</small>':it.k?`<span class="k">${esc(it.k)}</span>`:it.s?`<small>${esc(it.s)}</small>`:''}</button>`}).join('')}
function place(el,x,y){const w=el.offsetWidth,h=el.offsetHeight;el.style.left=cl(x,6,innerWidth-w-6)+'px';el.style.top=(y+h>innerHeight-6?Math.max(6,y-h-8):y)+'px'}
function closeMenu(){const m=$('#menu');MENU=null;if(m.hidden)return;ghostOut(m,'mnghost');m.hidden=true}
function menuClick(e){const b=e.target.closest('[data-mi]');if(!b||!MENU)return;const k=b.dataset.mi;
  if(k==='back'){const s=MENU.stack.pop();return menu(MENU.x,MENU.y,s,{...MENU.o,stack:MENU.stack,subFn:null,dir:'back'})}
  const it=MENU.items[+k];if(!it)return;if(it.sub){const st=[...MENU.stack,MENU.items];return menu(MENU.x,MENU.y,typeof it.sub==='function'?it.sub():it.sub,{...MENU.o,stack:st,subFn:typeof it.sub==='function'?it.sub:null,dir:'fwd'})}
  if(it.colors){const c=b.dataset.c;closeMenu();return it.fn(c)}if(it.keep){it.fn?.();const f=MENU.o.subFn;return menu(MENU.x,MENU.y,f?f():MENU.items,{...MENU.o,stack:MENU.stack})}closeMenu();it.fn?.()}
function menuKey(e){const bs=$$('#menu .mi:not(:disabled)');if(!bs.length)return false;let i=bs.indexOf(document.activeElement);
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();i=e.key==='ArrowDown'?(i+1)%bs.length:(i-1+bs.length)%bs.length;bs[i].focus();return true}
  if(e.key==='Escape'){closeMenu();return true}return false}

/* ---------- 모달 / 토스트 ---------- */
let MOD=null;
function modal({title='',html='',btns=[],cls='',onOpen,onClose}={}){const box=$('#modal .mbox');box.className='mbox '+cls;$('#mbody').style.padding='';$('#mhead').innerHTML=title?`<h3>${esc(title)}</h3><button class="ib sm" data-x aria-label="닫기">${ic('x')}</button>`:'';$('#mbody').innerHTML=html;
  $('#mact').innerHTML=btns.map((b,i)=>`<button class="btn ${b.cls||'ghost'}" data-bi="${i}">${esc(b.t)}</button>`).join('');$('#modal').hidden=false;MOD={btns,onClose};closeMenu();(onOpen||(()=>$('#mact .btn:last-child')?.focus()))()}
function ghostOut(el,cls){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;try{const g=el.cloneNode(true);g.setAttribute('aria-hidden','true');g.classList.add(cls);g.style.pointerEvents='none';el.after(g);setTimeout(()=>g.remove(),170)}catch(e){}}
function closeModal(v){const m=$('#modal');if(m.hidden)return;ghostOut(m,'mghost');m.hidden=true;const f=MOD?.onClose;MOD=null;f?.(v)}
function ask(title,{sub='',val='',ph='',multi=false,ok='확인'}={}){return new Promise(res=>{let done=false;const fin=v=>{if(!done){done=true;res(v)}};
  modal({title,html:`${sub?`<p class="note" style="margin:0 0 10px">${esc(sub)}</p>`:''}${multi?`<textarea id="askin" class="inp" placeholder="${esc(ph)}">${esc(val)}</textarea>`:`<input id="askin" class="inp" value="${esc(val)}" placeholder="${esc(ph)}">`}`,
    btns:[{t:'취소',fn:()=>fin(null)},{t:ok,cls:'pr',fn:()=>fin($('#askin').value.trim())}],onClose:()=>fin(null),
    onOpen:()=>{const i=$('#askin');i.focus();if(!multi)i.select();i.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing&&(!multi||e.ctrlKey||e.metaKey)){e.preventDefault();fin(i.value.trim());closeModal()}}}})})}
function confirmDlg(title,msg,ok='확인',danger){return new Promise(res=>{let d=false;const fin=v=>{if(!d){d=true;res(v)}};modal({title,html:`<p style="margin:0">${msg}</p>`,btns:[{t:'취소',fn:()=>fin(false)},{t:ok,cls:danger?'dg':'pr',fn:()=>fin(true)}],onClose:()=>fin(false)})})}
let toastT;function toast(msg,o={}){const t=$('#toast');t.innerHTML=`<span>${esc(msg)}</span>${o.act?`<button>${esc(o.act)}</button>`:''}`;t.hidden=false;if(o.act)t.querySelector('button').onclick=()=>{t.hidden=true;o.fn()};clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,o.ms||(o.act?6000:2600))}
function hidePop(){$('#pop').hidden=true}
function pickFile(accept='',multiple=false){return new Promise(res=>{const f=$('#fileIn');f.accept=accept;f.multiple=multiple;f.value='';f.onchange=()=>res([...f.files]);f.click()})}
async function saveFile(name,data){if(DL){try{await DL.save({filename:name,data});return toast('저장했어요: '+name)}catch(e){if(e?.code==='declined')return toast('저장을 취소했어요');if(e?.code==='rate_limited')return toast('잠시 후 다시 시도해 주세요')}}
  if(typeof data==='string')modal({title:'아래 내용을 복사하세요',cls:'mid',html:`<p class="note">이 화면에서는 파일 저장이 막혀 있어요. 내용을 복사해 메모장 등에 붙여넣어 저장하세요.</p><textarea class="inp" style="height:300px;font:13px/1.5 var(--mono)" readonly>${esc(data)}</textarea>`,btns:[{t:'복사',cls:'pr',fn:()=>{navigator.clipboard?.writeText(data).then(()=>toast('복사했어요')).catch(()=>toast('복사가 막혀 있어요 · 직접 선택해서 복사하세요'));return false}},{t:'닫기'}]});
  else{const u=URL.createObjectURL(data);modal({title:name,html:`<p class="note">이 화면에서는 파일 저장이 막혀 있어요. 그림을 오른쪽 클릭해서 저장하세요.</p><img src="${u}" alt="" style="width:100%;border-radius:10px">`,btns:[{t:'닫기'}]})}}

/* ---------- 홈 ---------- */
const QUICK=[{k:'doc',n:'빈 문서',i:'page',c:'#6478E8'},{k:'quick',n:'빠른 메모',i:'bolt',c:'#F5A524'},{k:'tpl:meeting',n:'회의록',i:'user',c:'#E8730C'},{k:'tpl:daily',n:'일일 기록',i:'date',c:'#12A150'},{k:'db',n:'데이터베이스',i:'db',c:'#10B981'},{k:'canvas',n:'캔버스',i:'canvas',c:'#EC4899'},{k:'tpl:mindmap',n:'마인드맵',i:'node',c:'#8B5CF6'},{k:'tpls',n:'템플릿',i:'gallery',c:'#06B6D4'}];
function runQuick(k){if(k==='quick')return quickNote();if(k==='tpls')return openTemplates();if(k.startsWith('tpl:'))return useTemplate(k.slice(4));if(k==='db')return create('db',{title:'새 데이터베이스'});if(k==='canvas')return create('canvas',{title:'새 캔버스'});if(k==='folder')return create('folder',{title:'새 폴더',icon:'📁'});create(k)}
function thumb(p){const mock=p.type==='doc'?'<div class="mock"><i style="width:60%;height:11px"></i><i></i><i style="width:80%"></i><i style="width:70%"></i></div>':'';return `<div class="th" style="${p.cover?coverCSS(p.cover):'background:'+TYPES[p.type].g}">${p.icon||p.type!=='doc'?`<span class="bigi" style="--c:${TYPES[p.type].c}">${p.icon||ic(TYPES[p.type].i)}</span>`:mock}</div>`}
function pcard(p){return `<button class="pc" data-open="${p.id}">${thumb(p)}${p.fav?`<span class="fav">${ic('star')}</span>`:''}<div class="meta"><div class="t">${esc(pTitle(p))}</div><div class="s"><span class="badge" style="--c:${TYPES[p.type].c}">${TYPES[p.type].n}</span>${ago(p.updated)}</div></div></button>`}
function tcard(t){return `<button class="tc" data-tpl="${t.id}"><div class="tv" style="--bgc:${t.bg}">${t.mock||'<i class="h"></i><i></i><i style="width:80%"></i><i style="width:60%"></i>'}</div><b>${esc(t.n)}</b><small>${esc(t.d)}</small></button>`}
function vHome(){const m=$('#main'),all=live().filter(p=>!p.archived&&!p.objOf).sort((a,b)=>b.updated-a.updated);const h=new Date().getHours();
  m.innerHTML=`<div class="ghome"><h1 class="shello">${h<6?'늦은 밤이에요':h<12?'좋은 아침이에요':h<18?'안녕하세요':'좋은 저녁이에요'}</h1>
  <form class="gsearch" id="gs">${ic('search')}<input id="gq" placeholder="찾기 · 또는 새 노트 제목" autocomplete="off" aria-label="검색"><button type="button" class="gnew" data-a="create" title="새로 만들기">${ic('plus')}</button></form>
  <div class="gchips"><button data-q="doc">${ic('page')}문서</button><button data-q="quick">${ic('bolt')}빠른 메모</button><button data-q="db">${ic('table')}표</button><button data-q="canvas">${ic('canvas')}캔버스</button><button data-a="create">${ic('more')}더 보기</button></div>
  <p class="ghint">Enter 찾기 · Shift+Enter 새 노트</p>
  ${all.length?`<section class="grec"><div class="grh"><b>최근</b><button data-go="all">모두 보기</button></div><div class="grid">${all.slice(0,12).map(pcard).join('')}</div>${walkHTML()}</section>`:''}</div>`;
  const q=$('#gq');setTimeout(()=>q.focus(),30);
  $('#gs').onsubmit=e=>{e.preventDefault()};q.onkeydown=e=>{if(e.key!=='Enter'||e.isComposing)return;e.preventDefault();const v=q.value.trim();if(e.shiftKey){if(v)create('doc',{title:v});return}openPalette('all',{q:v})}}
function vAll(kind){const m=$('#main');const titles={all:'모든 메모',doc:'문서',db:'데이터베이스',canvas:'캔버스',folder:'폴더',recent:'최근 열어본 문서',favs:'즐겨찾기',archive:'아카이브',linked:'링크된 문서'};
  let list=(kind==='archive'?live().filter(p=>p.archived):live().filter(p=>!p.archived)).filter(p=>!p.objOf);if(['doc','db','canvas','folder'].includes(kind))ui.allType=kind;
  if(kind==='recent')list=S.recent.map(P).filter(p=>p&&!p.trash);if(kind==='favs')list=list.filter(p=>p.fav);
  if(kind==='linked'){const lk=new Set();live().forEach(p=>{const l=linksFrom(p);if(l.length){lk.add(p.id);l.forEach(i=>lk.add(i))}});list=list.filter(p=>lk.has(p.id))}
  const ty=['doc','db','canvas','folder'].includes(kind)?kind:ui.allType;if(ty!=='all')list=list.filter(p=>p.type===ty);
  if(kind!=='recent')list.sort((a,b)=>ui.sort==='name'?pTitle(a).localeCompare(pTitle(b),'ko'):ui.sort==='new'?b.created-a.created:b.updated-a.updated);
  const head=`<div class="secth" style="margin-top:6px"><h2 style="font-size:28px">${titles[kind]||'모든 메모'}</h2><button class="btn grad sm" data-a="create">${ic('plus')}새로 만들기</button></div>`;
  const tools=`<div class="toolrow"><div class="chips">${[['all','전체'],['doc','문서'],['db','데이터베이스'],['canvas','캔버스'],['folder','폴더']].map(([k,n])=>`<button class="chip${ty===k?' on':''}" data-ty="${k}">${n}</button>`).join('')}</div><span class="sp"></span>${kind!=='recent'?`<select class="selx" data-sort aria-label="정렬"><option value="upd"${ui.sort==='upd'?' selected':''}>최근 수정순</option><option value="new"${ui.sort==='new'?' selected':''}>최근 생성순</option><option value="name"${ui.sort==='name'?' selected':''}>이름순</option></select>`:''}<div class="seg"><button class="${ui.mode==='grid'?'on':''}" data-mode="grid">카드</button><button class="${ui.mode==='list'?'on':''}" data-mode="list">목록</button></div></div>`;
  const body=!list.length?`<div class="empty"><b>${kind==='archive'?'아카이브가 비어 있어요':kind==='favs'?'즐겨찾기한 페이지가 없어요':kind==='linked'?'서로 연결된 문서가 아직 없어요':'여기에 표시할 페이지가 없어요'}</b>${kind==='linked'?'문서에서 [[ 를 입력하면 다른 문서를 연결할 수 있어요.':kind==='favs'?'페이지 메뉴에서 ‘즐겨찾기’를 누르세요.':''}</div>`:ui.mode==='grid'?`<div class="grid">${list.map(pcard).join('')}</div>`:`<div class="lst">${list.map(p=>`<button class="lrow" data-open="${p.id}"><span class="ti" style="--c:${TYPES[p.type].c}">${pIcon(p)}</span><span class="t">${esc(pTitle(p))}</span>${(p.tags||[]).slice(0,3).map(t=>`<span class="tag nx" style="--c:${tagColor(t)}">${esc(t)}</span>`).join('')}<small>${TYPES[p.type].n} · ${ago(p.updated)}</small></button>`).join('')}</div>`;
  m.innerHTML=`<div class="wrap">${head}${tools}${body}</div>`;
  m.querySelectorAll('[data-ty]').forEach(b=>b.onclick=()=>{ui.allType=b.dataset.ty;if(['doc','db','canvas','folder'].includes(kind))go(b.dataset.ty==='all'?'all':'all:'+b.dataset.ty);else render()});
  m.querySelector('[data-sort]')?.addEventListener('change',e=>{ui.sort=e.target.value;render()});m.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{ui.mode=b.dataset.mode;render()})}
function vTrash(){const m=$('#main');const list=Object.values(S.pages).filter(p=>p.trash&&p.trashRoot===p.id).sort((a,b)=>b.trashedAt-a.trashedAt);
  m.innerHTML=`<div class="wrap"><div class="secth" style="margin-top:6px"><h2 style="font-size:28px">휴지통</h2>${list.length?'<button class="btn dg sm" data-empty>휴지통 비우기</button>':''}</div><p class="note">지운 페이지는 하위 페이지와 함께 여기에 보관돼요. 복원하면 원래 자리로 돌아가요.</p>
  ${list.length?`<div class="lst">${list.map(p=>`<div class="lrow"><span class="ti" style="--c:${TYPES[p.type].c}">${pIcon(p)}</span><span class="t">${esc(pTitle(p))}</span><small>${ago(p.trashedAt)} 삭제</small><span class="acts"><button class="btn sm ghost" data-rst="${p.id}">${ic('restore')}복원</button><button class="btn sm dg" data-pg="${p.id}">영구 삭제</button></span></div>`).join('')}</div>`:'<div class="empty"><b>휴지통이 비어 있어요</b></div>'}</div>`;
  m.onclick=async e=>{const r=e.target.closest('[data-rst]'),d=e.target.closest('[data-pg]');if(r)restorePage(r.dataset.rst);
    if(d&&await confirmDlg('영구 삭제할까요?','이 페이지와 하위 페이지가 완전히 사라지고, 되돌릴 수 없어요.','영구 삭제',1)){purgePage(d.dataset.pg);render()}
    if(e.target.closest('[data-empty]')&&await confirmDlg('휴지통을 비울까요?',`${list.length}개 항목이 완전히 사라져요.`,'비우기',1)){list.forEach(p=>purgePage(p.id));render()}}}
function vTags(){const m=$('#main'),t=allTags(),ks=Object.keys(t).sort((a,b)=>t[b]-t[a]);
  m.innerHTML=`<div class="wrap"><div class="secth" style="margin-top:6px"><h2 style="font-size:28px">태그</h2></div><p class="note">태그를 누르면 해당 페이지만 모아 봐요. 오른쪽 클릭하면 이름을 바꾸거나 지울 수 있어요.</p>
  ${ks.length?`<div class="tagcloud">${ks.map(k=>`<button class="tagc" data-go="tag:${esc(k)}" data-tg="${esc(k)}" style="--c:${tagColor(k)}"><i></i>${esc(k)}<small>${t[k]}</small></button>`).join('')}</div>`:'<div class="empty"><b>아직 태그가 없어요</b>문서 제목 아래 ‘+ 태그’로 붙여 보세요.</div>'}</div>`;
  m.oncontextmenu=e=>{const b=e.target.closest('[data-tg]');if(!b)return;e.preventDefault();const k=b.dataset.tg;menu(e.clientX,e.clientY,[{t:'이름 바꾸기',i:'edit',fn:()=>ask('태그 이름 바꾸기',{val:k}).then(v=>{if(!v||v===k)return;live().forEach(p=>{if(p.tags?.includes(k))p.tags=[...new Set(p.tags.map(x=>x===k?v:x))]});save();render()})},{t:'태그 지우기',i:'trash',dg:1,fn:()=>{live().forEach(p=>{if(p.tags)p.tags=p.tags.filter(x=>x!==k)});save();render();toast('태그를 지웠어요')}}])}}
function vTag(k){const m=$('#main'),list=live().filter(p=>p.tags?.includes(k)).sort((a,b)=>b.updated-a.updated);
  m.innerHTML=`<div class="wrap"><div class="secth" style="margin-top:6px"><h2 style="font-size:28px"><span class="tag nx" style="--c:${tagColor(k)};font-size:22px;height:40px;padding:0 16px">#${esc(k)}</span></h2><button data-go="tags">모든 태그</button></div><div class="grid" style="margin-top:16px">${list.map(pcard).join('')}</div></div>`}
function vMissing(){$('#main').innerHTML=`<div class="wrap"><div class="empty"><b>페이지를 찾을 수 없어요</b>영구 삭제됐을 수 있어요. <button class="btn sm ghost" data-go="home">홈으로</button></div></div>`}
function vTrashed(p){$('#main').innerHTML=`<div class="wrap"><div class="empty"><b>‘${esc(pTitle(p))}’은 휴지통에 있어요</b><p>복원하면 다시 열 수 있어요.</p><button class="btn pr" data-rs2="${p.id}">복원하기</button></div></div>`;$('[data-rs2]').onclick=()=>restorePage(p.id)}

/* ---------- 페이지 화면 ---------- */
function headHTML(p){const st=S.settings.statuses.find(s=>s.k===p.status),pr=PRIO.find(s=>s.k===p.prio);
  return `${p.cover?`<div class="cover" style="${coverCSS(p.cover)}"><div class="cover-act"><button data-h="cover">커버 바꾸기</button><button data-h="uncover">없애기</button></div></div>`:''}
  <div class="phead${p.cover?' hasc':''}${p.wide?' wide':''}"><div class="hact">${p.cover?'':`<button data-h="cover">${ic('image')}커버 추가</button>`}<button data-h="prop">${ic('list')}속성 추가</button></div>
  <div class="trow"><button class="picon" data-h="icon" title="아이콘 바꾸기" style="--c:${p.tint||TYPES[p.type].c}">${p.icon||ic(TYPES[p.type].i)}</button>
  <h1 class="ptitle" contenteditable="${p.lock?'false':'plaintext-only'}" data-ph="제목 없음" spellcheck="false">${esc(p.title)}</h1></div>
  <div class="pprops">${(p.tags||[]).map(t=>`<span class="tag" style="--c:${tagColor(t)}"><button data-go="tag:${esc(t)}">${esc(t)}</button><button class="x" data-h="untag" data-t="${esc(t)}" aria-label="태그 빼기">${ic('x')}</button></span>`).join('')}<button class="pchip" data-h="tag">${ic('tag')}태그</button>
  ${p.status!==undefined&&p.status!==''?`<button class="pchip set" data-h="status" style="--c:${st?.c||'#7A8290'}"><i></i>${esc(p.status)}</button>`:''}${p.prio?`<button class="pchip set" data-h="prio" style="--c:${pr?.c}"><i></i>중요도 ${esc(p.prio)}</button>`:''}
  <span class="pmeta">수정 ${ago(p.updated)}</span></div></div>${p.lock?`<div class="lockbar">${ic('lock')}읽기 전용으로 잠긴 페이지예요. 문서 설정(⋯)에서 풀 수 있어요.</div>`:''}`}
function openPage(p){const m=$('#main');S.settings.width==='full'&&p.type==='doc'&&(p.wide=p.wide);
  if(p.type==='canvas'){m.className='full';VIEW=Canvas.mount(p,m);return}
  m.innerHTML=`<div class="pagewrap">${headHTML(p)}<div id="pv"></div></div>`;bindHead(p);const pv=$('#pv');
  if(p.type==='doc'){pv.className='docw'+(p.wide?' wide':'');pv.innerHTML='<div class="doc'+(p.lock?' ro':'')+'" id="doc"></div>';VIEW=Editor.mount(p,$('#doc'))}
  else if(p.type==='db'){pv.className='dbw';VIEW=DBV.mount(p,pv)}
  else if(p.type==='folder'){pv.className='docw fold wide';vFolder(p,pv)}
  if(p.objOf&&DBV.objBox){const ob=document.createElement('div');ob.className='objwrap';$('.phead').after(ob);try{const u=DBV.objBox(ob,p);const v0=VIEW;VIEW={...v0,unmount:()=>{u?.unmount?.();v0?.unmount?.()}}}catch(e){console.warn(e)}}}
function vFolder(p,el){const ks=kids(p.id);el.innerHTML=`<div class="toolrow"><button class="btn grad sm" data-fn="doc">${ic('page')}문서</button><button class="btn ghost sm" data-fn="db">${ic('db')}데이터베이스</button><button class="btn ghost sm" data-fn="canvas">${ic('canvas')}캔버스</button><button class="btn ghost sm" data-fn="folder">${ic('folder')}폴더</button><span class="sp"></span><span class="note">${ks.length}개 항목</span></div>${ks.length?`<div class="grid">${ks.map(pcard).join('')}</div>`:'<div class="empty"><b>빈 폴더예요</b>위 버튼으로 이 폴더 안에 만들거나, 사이드바에서 끌어다 넣으세요.</div>'}`;
  el.onclick=e=>{const b=e.target.closest('[data-fn]');if(!b)return;const t=b.dataset.fn;create(t,{parent:p.id,title:t==='doc'?'':t==='folder'?'새 폴더':t==='db'?'새 데이터베이스':'새 캔버스',icon:t==='folder'?'📁':''})}}
function bindHead(p){const t=$('.ptitle');if(t){t.oninput=()=>{p.title=t.textContent.replace(/\n/g,' ').trim();touch(p);updTitle(p);if(p.objOf)try{DBV.setRowTitle(p,p.title)}catch(e){}};
    t.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();if(p.type==='doc')Editor.focusFirst();else t.blur()}};t.onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain').replace(/\n/g,' '))}}
  $('#main').querySelector('.pagewrap').addEventListener('click',e=>{const h=e.target.closest('[data-h]');if(!h)return;const a=h.dataset.h;
    if(p.lock&&a!=='status'&&a!=='prio')return toast('잠긴 페이지예요');
    if(a==='icon')iconPicker(p);if(a==='cover')coverPicker(p);if(a==='uncover'){p.cover=null;touch(p);render()}
    if(a==='untag'){p.tags=p.tags.filter(x=>x!==h.dataset.t);touch(p);render()}
    if(a==='tag')tagInput(p,h);
    const r=h.getBoundingClientRect();
    if(a==='prop')menu(r.left,r.bottom+4,[{t:'태그',i:'tag',fn:()=>tagInput(p,$('[data-h=tag]'))},{t:'상태',i:'sel',fn:()=>{p.status=S.settings.statuses[0].k;touch(p);render()}},{t:'중요도',i:'up',fn:()=>{p.prio='보통';touch(p);render()}},{t:'아이콘',i:'star',fn:()=>iconPicker(p)},{t:'커버',i:'image',fn:()=>coverPicker(p)}]);
    if(a==='status')menu(r.left,r.bottom+4,[...S.settings.statuses.map(s=>({t:s.k,em:'●',on:p.status===s.k,fn:()=>{p.status=s.k;touch(p);render()}})),'-',{t:'새 상태 추가…',i:'plus',fn:()=>ask('새 상태 이름',{ph:'예: 검토 중'}).then(v=>{if(!v)return;S.settings.statuses.push({k:v,c:TAGC[S.settings.statuses.length%TAGC.length]});p.status=v;touch(p);render()})},{t:'상태 지우기',i:'x',fn:()=>{p.status='';touch(p);render()}}]);
    if(a==='prio')menu(r.left,r.bottom+4,[...PRIO.map(s=>({t:s.k,em:'●',on:p.prio===s.k,fn:()=>{p.prio=s.k;touch(p);render()}})),'-',{t:'중요도 지우기',i:'x',fn:()=>{p.prio='';touch(p);render()}}])})}
function tagInput(p,anchor){if(!anchor)return;const all=Object.keys(allTags());const w=document.createElement('span');w.innerHTML=`<input class="tagin" list="taglist" placeholder="태그 입력 후 Enter" aria-label="태그"><datalist id="taglist">${all.map(t=>`<option value="${esc(t)}">`).join('')}</datalist>`;anchor.replaceWith(w);const i=w.querySelector('input');i.focus();
  const add=()=>{const v=i.value.trim().replace(/^#/,'');if(v&&!p.tags.includes(v)){p.tags.push(v);touch(p)}render()};i.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();add()}if(e.key==='Escape')render()};i.onblur=()=>{if(i.value.trim())add();else render()}}
function iconPicker(p){modal({title:'아이콘 고르기',html:`<div class="emo">${EMOJI.map(e=>`<button data-e="${e}" aria-label="${e}">${e}</button>`).join('')}</div><div style="display:flex;gap:8px;margin-top:12px"><input class="inp" id="emoIn" placeholder="직접 입력 (이모지 한 글자)" maxlength="4"><button class="btn ghost" id="emoNone">아이콘 없애기</button></div>`,
  onOpen:()=>{$('#mbody').onclick=e=>{const b=e.target.closest('[data-e]');if(b){p.icon=b.dataset.e;fin()}if(e.target.id==='emoNone'){p.icon='';fin()}};$('#emoIn').onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing&&e.target.value.trim()){p.icon=[...e.target.value.trim()].slice(0,2).join('');fin()}}}});
  function fin(){touch(p);closeModal();renderSide();if(curPage()?.id===p.id)render();else if(route!=='graph')render()}}
function coverPicker(p){modal({title:'커버 고르기',html:`<div class="covers">${COVERS.map((c,i)=>`<button data-g="${i}" style="background:${c}" aria-label="커버 ${i+1}"></button>`).join('')}</div><button class="btn ghost" id="covUp" style="margin-top:12px">${ic('ul')}내 사진 올리기</button>`,
  onOpen:()=>{$('#mbody').onclick=async e=>{const b=e.target.closest('[data-g]');if(b){p.cover={g:+b.dataset.g};done()}if(e.target.closest('#covUp')){const[f]=await pickFile('image/*');if(f){p.cover={img:await putBlob(f)};done()}}}}});const done=()=>{touch(p);closeModal();render()}}

/* ---------- 오른쪽 패널 ---------- */
function togglePanel(v){S.settings.panel=v??!S.settings.panel;document.body.classList.toggle('panel',S.settings.panel);save();renderPanel()}
function renderPanel(){if(!S.settings.panel)return;const p=curPage();const tabs=[['pages','썸네일'],...(p?(p.type==='doc'?[['toc','목차'],['links','연결'],['hist','기록'],['att','첨부'],['cmt','댓글'],['info','정보']]:[['links','연결'],['hist','기록'],['cmt','댓글'],['info','정보']]):[['info','정보']]),...(ui.sideId&&P(ui.sideId)?[['side','옆 보기']]:[])];
  if(!tabs.some(t=>t[0]===ui.ptab))ui.ptab=tabs[0][0];$('#rtabs').innerHTML=tabs.map(([k,n])=>`<button class="${ui.ptab===k?'on':''}" data-pt="${k}">${n}</button>`).join('');const b=$('#rbody');
  if(ui.ptab==='pages'){const sib=p?(p.parent?kids(p.parent):kids(null)):S.recent.map(P).filter(x=>x&&!x.trash).slice(0,12);const list=sib.length?sib:live().slice(0,12);b.innerHTML=`<p class="note" style="margin-top:0">${p?'같은 자리의 페이지':'최근 페이지'} · 눌러서 이동</p><div class="shelf">${list.map(x=>`<button class="shc${x.id===p?.id?' on':''}" data-go="page:${x.id}" data-peek="${x.id}">${thumb(x)}<span>${esc(pTitle(x))}</span></button>`).join('')}</div>`;return}
  if(ui.ptab==='side'){const x=P(ui.sideId);b.innerHTML=`<div class="sideh"><b>${esc(pTitle(x))}</b><button class="btn sm ghost" data-go="page:${x.id}">열기</button><button class="ib sm" data-sclose aria-label="닫기">${ic('x')}</button></div><div class="peekdoc">${Peek.html(x)}</div>`;return}
  if(ui.ptab==='cmt'&&p){b.innerHTML=Sync.canComment()?`<p class="note" style="margin-top:0">블록을 오른쪽 클릭 → ‘댓글 달기’로 그 자리에 댓글을 남겨요. 문서 전체에 남기려면 아래 버튼을 누르세요.</p><button class="btn pr sm" data-cmall style="width:100%;justify-content:center">${ic('mail')}이 문서에 댓글 달기</button>`:'<p class="note">댓글은 이 노트를 claude.ai에서 열었을 때 쓸 수 있어요. 지금은 콜아웃 블록(/콜아웃)으로 메모를 남겨 두세요.</p>';return}
  if(!p){const n=live().length;b.innerHTML=`<h5>워크스페이스</h5><dl class="kv"><dt>페이지</dt><dd>${n}개</dd><dt>태그</dt><dd>${Object.keys(allTags()).length}개</dd><dt>마지막 저장</dt><dd>${lastSaved?ago(lastSaved):'-'}</dd></dl><p class="note">문서를 열면 목차·백링크·기록이 여기에 나와요.</p>`;return}
  if(ui.ptab==='toc'){const hs=Editor.headings(p);b.innerHTML=hs.length?`<div class="toc">${hs.map(h=>`<a class="l${h.l}" data-sb="${h.id}">${esc(h.t)||'(빈 제목)'}</a>`).join('')}</div>`:'<p class="note">제목 블록(/제목)을 넣으면 목차가 자동으로 만들어져요.</p>'}
  if(ui.ptab==='links'){const bl=backlinks(p.id),out=linksFrom(p),ch=kids(p.id),rel=live().filter(x=>x.id!==p.id&&p.tags?.length&&x.tags?.some(t=>p.tags.includes(t))).slice(0,8);
    const L=a=>a.map(x=>`<button class="rlink" data-go="page:${x.id}">${x.icon||ic(TYPES[x.type].i)}<span>${esc(pTitle(x))}</span><small>${TYPES[x.type].n}</small></button>`).join('');
    b.innerHTML=`<button class="btn sm ghost" data-lg style="width:100%;justify-content:center">${ic('graph')}이 문서 중심 그래프 보기</button><h5>이 문서를 가리키는 문서 (${bl.length})</h5>${bl.length?L(bl):'<p class="note">아직 없어요. 다른 문서에서 [[ 를 입력해 연결해 보세요.</p>'}<h5>이 문서가 가리키는 문서 (${out.length})</h5>${out.length?L(out.map(P)):'<p class="note">없음</p>'}${ch.length?`<h5>하위 페이지 (${ch.length})</h5>${L(ch)}`:''}${rel.length?`<h5>같은 태그의 관련 문서</h5>${L(rel)}`:''}`}
  if(ui.ptab==='info'){const txt=pageText(p),words=(txt.match(/\S+/g)||[]).length;b.innerHTML=`<dl class="kv"><dt>유형</dt><dd>${TYPES[p.type].n}</dd><dt>만든 날</dt><dd>${kdate(p.created)}</dd><dt>수정</dt><dd>${ago(p.updated)}</dd><dt>위치</dt><dd>${ancestors(p).map(a=>esc(pTitle(a))).join(' / ')||'최상위'}</dd><dt>단어</dt><dd>${words.toLocaleString()}</dd><dt>글자</dt><dd>${txt.length.toLocaleString()}</dd>${p.type==='doc'?`<dt>블록</dt><dd>${p.blocks.length}</dd>`:''}${p.type==='db'?`<dt>항목</dt><dd>${p.db.rows.length}</dd>`:''}${p.type==='canvas'?`<dt>카드</dt><dd>${p.cv.items.length}</dd>`:''}<dt>태그</dt><dd>${(p.tags||[]).map(esc).join(', ')||'-'}</dd><dt>잠금</dt><dd>${p.lock?'읽기 전용':'편집 가능'}</dd></dl>`}
  if(ui.ptab==='hist'){const l=V[p.id]||[];b.innerHTML=`<button class="btn ghost sm" data-vsave style="width:100%;justify-content:center">${ic('history')}지금 상태를 버전으로 저장</button><h5>저장된 버전 (${l.length})</h5><div class="verl">${l.map((v,i)=>`<button class="rlink" data-vi="${i}">${ic('clock')}<span>${new Date(v.t).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}${v.label?` · ${esc(v.label)}`:''}</span><small>${ago(v.t)}</small></button>`).join('')||'<p class="note">편집하면 잠시 뒤 자동으로 버전이 쌓여요.</p>'}</div>`}
  if(ui.ptab==='att'){const at=p.blocks.filter(x=>['image','media'].includes(x.type)&&x.src);b.innerHTML=at.length?at.map(x=>`<button class="rlink" data-sb="${x.id}">${ic(x.type==='image'?'image':'file')}<span>${esc(blobs[x.src]?.name||'파일')}</span><small>${blobs[x.src]?((blobs[x.src].size/1024)|0)+'KB':''}</small></button>`).join(''):'<p class="note">사진·영상·파일 블록이 여기에 모여요.</p>'}
  if(ui.ptab==='cmt')b.innerHTML='<p class="note">댓글과 협업은 개발 예정이에요. 지금은 콜아웃 블록(/콜아웃)으로 메모를 남겨 두세요.</p>'}
function panelClick(e){const t=e.target.closest('[data-pt]');if(t){ui.ptab=t.dataset.pt;return renderPanel()}if(e.target.closest('[data-sclose]')){ui.sideId=null;ui.ptab='pages';return renderPanel()}
  const g=e.target.closest('[data-go]');if(g)return go(g.dataset.go);
  const sb=e.target.closest('[data-sb]');if(sb)return Editor.scrollTo(sb.dataset.sb);
  const p=curPage();if(!p)return;
  if(e.target.closest('[data-lg]')){ui.gcenter=p.id;return go('graph')}
  if(e.target.closest('[data-cmall]'))return Sync.comment($('.phead'));
  if(e.target.closest('[data-vsave]')){snapVersion(p,'직접 저장');renderPanel();return toast('버전을 저장했어요')}
  const vi=e.target.closest('[data-vi]');if(vi)versionView(p,+vi.dataset.vi)}
function versionView(p,i){const v=V[p.id][i];const old=JSON.parse(v.data),cur=content(p);const tx=c=>p.type==='doc'?Editor.textOf(c.blocks):p.type==='db'?DBV.textOf(c.db):Canvas.textOf(c.cv);
  const a=tx(old).split('\n').filter(Boolean),b2=tx(cur).split('\n').filter(Boolean),sa=new Set(a),sb=new Set(b2);const rem=a.filter(x=>!sb.has(x)),add=b2.filter(x=>!sa.has(x));
  modal({title:'버전 보기 · '+new Date(v.t).toLocaleString('ko-KR'),cls:'mid',html:`<p class="note">지금과 비교해 이 버전에만 있던 줄은 빨강, 지금 새로 생긴 줄은 초록이에요.</p><div style="font-size:14px;max-height:50vh;overflow:auto;border:1px solid var(--line);border-radius:12px;padding:10px">${rem.map(x=>`<div style="background:#E5484D22;padding:2px 6px;border-radius:4px;margin:2px 0">− ${esc(x)}</div>`).join('')}${add.map(x=>`<div style="background:#12A15022;padding:2px 6px;border-radius:4px;margin:2px 0">+ ${esc(x)}</div>`).join('')}${!rem.length&&!add.length?'<p class="note">글자 차이가 없어요 (배치·서식만 다를 수 있어요).</p>':''}</div>`,
    btns:[{t:'닫기'},{t:'이 버전으로 복원',cls:'pr',fn:()=>{snapVersion(p,'복원 전');Object.assign(p,old);touch(p);render();toast('복원했어요. 복원 전 상태도 기록에 남아 있어요')}}]})}

/* ---------- 검색 · 명령 팔레트 ---------- */
function parseQ(q){const f={text:[],tag:[],type:null,mod:null,cr:null,fold:null};const ph=[];q=q.replace(/"([^"]+)"/g,(_,x)=>{ph.push(x.toLowerCase());return''});f.text.push(...ph);
  q.split(/\s+/).forEach(t=>{const m=t.match(/^(tag|type|modified|created|folder|in):(.+)$/i);if(m){const k=m[1].toLowerCase(),v=m[2].toLowerCase();if(k==='tag')f.tag.push(v.replace(/^#/,''));else if(k==='type')f.type={document:'doc',doc:'doc',문서:'doc',database:'db',db:'db',데이터베이스:'db',canvas:'canvas',캔버스:'canvas',folder:'folder',폴더:'folder'}[v]||v;else if(k==='modified')f.mod=v;else if(k==='created')f.cr=v;else f.fold=v}else if(t.startsWith('#')&&t.length>1)f.tag.push(t.slice(1).toLowerCase());else if(t)f.text.push(t.toLowerCase())});return f}
function dateOk(ts,v){if(!v)return true;const d=new Date(ts),n=new Date();if(v==='today'||v==='오늘')return d.toDateString()===n.toDateString();if(v==='yesterday'||v==='어제'){const y=new Date(n-864e5);return d.toDateString()===y.toDateString()}if(v==='week'||v==='이번주')return now()-ts<7*864e5;
  const ymd=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return ymd.startsWith(v)}
function searchPages(q){const f=parseQ(q);const res=[];live().forEach(p=>{if(f.type&&p.type!==f.type)return;if(f.tag.length&&!f.tag.every(t=>(p.tags||[]).some(x=>x.toLowerCase().includes(t))))return;if(!dateOk(p.updated,f.mod)||!dateOk(p.created,f.cr))return;
  if(f.fold&&!ancestors(p).some(a=>(a.title||'').toLowerCase().includes(f.fold)))return;const title=(p.title||'').toLowerCase(),body=pageText(p),low=body.toLowerCase();if(!f.text.every(t=>low.includes(t)))return;
  let score=f.text.reduce((s,t)=>s+(title.includes(t)?10:1),0)+(p.updated/1e13);const t0=f.text[0];let snip='';if(t0){const i=low.indexOf(t0,title.length);if(i>=0)snip=body.slice(Math.max(0,i-30),i+70)}res.push({p,score,snip})});
  return res.sort((a,b)=>b.score-a.score)}
const hl=(s,f)=>{let h=esc(s);f.text.forEach(t=>{if(t.length>0)h=h.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),m=>`<mark>${m}</mark>`)});return h};
function cmdList(){const p=curPage();return[{n:'새 문서',k:'Ctrl N',i:'page',f:()=>create('doc')},{n:'새 폴더',k:'Ctrl Shift N',i:'folder',f:()=>create('folder',{title:'새 폴더',icon:'📁'})},{n:'새 데이터베이스',i:'db',f:()=>create('db',{title:'새 데이터베이스'})},{n:'새 캔버스',i:'canvas',f:()=>create('canvas',{title:'새 캔버스'})},{n:'빠른 메모',i:'bolt',f:quickNote},{n:'템플릿 갤러리',i:'gallery',f:()=>openTemplates()},
  {n:'홈',i:'home',f:()=>go('home')},{n:'그래프 뷰',i:'graph',f:()=>go('graph')},{n:'모든 메모',i:'grid',f:()=>go('all')},{n:'태그',i:'tag',f:()=>go('tags')},{n:'휴지통',i:'trash',f:()=>go('trash')},{n:'아카이브',i:'archive',f:()=>go('archive')},
  {n:'설정',i:'settings',f:()=>openSettings()},{n:'테마 바꾸기 (라이트/다크)',i:'moon',f:toggleTheme},{n:'사이드바 열고 닫기',k:'Ctrl \\',i:'layout',f:()=>toggleSide()},{n:'오른쪽 패널 열고 닫기',i:'layout',f:()=>togglePanel()},
  ...Object.entries(PRESETS).map(([k,v])=>({n:'레이아웃: '+v.n,i:'layout',f:()=>applyPreset(k)})),
  {n:'전체 백업 저장',i:'dl',f:()=>backupAll()},{n:'백업 불러오기',i:'ul',f:importBackup},{n:'단축키 보기',i:'help',f:showKeys},
  ...(p?[{n:`현재 문서: ${p.fav?'즐겨찾기 해제':'즐겨찾기'}`,i:'star',f:()=>{p.fav=!p.fav;save();renderSide()}},{n:'현재 문서: 마크다운 내보내기',i:'dl',f:()=>exportMD(p)},{n:'현재 문서: 복제',i:'copy',f:()=>dupPage(p.id)},{n:'현재 문서: 휴지통으로',i:'trash',f:()=>trashPage(p.id)},{n:'현재 문서: 템플릿으로 저장',i:'gallery',f:()=>saveAsTemplate(p)}]:[])]}
function openPalette(mode='all',o={}){return new Promise(res=>{let done=false;const fin=v=>{if(!done){done=true;res(v)}};let act=0,items=[];
  modal({cls:'mid',html:`<div class="pal-in">${ic('search')}<input id="palIn" placeholder="${o.ph||(mode==='cmd'?'명령 검색…':'문서·내용·태그 검색, 명령 실행  (tag:사업 type:db modified:today)')}" aria-label="검색"></div><div class="pal-l" id="palL"></div>${o.pick?'':`<div class="pal-hint"><span>↑↓ 이동 · Enter 열기</span><span>tag: type: created: modified: folder: "정확한 문구"</span><button id="palExp" class="btn sm ghost" style="margin-left:auto">결과 복사</button></div>`}`,onClose:()=>fin(undefined),
  onOpen:()=>{$('#mbody').style.padding='0';const inp=$('#palIn');if(o.q)inp.value=o.q;
    const draw=()=>{const q=inp.value.trim();items=[];let h='';
      if(o.pick){const f=parseQ(q);if(o.root)items.push({k:'root',n:'최상위 (내 문서)',i:'home'});live().filter(p=>!o.exclude?.some(x=>x===p.id||isDesc(p.id,x))&&(o.filter?o.filter(p):p.type!=='canvas')&&f.text.every(t=>(p.title||'').toLowerCase().includes(t))).sort((a,b)=>b.updated-a.updated).slice(0,40).forEach(p=>items.push({k:'page',p}));
        if(o.allowNew&&q)items.push({k:'new',n:`새 문서 만들기: ${q}`,i:'plus',q});h=items.map(x=>rowP(x)).join('')}
      else{if(!q&&mode!=='cmd'){const rq=S.recentQ.slice(0,5);if(rq.length){h+='<div class="mh">최근 검색어</div>';rq.forEach(r=>{items.push({k:'q',q:r});h+=rowP(items.at(-1))})}h+='<div class="mh">최근 문서</div>';S.recent.map(P).filter(p=>p&&!p.trash).slice(0,6).forEach(p=>{items.push({k:'page',p});h+=rowP(items.at(-1))})}
        else{const f=parseQ(q);const cmds=cmdList().filter(c=>!q||f.text.every(t=>c.n.toLowerCase().includes(t)));const pages=mode==='cmd'?[]:searchPages(q).slice(0,30);
          const sec=(nm,arr)=>{if(!arr.length)return;h+=`<div class="mh">${nm}</div>`;arr.forEach(x=>{items.push(x);h+=rowP(x,f)})};
          if(mode==='cmd'){sec('명령',cmds.map(c=>({k:'cmd',c})));sec('페이지',[])}else{sec(`페이지 ${pages.length}개`,pages.map(r=>({k:'page',p:r.p,snip:r.snip})));sec('명령',cmds.slice(0,6).map(c=>({k:'cmd',c})))}
          if(!items.length)h='<p class="note" style="padding:14px">찾는 결과가 없어요. 다른 말로 찾거나 tag:, type: 조건을 지워 보세요.</p>'}}
      act=Math.min(act,Math.max(0,items.length-1));$('#palL').innerHTML=h;mark()};
    const mark=()=>$$('#palL .prw').forEach((e,i)=>{e.classList.toggle('act',i===act);if(i===act)e.scrollIntoView({block:'nearest'})});
    const pickI=i=>{const it=items[i];if(!it)return;const q=inp.value.trim();
      if(o.pick){fin(it.k==='root'?null:it.k==='new'?{newTitle:it.q}:it.p.id);return closeModal()}
      if(it.k==='q'){inp.value=it.q;draw();return}if(q&&it.k==='page'){S.recentQ=[q,...S.recentQ.filter(x=>x!==q)].slice(0,8);save()}
      closeModal();if(it.k==='page')go('page:'+it.p.id);if(it.k==='cmd')it.c.f()};
    inp.oninput=()=>{act=0;draw()};inp.onkeydown=e=>{if(e.isComposing)return;if(e.key==='ArrowDown'){e.preventDefault();act=Math.min(items.length-1,act+1);mark()}else if(e.key==='ArrowUp'){e.preventDefault();act=Math.max(0,act-1);mark()}else if(e.key==='Enter'){e.preventDefault();pickI(act)}};
    $('#palL').onclick=e=>{const r=e.target.closest('.prw');if(r)pickI(+r.dataset.ix)};
    $('#palExp')?.addEventListener('click',()=>{const q=inp.value.trim();const t=searchPages(q).map(r=>`- ${pTitle(r.p)} (${TYPES[r.p.type].n}, ${ago(r.p.updated)})`).join('\n');navigator.clipboard?.writeText(`검색: ${q}\n${t}`).then(()=>toast('검색 결과를 복사했어요'),()=>toast('복사가 막혀 있어요'))});
    if(o.q)inp.value=o.q;draw();inp.focus()}});
  function rowP(x,f={text:[]}){const i=items.indexOf(x);if(x.k==='page'){const p=x.p;return `<button class="prw" data-ix="${i}" style="--c:${TYPES[p.type].c}"><span class="ti">${pIcon(p)}</span><span class="tx"><b>${hl(pTitle(p),f)}</b><small>${x.snip?hl(x.snip,f):esc([TYPES[p.type].n,...ancestors(p).map(a=>pTitle(a))].join(' · '))}</small></span><small style="color:var(--mute);font-size:13px">${ago(p.updated)}</small></button>`}
    if(x.k==='cmd')return `<button class="prw" data-ix="${i}"><span class="ti">${ic(x.c.i||'bolt')}</span><span class="tx"><b>${hl(x.c.n,f)}</b></span>${x.c.k?`<kbd>${x.c.k}</kbd>`:''}</button>`;
    if(x.k==='q')return `<button class="prw" data-ix="${i}"><span class="ti">${ic('clock')}</span><span class="tx"><b>${esc(x.q)}</b></span></button>`;
    return `<button class="prw" data-ix="${i}"><span class="ti">${ic(x.i||'page')}</span><span class="tx"><b>${esc(x.n)}</b></span></button>`}})}
const pickPage=(title,o={})=>openPalette('pick',{pick:1,ph:title,...o});

/* ---------- 만들기 / 템플릿 ---------- */
function T(src){return src.trim().split('\n').map(l=>{l=l.trim();const m=l.match(/^(\w+):?(.*)$/);if(!m)return B('p',fmtI(l));const[,k,v]=m;const t=v.trim();
  if(k==='divider')return B('divider');if(k==='toc')return B('toc');if(k==='todo'||k==='done')return B('todo',fmtI(t),{checked:k==='done'});
  if(k==='callout'){const[e,...r]=t.split('|');return B('callout',fmtI(r.join('|')),{icon:e})}
  if(k==='toggle'){const[a,...r]=t.split('|');return B('toggle',fmtI(a),{body:fmtI(r.join('|').replace(/\\n/g,'\n'))})}
  if(k==='table')return B('table','',{rows:t.split(';').map(r=>r.split(',').map(c=>esc(c.trim())))});
  if(k==='code'){const[lg,...r]=t.split('|');return B('code','',{text:r.join('|').replace(/\\n/g,'\n'),lang:lg})}
  if(k==='date')return B('date','',{date:t||today(),label:'날짜'});
  if(['p','h1','h2','h3','ul','ol','quote'].includes(k))return B(k,fmtI(t));return B('p',fmtI(l))})}
const fmtI=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`(.+?)`/g,'<code>$1</code>').replace(/\[\[([^\[\]<>]+?)\]\]/g,'<a class="pl" data-title="$1" contenteditable="false">$1</a>');
function linkify(){live().forEach(p=>{if(p.type!=='doc')return;p.blocks.forEach(b=>{['html','body'].forEach(f=>{if(b[f]&&b[f].includes('data-title'))b[f]=b[f].replace(/<a class="pl" data-title="([^"]+)" contenteditable="false">([^<]*)<\/a>/g,(m,t)=>{const q=resolveTitle(t.replace(/&amp;/g,'&'));return q?`<a class="pl" data-page="${q.id}" contenteditable="false">${esc(q.title)}</a>`:t})})})})}
const TPL=[
 {id:'daily',type:'doc',cat:'문서',n:'일일 메모',d:'오늘 할 일과 기록',bg:'linear-gradient(135deg,#34D399,#22C3E6)',icon:'🗓️',b:()=>T(`date:${today()}\nh2:오늘의 목표\ntodo:\ntodo:\nh2:기록\np:\nh2:감사한 일\nul:`)},
 {id:'week',type:'doc',cat:'문서',n:'주간 계획',d:'요일별 계획 표',bg:'linear-gradient(135deg,#6478E8,#22C3E6)',icon:'📅',b:()=>T(`callout:🎯|이번 주 가장 중요한 한 가지:\ntable:요일,할 일,메모;월,,;화,,;수,,;목,,;금,,;주말,,\nh2:돌아보기\np:`)},
 {id:'month',type:'doc',cat:'문서',n:'월간 계획',d:'목표·일정·회고',bg:'linear-gradient(135deg,#A78BFA,#6478E8)',icon:'🗓️',b:()=>T(`h2:이달의 목표\ntodo:\ntodo:\nh2:주요 일정\ntable:날짜,일정;,;,\nh2:월말 회고\ntoggle:잘한 점|\ntoggle:아쉬운 점|`)},
 {id:'meeting',type:'doc',cat:'문서',n:'회의록',d:'안건·결정·할 일',bg:'linear-gradient(135deg,#FBBF24,#F97316)',icon:'🤝',b:()=>T(`date:${today()}\np:**참석자:** \nh2:안건\nol:\nh2:논의 내용\np:\nh2:결정 사항\nul:\nh2:할 일\ntodo:담당자 — 할 일 — 마감일`)},
 {id:'project',type:'doc',cat:'문서',n:'프로젝트 문서',d:'목표·범위·일정',bg:'linear-gradient(135deg,#6478E8,#8B5CF6)',icon:'🚀',b:()=>T(`callout:💡|이 프로젝트를 한 문장으로:\nh2:목표\nul:\nh2:범위\ntoggle:포함|\ntoggle:제외|\nh2:일정\ntable:단계,기간,상태;기획,,;개발,,;출시,,\nh2:위험 요소\nul:`)},
 {id:'biz',type:'doc',cat:'문서',n:'사업 계획',d:'문제·해결·시장·수익',bg:'linear-gradient(135deg,#F43F5E,#8B5CF6)',icon:'💼',b:()=>T(`toc\nh2:문제\np:\nh2:해결책\np:\nh2:시장과 고객\nul:\nh2:경쟁사\ntable:경쟁사,강점,약점;,,\nh2:수익 구조\np:\nh2:다음 단계\ntodo:`)},
 {id:'study',type:'doc',cat:'문서',n:'공부 노트',d:'핵심 개념·질문·요약',bg:'linear-gradient(135deg,#0EA5E9,#22D3EE)',icon:'🎓',b:()=>T(`p:**과목:**  **단원:** \nh2:핵심 개념\ntoggle:개념 1|설명을 적어 보세요\ntoggle:개념 2|\nh2:모르는 것\ntodo:\nh2:한 줄 요약\nquote:`)},
 {id:'read',type:'doc',cat:'문서',n:'독서 노트',d:'인상 깊은 문장과 생각',bg:'linear-gradient(135deg,#FDE68A,#FCA5A5)',icon:'📖',b:()=>T(`p:**저자:**  **읽은 날:** \nh2:한 줄 평\nquote:\nh2:인상 깊은 부분\nul:\nh2:내 생각\np:`)},
 {id:'idea',type:'doc',cat:'문서',n:'아이디어 정리',d:'떠오른 생각을 구조로',bg:'linear-gradient(135deg,#A78BFA,#F472B6)',icon:'💡',b:()=>T(`callout:⚡|아이디어 한 줄:\nh2:왜 필요할까\np:\nh2:어떻게 만들까\nul:\nh2:비슷한 것\nul:\nh2:바로 해볼 일\ntodo:`)},
 {id:'report',type:'doc',cat:'문서',n:'조사 보고서',d:'질문·자료·결론',bg:'linear-gradient(135deg,#1F2937,#4B5563)',icon:'🔎',b:()=>T(`toc\nh2:조사 질문\np:\nh2:자료\nul:\nh2:발견한 것\np:\nh2:결론\ncallout:✅|`)},
 {id:'trip',type:'doc',cat:'문서',n:'여행 계획',d:'일정·준비물·예산',bg:'linear-gradient(135deg,#22C3E6,#34D399)',icon:'✈️',b:()=>T(`p:**기간:**  **장소:** \nh2:일정\ntable:날짜,오전,오후,저녁;1일차,,,;2일차,,,\nh2:준비물\ntodo:\ntodo:\nh2:예산\ntable:항목,금액;교통,;숙소,;식비,`)},
 {id:'checklist',type:'doc',cat:'문서',n:'업무 체크리스트',d:'반복 업무 점검표',bg:'linear-gradient(135deg,#86EFAC,#FDE68A)',icon:'✅',b:()=>T(`h2:시작 전\ntodo:\ntodo:\nh2:진행 중\ntodo:\nh2:마무리\ntodo:`)},
 ...[['tasks','작업 관리','상태별 보드와 마감일','✅'],['projects','프로젝트 관리','진행률과 담당','🚀'],['books','독서 기록','읽은 책과 평점','📚'],['movies','영화 기록','본 영화와 감상','🎬'],['studylog','공부 기록','과목별 공부 시간','🎓'],['ideas','아이디어 저장소','아이디어 모으기','💡'],['crm','고객 관리','연락처와 단계','🤝'],['meetings','회의록 모음','날짜별 회의','🗓️'],['schedule','일정 관리','캘린더로 보기','📅'],['archive','자료 보관소','링크와 자료','🗂️']].map(([id,n,d,icon])=>({id,type:'db',cat:'데이터베이스',n,d,icon,bg:'linear-gradient(135deg,#10B981,#22C3E6)',mock:'<i class="h"></i><div class="boxes"><i></i><i></i><i></i></div>'})),
 ...[['mindmap','마인드맵','가운데 주제에서 가지 뻗기','🧠'],['flow','플로우차트','시작→판단→결과','🔀'],['brain','브레인스토밍','포스트잇으로 생각 쏟기','🌪️'],['tripboard','여행 무드보드','사진·링크 모으기','🗺️']].map(([id,n,d,icon])=>({id,type:'canvas',cat:'캔버스',n,d,icon,bg:'linear-gradient(135deg,#F59E0B,#F472B6)',mock:'<div class="boxes"><i></i><i style="flex:.6"></i></div><i style="width:70%"></i>'}))];
function useTemplate(id,par=null){const t=TPL.find(x=>x.id===id),u=(S.tpls||[]).find(x=>x.id===id);
  if(u){const d=JSON.parse(u.data);const p=newPage(u.type,{title:u.name,icon:u.icon,parent:par,...(u.type==='doc'?{blocks:d.blocks.map(b=>({...b,id:uid()}))}:u.type==='db'?{db:d.db}:u.type==='canvas'?{cv:d.cv}:{})});go('page:'+p.id);renderSide();return}
  if(!t)return;const o={title:t.n,icon:t.icon,parent:par};if(t.type==='doc')o.blocks=t.b();if(t.type==='db')o.db=DBV.make(t.id);if(t.type==='canvas')o.cv=Canvas.make(t.id);const p=newPage(t.type,o);go('page:'+p.id);renderSide();toast(`‘${t.n}’ 템플릿으로 새 페이지를 만들었어요`)}
function saveAsTemplate(p){ask('템플릿 이름',{val:pTitle(p)}).then(v=>{if(!v)return;(S.tpls||(S.tpls=[])).push({id:'u'+uid(),name:v,type:p.type,icon:p.icon,data:JSON.stringify(content(p)),t:now()});save();toast('내 템플릿에 저장했어요',{act:'보기',fn:()=>openTemplates()})})}
function openTemplates(par=null,cat='전체'){const cats=['전체','문서','데이터베이스','캔버스','내 템플릿'];const list=cat==='내 템플릿'?[]:TPL.filter(t=>cat==='전체'||t.cat===cat);const mine=S.tpls||[];
  modal({title:'템플릿 갤러리',cls:'wide',html:`<div class="tabsx">${cats.map(c=>`<button class="chip${c===cat?' on':''}" data-cat="${c}">${c}${c==='내 템플릿'?` ${mine.length}`:''}</button>`).join('')}</div>
   ${cat==='전체'||cat==='내 템플릿'?(mine.length?`<h4 style="margin:6px 0 10px">내 템플릿</h4><div class="tplrow" style="margin-bottom:18px">${mine.map(u=>`<div class="tc" style="position:relative"><button data-tpl="${u.id}" style="display:block;width:100%;text-align:left"><div class="tv" style="--bgc:${TYPES[u.type].g}"><i class="h"></i><i></i><i style="width:70%"></i></div><b>${esc(u.icon||'')} ${esc(u.name)}</b><small>${TYPES[u.type].n} · ${ago(u.t)}</small></button><button class="ib sm" data-del="${u.id}" style="position:absolute;top:8px;right:8px;background:var(--paper)" aria-label="템플릿 삭제">${ic('trash')}</button></div>`).join('')}</div>`:cat==='내 템플릿'?'<div class="empty"><b>아직 내 템플릿이 없어요</b>페이지 메뉴(⋯)에서 ‘템플릿으로 저장’을 누르세요.</div>':''):''}
   ${list.length?`<div class="tplrow">${list.map(tcard).join('')}</div>`:''}`,
   onOpen:()=>{$('#mbody').onclick=e=>{const c=e.target.closest('[data-cat]');if(c)return openTemplates(par,c.dataset.cat);const d=e.target.closest('[data-del]');if(d){S.tpls=S.tpls.filter(x=>x.id!==d.dataset.del);save();return openTemplates(par,cat)}const t=e.target.closest('[data-tpl]');if(t){closeModal();useTemplate(t.dataset.tpl,par)}}}})}
const CR={
 '기본':[['doc','빈 문서','page','글·블록으로 자유롭게'],['quick','빠른 메모','bolt','제목 자동, 바로 받아 적기'],['diary','오늘 일기','date','오늘 날짜가 들어간 문서'],['check','체크리스트','todo','할 일 목록부터'],['tabledoc','표 문서','table','3×3 표가 있는 문서'],['codedoc','코드 노트','code','코드 블록부터'],['mathdoc','수식 노트','fx','LaTeX 수식부터'],['outline','개요 문서','toc','제목 3단계 뼈대'],['folder','폴더','folder','여러 페이지 묶기']],
 '데이터':[['db:table','표','table','엑셀처럼 행과 열'],['db:board','보드','board','상태별 카드 칸반'],['db:gallery','갤러리','gallery','큰 카드로 모아 보기'],['db:list','리스트','list','간단한 목록'],['db:calendar','캘린더','cal','날짜별 달력'],['db:timeline','타임라인','history','기간을 막대로'],['db:chart','차트','chart','상태별 그래프']],
 '캔버스':[['cv:blank','빈 캔버스','canvas','무한 화면'],['k:visual','무드보드','image','이미지·색·글 모으기'],['k:mind','마인드맵','node','중심 생각에서 가지 뻗기'],['k:sketch','스케치','pen','펜으로 바로 그리기'],['k:story','스토리보드','board','장면 카드로 이야기 구성'],['cv:flow','플로우차트','arrow','순서와 흐름'],['cv:brain','브레인스토밍','sticky','메모지 붙이기'],['cv:tripboard','무드보드','image','사진·자료 모으기']],
 '객체':[],'템플릿':[],
 '가져오기':[['imp:file','파일에서','ul','.md · .txt 파일을 문서로'],['imp:paste','붙여넣기','copy','글을 붙여 넣어 문서로'],['imp:csv','CSV → 표','table','엑셀에서 저장한 CSV를 표로'],['imp:img','사진 여러 장','image','사진을 캔버스에 펼치기'],['imp:backup','백업 불러오기','restore','전체 백업 JSON']]};
let crTab='기본';
function openCreate(){const cur=curPage();const em={사람:'🧑',회사:'🏢',프로젝트:'🚀',책:'📚',영화:'🎬',장소:'📍',아이디어:'💡',목표:'🎯',작업:'✅',사건:'🗓️',제품:'📦',웹사이트:'🌐',자료:'📎',게임:'🎮'};
  CR['객체']=Object.keys(DBV.OBJ||{}).map(n=>['obj:'+n,n,'obj','객체 유형 · 하나하나가 문서로']);
  const body=()=>crTab==='템플릿'?`<div class="tplrow wrapx">${TPL.map(tcard).join('')}</div>`:`<div class="crx">${CR[crTab].map(([k,n,i,d])=>`<button class="cx" data-cr="${k}"><i>${crTab==='객체'?em[n]||'◆':ic(i)}</i><b>${n}</b><small>${d}</small></button>`).join('')}</div>`;
  modal({title:'새로 만들기',cls:'wide crm',html:`<div class="crtop"><input class="inp" id="crName" placeholder="이름 (비워 두면 나중에)"><input class="inp" id="crIcon" placeholder="아이콘" maxlength="4" style="width:84px"><select class="selx" id="crPar"><option value="">맨 위에</option>${cur&&cur.type!=='canvas'?`<option value="${cur.id}">‘${esc(pTitle(cur))}’ 안에</option>`:''}${cur?.parent?`<option value="${cur.parent}" selected>‘${esc(pTitle(P(cur.parent)))}’ 안에 (같은 자리)</option>`:''}</select></div>
    <div class="crwrap"><nav class="crnav">${Object.keys(CR).map(k=>`<button data-crt="${k}" class="${k===crTab?'on':''}">${k}</button>`).join('')}</nav><div class="crbody" id="crBody">${body()}</div></div>`,
  onOpen:()=>{$('#crName').focus();$('#mbody').onclick=e=>{const t=e.target.closest('[data-crt]');if(t){crTab=t.dataset.crt;$$('.crnav button').forEach(b=>b.classList.toggle('on',b===t));$('#crBody').innerHTML=body();return}
      const c=e.target.closest('[data-cr]'),tp=e.target.closest('[data-tpl]');const o={name:$('#crName').value.trim(),icon:$('#crIcon').value.trim(),parent:$('#crPar').value||null};
      if(c){closeModal();makeKind(c.dataset.cr,o)}if(tp){closeModal();useTemplate(tp.dataset.tpl)}}}})}
async function makeKind(k,o){const base={title:o.name||'',icon:o.icon||'',parent:o.parent};const mk=(t,x={})=>create(t,{...base,...x});
  const d=new Date(),ds=`${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`;
  if(k==='doc')return mk('doc');if(k==='quick')return quickNote();if(k==='folder')return mk('folder',{title:o.name||'새 폴더'});
  if(k==='diary')return mk('doc',{title:o.name||ds+' 일기',blocks:T(`date:${today()}\np:`)});
  if(k==='check')return mk('doc',{blocks:T('todo:\ntodo:\ntodo:')});
  if(k==='tabledoc')return mk('doc',{blocks:T('table:,,;,,;,,')});
  if(k==='codedoc')return mk('doc',{blocks:Editor.mdBlocks('```\n\n```')});
  if(k==='mathdoc')return mk('doc',{blocks:[B('math','',{tex:''}),B('p')]});
  if(k==='outline')return mk('doc',{blocks:T('h1:\nh2:\nh3:\np:')});
  if(k.startsWith('db:'))return mk('db',{title:o.name||'새 '+({table:'표',board:'보드',gallery:'갤러리',list:'리스트',calendar:'캘린더',timeline:'타임라인',chart:'차트'})[k.slice(3)],db:DBV.blankWith(k.slice(3))});
  if(k.startsWith('k:'))return MS.kindPage(k.slice(2),o);if(k.startsWith('cv:')){const v=k.slice(3);const p=mk('canvas',{title:o.name||'새 캔버스',cv:Canvas.make(v==='pen'?'blank':v)});if(v==='pen')setTimeout(()=>Canvas.cmd('tool:pen'),200);return p}
  if(k.startsWith('obj:')){const n=k.slice(4);return mk('db',{title:o.name||n,db:DBV.makeObj(n)})}
  if(k==='imp:backup')return importBackup();
  if(k==='imp:paste'){const t=await ask('붙여 넣을 글 (마크다운 가능)',{ph:'여기에 붙여 넣으세요',multi:true});if(t)mk('doc',{title:o.name||t.split('\n')[0].replace(/^#+\s*/,'').slice(0,40),blocks:Editor.mdBlocks(t)});return}
  if(k==='imp:file'){const fs=await pickFile('.md,.txt,text/plain,text/markdown',true);for(const f of fs){const t=await f.text();mk('doc',{title:f.name.replace(/\.(md|txt)$/i,''),blocks:Editor.mdBlocks(t)})}return}
  if(k==='imp:csv'){const[f]=await pickFile('.csv,text/csv');if(!f)return;const rows=parseCSV(await f.text()).filter(r=>r.some(c=>c.trim()));if(!rows.length)return toast('비어 있는 파일이에요');
    const db=DBV.blankWith('table');const tp=db.props.find(x=>x.type==='title');db.props=[tp];tp.name=rows[0][0]||'이름';rows[0].slice(1).forEach(h=>db.props.push({id:uid(),name:h||'열',type:'text'}));
    db.rows=rows.slice(1).map(r=>{const c={};db.props.forEach((pp,i)=>c[pp.id]=r[i]||'');return{id:uid(),c,note:'',created:now(),updated:now()}});db.views.forEach(v=>{delete v.group;delete v.date});db.views=db.views.filter(v=>v.type==='table');db.vid=db.views[0].id;
    mk('db',{title:o.name||f.name.replace(/\.csv$/i,''),db});return toast(`${db.rows.length}줄을 표로 가져왔어요`)}
  if(k==='imp:img'){const fs=await pickFile('image/*',true);if(!fs.length)return;const cv=Canvas.make('blank');let i=0;for(const f of fs){const id=await putBlob(f);cv.items.push({id:uid(),type:'image',x:(i%4)*300,y:Math.floor(i/4)*260,w:280,cap:'',blob:id,name:f.name});i++}mk('canvas',{title:o.name||'사진 보드',cv});return}}
function parseCSV(t){const out=[];let row=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'&&t[i+1]==='"'){f+='"';i++}else if(c==='"')q=false;else f+=c}else if(c==='"')q=true;else if(c===','){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);out.push(row);row=[];f=''}else f+=c}if(f||row.length){row.push(f);out.push(row)}return out}

/* ---------- 내보내기 · 백업 ---------- */
function toMD(p){const h=`# ${pTitle(p)}\n\n`+(p.tags?.length?`태그: ${p.tags.map(t=>'#'+t).join(' ')}\n\n`:'');if(p.type==='doc')return h+Editor.toMD(p.blocks);if(p.type==='db')return h+DBV.toMD(p);if(p.type==='canvas')return h+Canvas.toMD(p);return h+kids(p.id).map(k=>`- ${pTitle(k)}`).join('\n')}
const safe=s=>(s||'문서').replace(/[\\/:*?"<>|]/g,'').slice(0,60)||'문서';
function exportMD(p){saveFile(safe(pTitle(p))+'.md',toMD(p))}
async function blobB64(b){return new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.onerror=()=>r(null);f.readAsDataURL(b)})}
async function backupAll(withMedia){if(withMedia===undefined)return modal({title:'전체 백업',html:'<p style="margin:0">모든 페이지·설정·기록을 JSON 파일 하나로 저장해요.</p><label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" id="bkM" checked style="accent-color:var(--acc);width:18px;height:18px">사진·영상·파일도 함께 넣기 (파일이 커질 수 있어요)</label>',btns:[{t:'취소'},{t:'백업 저장',cls:'pr',fn:()=>{const w=$('#bkM').checked;setTimeout(()=>backupAll(w));}}]});
  toast('백업 파일을 만드는 중…');const out={app:'ULTIMATE NOTE',v:1,at:now(),state:S,versions:V,blobs:{}};
  if(withMedia){const used=new Set();Object.values(S.pages).forEach(p=>JSON.stringify(p).replace(/"(?:src|img|blob)":"([^"]+)"/g,(_,i)=>used.add(i)));for(const id of used){const all=await tx('blobs','readonly',s=>s.get(id));if(all)out.blobs[id]={name:blobs[id]?.name,type:all.type,data:await blobB64(all)}}}
  saveFile(`ultimate-note-백업-${today()}.json`,JSON.stringify(out))}
async function importBackup(){const[f]=await pickFile('.json,application/json');if(!f)return;let o;try{o=JSON.parse(await f.text())}catch(e){return toast('백업 파일을 읽을 수 없어요')}if(!o?.state?.pages)return toast('ULTIMATE NOTE 백업 파일이 아니에요');
  const n=Object.keys(o.state.pages).length;modal({title:'백업 불러오기',html:`<p style="margin:0">백업에 페이지 ${n}개가 있어요. 어떻게 불러올까요?</p><p class="note">‘합치기’는 지금 내용은 그대로 두고 백업의 페이지를 더해요. 같은 페이지가 있으면 더 최근에 수정된 쪽을 남겨요.</p>`,
    btns:[{t:'취소'},{t:'모두 바꾸기',cls:'dg',fn:()=>{doImport(o,true)}},{t:'합치기',cls:'pr',fn:()=>{doImport(o,false)}}]})}
async function doImport(o,replace){for(const[id,b]of Object.entries(o.blobs||{})){try{const r=await fetch(b.data);const bl=await r.blob();await tx('blobs','readwrite',s=>s.put(bl,id));blobs[id]={url:URL.createObjectURL(bl),name:b.name,type:b.type,size:bl.size}}catch(e){}}
  if(replace){S={...freshState(),...o.state,settings:{...defSettings(),...o.state.settings}};V=o.versions||{}}else{Object.values(o.state.pages).forEach(p=>{const c=S.pages[p.id];if(!c||c.updated<p.updated)S.pages[p.id]=p});Object.assign(V,o.versions||{})}
  await flush();tx('kv','readwrite',s=>s.put(JSON.stringify(V),'versions'));applySettings();go('home');toast('백업을 불러왔어요')}

/* ---------- 설정 ---------- */
const PRESETS={focus:{n:'집중 모드',side:false,panel:false,width:'normal'},write:{n:'글쓰기 모드',side:false,panel:false,width:'narrow'},study:{n:'공부 모드',side:true,panel:true,width:'normal',tab:'toc'},research:{n:'자료 조사 모드',side:true,panel:true,width:'wide',tab:'links'},project:{n:'프로젝트 관리 모드',side:true,panel:false,width:'wide'}};
function applyPreset(k){const p=PRESETS[k]||S.settings.presets.find(x=>x.id===k);if(!p)return;S.settings.side=p.side;S.settings.panel=p.panel;S.settings.width=p.width;if(p.tab)ui.ptab=p.tab;applySettings();save();render();toast(`${p.n}로 바꿨어요`)}
function applySettings(){S.settings.one=1;S.settings.simple=1;const s=S.settings,r=document.documentElement;s.theme='light';r.dataset.theme='light';if(s.accent)r.style.setProperty('--acc',s.accent);else r.style.removeProperty('--acc');r.dataset.font=s.font;r.style.setProperty('--fs',s.fs+'px');
  r.style.setProperty('--docw',{narrow:'680px',normal:'760px',wide:'960px',full:'100%'}[s.width]||'760px');r.style.setProperty('--sideW',s.sideW+'px');r.style.setProperty('--panelW',s.panelW+'px');
  document.body.classList.toggle('noanim',!s.anim);document.body.classList.toggle('noside',!s.side);document.body.classList.toggle('panel',!!s.panel);document.body.classList.toggle('noai',!s.mods?.ai);document.body.classList.toggle('railc',!!s.railc);document.body.classList.toggle('simple',s.simple!==0);document.body.classList.toggle('one',s.one!==0);document.documentElement.lang=s.lang==='en'?'en':'ko';document.body.classList.toggle('nograph',!s.mods?.graph)}
function toggleSide(v){S.settings.side=v??!S.settings.side;document.body.classList.toggle('drawer',innerWidth<=860&&S.settings.side);applySettings();save()}
function toggleTheme(){S.settings.theme='light';applySettings();toast('Achernar는 밝은 화면으로 고정돼 있어요')}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#modal [data-lang]');if(b&&typeof AchLang!=='undefined'&&AchLang.lang!==b.dataset.lang)AchLang.set(b.dataset.lang)});
function openSettings(tab='general'){const s=S.settings;const tabs=[['general','일반'],['data','데이터'],['keys','단축키']];
  const seg=(k,opts)=>`<div class="seg" data-set="${k}">${opts.map(([v,n])=>`<button data-v="${v}" class="${String(s[k])===String(v)?'on':''}">${n}</button>`).join('')}</div>`;let h='';
  if(tab==='general')h=`<div class="setg"><label>강조 색</label><div class="sws">${['#2563EB','#3B5BDB','#2B8A3E','#C92A2A','#D9480F','#212529'].map(c=>`<button data-acc="${c}" class="${s.accent===c?'on':''}" style="--v:${c}" aria-label="${c}"></button>`).join('')}<input type="color" id="accIn" value="${s.accent}" aria-label="직접 고르기"></div>
    <label>글꼴</label>${seg('font',[['sans','고딕'],['serif','명조'],['mono','고정폭']])}<label>글자 크기</label>${seg('fs',[[14,'작게'],[16,'보통'],[18,'크게'],[20,'아주 크게']])}<label>애니메이션</label>${seg('anim',[[true,'켜기'],[false,'끄기']])}<label>언어</label><div class="seg"><button data-lang="ko" class="${(typeof AchLang!=='undefined'&&AchLang.lang==='en')?'':'on'}">한국어</button><button data-lang="en" class="${(typeof AchLang!=='undefined'&&AchLang.lang==='en')?'on':''}">English</button></div></div>`;
  if(tab==='side')h=`<p class="note">사이드바에 보일 항목을 고르세요.</p><div class="chkl">${[['home','홈'],['quick','빠른 메모'],['recent','최근 열어본 문서'],['favs','즐겨찾기'],['all','모든 메모'],['shared','공유된 문서'],['trash','휴지통'],['tags','태그'],['graph','그래프 뷰'],['linked','링크된 문서'],['archive','아카이브']].map(([k,n])=>`<label><input type="checkbox" data-si="${k}" ${s.sideItems[k]?'checked':''}>${n}</label>`).join('')}</div><div class="setg" style="margin-top:16px"><label>사이드바 너비</label><input type="range" min="200" max="420" value="${s.sideW}" data-rng="sideW"><label>오른쪽 패널 너비</label><input type="range" min="240" max="480" value="${s.panelW}" data-rng="panelW"></div>`;
  if(tab==='layout')h=`<p class="note">자주 쓰는 화면 구성을 한 번에 바꿔요.</p><div class="cr-grid">${[...Object.entries(PRESETS).map(([k,v])=>[k,v.n]),...s.presets.map(p=>[p.id,p.n])].map(([k,n])=>`<button class="cr" data-pre="${k}" style="--c:var(--acc)"><i>${ic('layout')}</i><b>${esc(n)}</b></button>`).join('')}</div><button class="btn ghost" id="preSave" style="margin-top:14px">${ic('plus')}지금 화면 구성을 프리셋으로 저장</button>`;
  if(tab==='status')h=`<p class="note">문서 상태와 데이터베이스 ‘상태’ 속성에서 쓰는 이름이에요. 이름을 바꾸면 이미 붙은 상태도 함께 바뀌어요.</p>${s.statuses.map((x,i)=>`<div style="display:flex;gap:8px;margin-bottom:6px;align-items:center"><input type="color" value="${x.c}" data-stc="${i}" aria-label="색"><input class="inp" value="${esc(x.k)}" data-stn="${i}" aria-label="상태 이름"><button class="ib" data-std="${i}" aria-label="삭제">${ic('trash')}</button></div>`).join('')}<button class="btn ghost sm" id="stAdd">${ic('plus')}상태 추가</button>`;
  if(tab==='ai')h=`<p style="margin-top:0">AI 기능(요약, 다듬기, 맞춤법, 번역, 아이디어 확장, 문서 기반 질문)은 <b>Claude</b>가 처리해요.</p><p class="note">AI를 쓰면 선택한 글이나 문서 내용이 Claude에게 전달돼요. 이 앱을 claude.ai에서 열었을 때만 작동하고, 연결이 없으면 버튼이 꺼져 있어요. 가짜 결과는 보여 주지 않아요.</p><div class="setg"><label>AI 기능 사용</label>${seg('aiOk',[[true,'동의하고 켜기'],[false,'끄기']])}<label>연결 상태</label><span>${AI?'<b style="color:var(--ok)">연결됨</b>':'연결 안 됨 (claude.ai 밖에서 열었어요)'}</span></div>`;
  if(tab==='data')h=`<div class="cr-grid"><button class="cr" data-d="backup" style="--c:#10B981"><i>${ic('dl')}</i><b>전체 백업 저장</b><small>JSON · 첨부 포함 선택</small></button><button class="cr" data-d="import" style="--c:#6478E8"><i>${ic('ul')}</i><b>백업 불러오기</b><small>합치기 또는 바꾸기</small></button><button class="cr" data-d="reset" style="--c:#E5484D"><i>${ic('trash')}</i><b>모든 데이터 지우기</b><small>되돌릴 수 없어요</small></button></div><p class="note" style="margin-top:14px"><a href="privacy.html" target="_blank" rel="noopener">개인정보처리방침</a> · 캔버스는 이 브라우저에 저장돼서 인터넷이 끊겨도 쓸 수 있어요. 다른 기기로 옮길 땐 백업 파일을 쓰세요. 공유한 캔버스는 로그인하면 어디서든 열려요.</p>`;
  if(tab==='keys')h=`<div class="keys"><span>메모 쓰기</span><span><kbd>빈 곳 더블클릭</kbd></span><span>카드 넣기 메뉴</span><span><kbd>/</kbd></span><span>문자표 (글 쓰는 중)</span><span><kbd>\\</kbd></span><span>문자표 전체</span><span><kbd>Ctrl+F10</kbd></span><span>선택 · 펜 · 형광펜 · 지우개</span><span><kbd>V · P · H · E</kbd></span><span>메모 · 포스트잇 · 마인드맵 · 도형</span><span><kbd>T · S · M · R</kbd></span><span>마인드맵 가지 · 옆 가지</span><span><kbd>Tab / Shift+Enter</kbd></span><span>되돌리기 / 다시</span><span><kbd>Ctrl+Z / Ctrl+Y</kbd></span><span>복사 · 붙여넣기 · 복제</span><span><kbd>Ctrl+C · Ctrl+V · Ctrl+D</kbd></span><span>묶기</span><span><kbd>Ctrl+G</kbd></span><span>지우기</span><span><kbd>Delete</kbd></span><span>조금씩 옮기기 (크게)</span><span><kbd>방향키 (Shift)</kbd></span><span>확대·축소 · 옆으로 이동</span><span><kbd>휠 · Shift+휠</kbd></span><span>화면 이동</span><span><kbd>Space+끌기</kbd></span><span>전체 보기 · 100%</span><span><kbd>0 · 1</kbd></span><span>선택 해제</span><span><kbd>Esc</kbd></span></div>`;
  if(tab==='mods'){const M=[['graph','그래프 뷰','문서 연결을 지도처럼'],['ai','AI 도우미','요약·다듬기·질문 (claude.ai)'],['peek','미리보기 카드','링크에 마우스를 올리면'],['remind','마감 알림','데이터베이스 날짜 기준 종 알림'],['walk','오늘의 지식 산책','홈에서 오래된 문서 다시 만나기'],['sync','클라우드 동기화 (beta)','claude.ai에서 로그인하면 기기 간 동기화']];
    h=`<p class="note" style="margin-top:0">안 쓰는 기능은 꺼서 화면을 단순하게 하세요.</p><div class="modl">${M.map(([k,n,d])=>`<label class="modi"><span><b>${n}</b><small>${d}</small></span><input type="checkbox" data-mod="${k}" ${s.mods[k]?'checked':''}></label>`).join('')}</div><p class="note">동기화 상태: <b id="syncSt2">${{local:'이 기기에만 저장',off:'꺼짐',on:'클라우드 동기화됨',busy:'동기화 중',bad:'실패 (기기엔 저장됨)'}[Sync.status()]}</b></p>
    <h4>내 조각 (스니펫)</h4><p class="note">자주 쓰는 글을 저장해 두고 / 메뉴에서 바로 넣어요.</p>${(S.snips||[]).map(x=>`<div class="snr"><b>${esc(x.n)}</b><small>${esc(x.md.slice(0,40))}</small><button class="ib sm" data-sdel="${x.id}" aria-label="삭제">${ic('trash')}</button></div>`).join('')}<button class="btn ghost sm" data-sadd>${ic('plus')}조각 추가</button>`}
  modal({title:'설정',cls:'mid',html:`<div class="tabsx">${tabs.map(([k,n])=>`<button class="chip${k===tab?' on':''}" data-stab="${k}">${n}</button>`).join('')}</div>${h}`,btns:[{t:'닫기',cls:'pr'}],
    onOpen:()=>{const mb=$('#mbody');mb.addEventListener('change',e=>{const m=e.target.dataset.mod;if(!m)return;s.mods[m]=e.target.checked?1:0;save();if(m==='sync')Sync.toggle(!!s.mods.sync);applySettings();render()});mb.onclick=async e=>{const t=e.target.closest('[data-stab]');if(t)return openSettings(t.dataset.stab);
      const kr=e.target.closest('[data-krec]');if(kr)return Keys.record(kr.dataset.krec,()=>openSettings('keys'));if(e.target.closest('[data-kreset]')){s.keys={};save();return openSettings('keys')}
      if(e.target.closest('[data-sadd]')){const n=await ask('조각 이름',{ph:'예: 회의 시작 문구'});if(!n)return openSettings('mods');const md=await ask('넣을 내용 (마크다운 가능)',{ph:'- 참석자:\n- 안건:'});if(md){(S.snips??=[]).push({id:uid(),n,md});save()}return openSettings('mods')}
      const sdl=e.target.closest('[data-sdel]');if(sdl){S.snips=S.snips.filter(x=>x.id!==sdl.dataset.sdel);save();return openSettings('mods')}
      const sg=e.target.closest('[data-set] button');if(sg){const k=sg.closest('[data-set]').dataset.set;let v=sg.dataset.v;if(v==='true')v=true;else if(v==='false')v=false;else if(/^\d+$/.test(v))v=+v;if(k==='aiOk'&&v&&!AI)toast('지금은 AI 연결이 없어요. claude.ai에서 열면 작동해요');s[k]=v;applySettings();if(k==='lang'){['#status','#undoBtn','#redoBtn','#expBtn'].forEach(x=>$(x)?.remove());MS.init();render();return openSettings('general')}save();render();return openSettings(tab)}
      const ac=e.target.closest('[data-acc]');if(ac){s.accent=ac.dataset.acc;applySettings();save();return openSettings(tab)}
      const pr=e.target.closest('[data-pre]');if(pr){closeModal();return applyPreset(pr.dataset.pre)}
      if(e.target.closest('#preSave')){const n=await ask('프리셋 이름',{ph:'예: 내 작업 모드'});if(n){s.presets.push({id:'p'+uid(),n,side:s.side,panel:s.panel,width:s.width,tab:ui.ptab});save();toast('프리셋을 저장했어요')}return openSettings('layout')}
      const sd=e.target.closest('[data-std]');if(sd){if(s.statuses.length<=1)return toast('상태는 하나 이상 있어야 해요');s.statuses.splice(+sd.dataset.std,1);save();return openSettings('status')}
      if(e.target.closest('#stAdd')){s.statuses.push({k:'새 상태',c:TAGC[s.statuses.length%TAGC.length]});save();return openSettings('status')}
      const d=e.target.closest('[data-d]');if(d){const k=d.dataset.d;closeModal();if(k==='backup')backupAll();if(k==='import')importBackup();if(k==='mdall')saveFile(`ultimate-note-${today()}.md`,live().filter(p=>p.type!=='folder').map(toMD).join('\n\n---\n\n'));
        if(k==='reset'&&await confirmDlg('모든 데이터를 지울까요?','모든 페이지·설정·기록이 사라져요. 먼저 백업을 저장해 두는 걸 권해요.','모두 지우기',1)){S=freshState();V={};await tx('blobs','readwrite',s2=>s2.clear());await flush();tx('kv','readwrite',s2=>s2.put('{}','versions'));applySettings();go('home');toast('모두 지웠어요')}}};
      mb.oninput=e=>{const t=e.target;if(t.id==='accIn'){s.accent=t.value;applySettings();save()}if(t.id==='wsIn'){S.ws=t.value||'내 워크스페이스';save();renderSide();crumbs()}
        if(t.dataset.si){s.sideItems[t.dataset.si]=t.checked?1:0;save();renderSide()}if(t.dataset.rng){s[t.dataset.rng]=+t.value;applySettings();save()}
        if(t.dataset.stn!==undefined){const x=s.statuses[+t.dataset.stn],old=x.k;x.k=t.value;live().forEach(p=>{if(p.status===old)p.status=t.value});save()}if(t.dataset.stc!==undefined){s.statuses[+t.dataset.stc].c=t.value;save()}}}})}
const KEYS=[['새 문서','Ctrl N'],['새 폴더','Ctrl Shift N'],['빠른 실행 · 검색','Ctrl P'],['명령 팔레트','Ctrl Shift P'],['전체 검색','Ctrl Shift F'],['링크 넣기 (문서에서)','Ctrl K'],['문서 안 찾기 (브라우저)','Ctrl F'],['되돌리기 / 다시','Ctrl Z / Ctrl Y'],['저장 상태 확인','Ctrl S'],['굵게 · 기울임 · 밑줄','Ctrl B · I · U'],['사이드바 접기','Ctrl \\'],['뒤로 / 앞으로','Alt ← / Alt →'],['블록 메뉴','/'],['문서 연결','[['],['들여쓰기','Tab / Shift Tab'],['블록 이동','Alt Shift ↑ / ↓'],['블록 복제','Ctrl D']];
function showKeys(){modal({title:'단축키 · 도움말',cls:'mid',html:`<div class="keys">${KEYS.map(([a,b])=>`<span>${a}</span><kbd>${b}</kbd>`).join('')}</div><h4>처음이라면</h4><ul style="margin:0;padding-left:20px;line-height:1.8"><li>문서에서 <b>/</b>를 누르면 모든 블록을 고를 수 있어요.</li><li><b>[[</b>를 입력하면 다른 문서를 연결하고, 오른쪽 패널에서 백링크를 볼 수 있어요.</li><li>사이드바 항목은 끌어서 순서를 바꾸거나 다른 페이지 안에 넣을 수 있어요.</li><li>어디서든 <b>오른쪽 클릭</b>하면 그 자리에서 할 수 있는 일이 나와요.</li></ul>`,btns:[{t:'닫기',cls:'pr'}]})}

/* ---------- AI ---------- */
async function aiAsk(prompt,o={}){if(!AI)throw{code:'none'};if(!S.settings.aiOk){const ok=await confirmDlg('AI를 쓸까요?','AI 기능을 쓰면 선택한 글이나 문서 내용이 <b>Claude</b>에게 전달돼요. 동의하면 설정에서 언제든 끌 수 있어요.','동의하고 쓰기');if(!ok)throw{code:'declined'};S.settings.aiOk=true;save()}
  toast('AI가 작업 중이에요…',{ms:60000});try{const r=await AI(prompt,{modelTier:o.tier||'quick'});$('#toast').hidden=true;return(r.text||'').trim()}catch(e){$('#toast').hidden=true;throw e}}
function aiErr(e){if(e?.code==='declined')return;toast(e?.code==='none'?'AI는 claude.ai에서 열었을 때만 쓸 수 있어요':e?.code==='rate_limited'?'요청이 많아요. 잠시 후 다시 해 주세요':e?.code==='not_granted'?'AI 사용이 허용되지 않았어요':'AI가 답하지 못했어요. 다시 시도해 주세요')}

/* ---------- 이벤트 · 부팅 ---------- */
function bindGlobal(){
  $('#railList').innerHTML=RAIL.map(([k,n,i])=>`<button class="ritem" data-rail="${k}"><span class="ri">${ic(i)}</span><span>${n}</span></button>`).join('');$('.ritem[data-rail=settings] .ri').innerHTML=ic('settings');
  $('#rail').onclick=e=>{const b=e.target.closest('[data-rail]');if(b){const k=b.dataset.rail;({home:()=>go('home'),pages:()=>go('all'),db:()=>go('all:db'),canvas:()=>go('all:canvas'),graph:()=>go('graph'),tags:()=>go('tags'),trash:()=>go('trash'),settings:()=>openSettings(),drawer:()=>toggleSide(),objects:()=>go('objects')})[k]?.()}if(e.target.closest('#railNew'))openCreate();if(e.target.closest('#me')){const r=e.target.closest('#me').getBoundingClientRect();Auth.menuAt(r.right+8,r.top-260)}};
  $('#sideBody').onclick=sideClick;sideDnD();$('#sideFoot').onclick=e=>{if(e.target.closest('[data-a=help]'))showKeys()};
  $('#wsBtn').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();menu(r.left,r.bottom+4,[{h:'워크스페이스'},{t:S.ws,i:'check',on:1,fn:()=>{}},{t:'이름 바꾸기',i:'edit',fn:()=>ask('워크스페이스 이름',{val:S.ws}).then(v=>{if(v){S.ws=v;save();renderSide();crumbs()}})},{t:'새 워크스페이스 (개발 예정)',i:'plus',dis:'개발 예정'}])};
  $('#sideClose').onclick=()=>toggleSide(false);$('#navBtn').onclick=()=>toggleSide();$('#scrim').onclick=()=>toggleSide(false);
  $('#backBtn').onclick=back;$('#fwdBtn').onclick=fwd;$('#searchBtn').onclick=()=>openPalette();$('#createBtn').onclick=()=>openCreate();
  $('#panelBtn').onclick=()=>togglePanel();$('#ribbon').addEventListener('mousedown',e=>{if(e.target.closest('[data-rb]'))e.preventDefault()});$('#ribbon').onclick=ribClick;$('#ribbon').addEventListener('change',e=>{if(e.target.dataset.rs!==undefined&&e.target.value){Editor.style(e.target.value);e.target.value=''}});$('#sdock').onclick=dockClick;$('#bellBtn').onclick=e=>{const r=e.currentTarget.getBoundingClientRect();Remind.open(r.right-260,r.bottom+6)};$('#shareBtn').onclick=()=>{const p=curPage();if(!p)return go('shared');p.sharedAt?Sync.unshare(p):Sync.share(p)};$('#rpanel').onclick=panelClick;
  $('#pageMenuBtn').onclick=e=>{const p=curPage();if(!p)return;const r=e.currentTarget.getBoundingClientRect();const extra=p.type==='doc'?[{t:p.wide?'보통 폭으로':'전체 폭으로',i:'layout',fn:()=>{p.wide=!p.wide;save();render()}},...(AI?[{t:'AI: 이 문서 요약',i:'ai',ai:1,fn:()=>Editor.aiPage('sum')},{t:'AI: 문서 구조 추천',i:'ai',ai:1,fn:()=>Editor.aiPage('struct')},{t:'AI: 이 문서에 질문하기',i:'ai',ai:1,fn:()=>Editor.aiPage('qa')},{t:'AI: 관련 문서 추천',i:'ai',ai:1,fn:()=>Editor.aiPage('rel')}]:[{t:'AI 기능 (claude.ai에서 열면 켜져요)',i:'ai',dis:'연결 없음'}]),'-']:[];pageMenu(p,0,0);const items=[...extra,...MENU.items];closeMenu();menu(r.right-240,r.bottom+4,items)};
  $('#menu').onclick=menuClick;$('#mbody').addEventListener('click',()=>{});$('#modal').onclick=e=>{if(e.target.id==='modal'||e.target.closest('[data-x]'))closeModal();const b=e.target.closest('[data-bi]');if(b&&MOD){const it=MOD.btns[+b.dataset.bi];const r=it.fn?.();if(r!==false){const f=MOD.onClose;MOD.onClose=null;closeModal();}}};
  document.addEventListener('pointerdown',e=>{if(!$('#menu').hidden&&!e.target.closest('#menu'))closeMenu();if(!$('#pop').hidden&&!e.target.closest('#pop'))hidePop()},true);
  $('#main').addEventListener('click',e=>{const o=e.target.closest('[data-open]');if(o){go('page:'+o.dataset.open);return}const g=e.target.closest('[data-go]');if(g&&!e.target.closest('.be')){go(g.dataset.go);return}const q=e.target.closest('[data-q]');if(q){runQuick(q.dataset.q);return}const cp2=e.target.closest('[data-pair]');if(cp2){const[x,y]=cp2.dataset.pair.split(',');connectPair(P(x),P(y));return}const mo=e.target.closest('[data-mkobj]');if(mo){const n=mo.dataset.mkobj;create('db',{title:n,icon:mo.dataset.em||'',db:DBV.makeObj(n)});return}const t=e.target.closest('[data-tpl]');if(t&&!e.target.closest('#modal')){useTemplate(t.dataset.tpl);return}const a=e.target.closest('[data-a]');if(a){if(a.dataset.a==='search')openPalette();if(a.dataset.a==='tpls')openTemplates();if(a.dataset.a==='create')openCreate()}});
  $('#main').addEventListener('contextmenu',e=>{const o=e.target.closest('[data-open]');if(o){e.preventDefault();pageMenu(P(o.dataset.open),e.clientX,e.clientY)}});
  $('#crumbs').onclick=e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go)};
  // 크기 조절
  $$('.resizer').forEach(r=>r.addEventListener('pointerdown',e=>{e.preventDefault();const k=r.dataset.rs==='side'?'sideW':'panelW',x0=e.clientX,w0=S.settings[k];r.classList.add('act');
    const mv=ev=>{const d=ev.clientX-x0;S.settings[k]=cl(k==='sideW'?w0+d:w0-d,200,480);applySettings()},upf=()=>{r.classList.remove('act');removeEventListener('pointermove',mv);removeEventListener('pointerup',upf);save();Canvas.resize?.()};addEventListener('pointermove',mv);addEventListener('pointerup',upf)}));
  addEventListener('keydown',e=>{
    if(!$('#modal').hidden){if(e.key==='Escape'){e.preventDefault();closeModal()}return}
    if(!$('#menu').hidden&&menuKey(e))return;
    const mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();const act=(typeof One!=='undefined'&&One.on())?null:Keys.match(e);
    if(act){const A={newDoc:()=>create('doc'),newFolder:()=>create('folder',{title:'새 폴더',icon:'📁'}),palette:()=>openPalette('all'),cmd:()=>openPalette('cmd'),search:()=>openPalette('all'),quick:quickNote,drawer:()=>toggleSide(),panel:()=>togglePanel(),save:()=>{flush();toast('모든 변경 사항은 자동으로 저장돼요 · 방금 저장했어요')},back,fwd,graph:()=>go('graph'),home:()=>go('home')};e.preventDefault();return A[act]()}
    if(VIEW?.onKey?.(e))return;
    if(e.key==='Escape'){if(S.settings.side)toggleSide(false);ui.msel.clear();renderSide()}});
  addEventListener('beforeunload',()=>{flush();const p=curPage();if(p&&verDirty[p.id])snapVersion(p)});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
  addEventListener('online',()=>toast('다시 온라인이에요. 데이터는 이 기기에 안전하게 저장돼 있어요'));addEventListener('offline',()=>toast('오프라인이에요. 계속 쓰셔도 이 기기에 저장돼요'));
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(route==='graph')render()})}
function seedGuide2(){const g=newPage('doc',{title:'Achernar 기능 가이드',icon:'🧭',tags:['가이드'],blocks:T(`callout:🧭|Achernar는 생각을 글·그림·카드·지도로 자유롭게 펼치는 창작 공간이에요. 이 가이드는 언제든 지워도 되고, 왼쪽 ‘노트’에서 다시 찾을 수 있어요.
h2:처음 30초
todo:왼쪽 **캔버스** 를 열고 빈 곳을 **더블클릭** 해 글을 써 보세요
todo:사진이나 파일을 캔버스로 **끌어다 놓아** 보세요
todo:카드를 클릭하면 오른쪽에 **속성 패널** 이 열려요 (위치·크기·회전·투명도·색·레이어)
todo:**Ctrl+Z** 실행 취소 · **Ctrl+Shift+Z** 다시 실행 · **Ctrl+0** 화면 맞춤
h2:✨ 생각 변신
p:캔버스에서 카드를 여러 개 고르고 위쪽 막대의 **변신** 을 누르세요. 마인드맵·체크리스트·타임라인·스토리보드·표 중에서 고르면 미리 보기가 나와요.
p:만들면 **원본은 그대로** 두고 새 공간이 생기며, 원본 옆에 새 공간으로 가는 연결 카드가 놓여요.
h2:🌿 만약에? (갈래)
p:카드를 오른쪽 클릭 → **만약에?** 를 누르면 복제본이 옆 갈래로 생기고 점선으로 이어져요. 갈래마다 다르게 고쳐 쓰세요.
p:오른쪽 클릭 → **갈래 나란히 비교** 로 한눈에 보고, 마음에 드는 갈래에 **★ 이 갈래로 고르기** 를 붙여요.
h2:🎲 아이디어 믹서
p:카드를 2~5개 고르고 **믹서** 를 누르면 각 카드에서 단어를 하나씩 뽑아 ‘농구 × 음악 × 실패’ 같은 새 조합 카드를 만들어요. 다시 누를 때마다 바뀌어요.
h2:🌤 분위기 모드
p:아래 상태 표시줄 오른쪽 버튼으로 바꿔요.
ul:**집중** — 메뉴가 모두 사라지고 작업만 남아요 (Esc로 돌아오기)
ul:**영감** — 배경이 은은해지고 예전에 쓴 생각 하나가 떠올라요
ul:**자유 창작** — 종이 질감 배경에 펜이 바로 켜져요
h2:🗺 스토리 분기 지도
p:왼쪽 **스토리** 에서 스토리보드를 만들고, 장면마다 **다음 장면** 칸에 이어질 장면을 하나 이상 연결하세요.
p:문서 메뉴(⋯) 또는 스토리 화면의 **분기 지도** 를 누르면 갈래가 캔버스 지도로 그려지고, 결말마다 색이 달라요.
h2:🎨 색상 연구실
p:캔버스의 사진을 오른쪽 클릭 → **색 5개 뽑기**. 색 견본 카드가 사진 아래에 놓이고, 누르면 HEX가 복사돼요.
p:**팔레트로 저장** 하면 어느 캔버스에서든 속성 패널의 ‘내 팔레트’로 카드 색을 칠할 수 있어요.
h2:🕰 기억 타임라인
p:왼쪽 **최근** 을 누르면 날짜 띠가 나와요. 슬라이더를 옮기면 그날 만들고 고친 것들이 미리 보기로 펼쳐지고, 그 시점 **버전으로 되돌릴** 수 있어요.
h2:💡 영감의 벽
p:어느 화면에서든 **Ctrl+Shift+I** — 캔버스에서 고른 카드, 문서에서 드래그한 글이 ‘영감의 벽’ 캔버스에 차곡차곡 꽂혀요. 아무것도 안 골랐다면 글·링크·색(#2563EB)을 직접 넣을 수 있어요.
h2:✏️ 낙서 → 다이어그램
p:캔버스에서 펜으로 동그라미(또는 네모)를 몇 개 그리고 선으로 이어 보세요. 그다음 **올가미** 로 둘러싸고 **다이어그램으로** 를 누르면 동그라미는 노드, 선은 화살표 연결선이 돼요. (아무것도 안 고르면 캔버스 전체 낙서를 바꿔요)
h2:🧰 크리에이티브 랩 · 도구 카드
p:왼쪽 **크리에이티브 랩** 에서 영화 기록장·게임 라이브러리 같은 나만의 도구를 만들어요. 칸은 숫자·날짜·체크·선택·파일·관계·수식까지 자유롭게.
p:도구의 문서 메뉴(⋯) → **도구 카드로 내보내기** 를 하면 칸 구성만 담긴 파일이 저장돼요. 친구는 크리에이티브 랩의 **도구 카드 가져오기** 로 그대로 쓸 수 있어요.
h2:🗂 그 밖의 공간
ul:**비주얼** 무드보드 · **마인드맵** 중심 생각에서 가지 뻗기 (Tab 하위, Enter 형제) · **스케치** 펜으로 바로 그리기
ul:**미디어** 모든 사진·영상·소리·파일 모음 · **라이브러리** 모든 작업 · **즐겨찾기**
ul:**설정** — 언어(한국어/English), 시작 화면, 테마, 강조 색, 단축키, 백업
h2:🖥 데스크톱 앱
p:Achernar를 Windows 프로그램(.exe)으로 만드는 Tauri 프로젝트가 따로 있어요. 프로젝트 안의 README 순서대로 하면 돼요.`)});return g}

function seedGuide(){const g=newPage('doc',{title:'사용 가이드',icon:'📘',blocks:T(`callout:👋|처음 오셨네요. 이 문서는 사용법만 담은 가이드예요. 다 읽었으면 지워도 돼요.
h2:1. 만들기
p:왼쪽 위 **+** 나 아래 **새로** 를 누르면 문서·표·보드·캘린더·캔버스·객체·템플릿·가져오기를 고를 수 있어요.
h2:2. 쓰기
p:글 중간에 **/** 를 치면 넣을 수 있는 블록이 나와요. 위쪽 도구 막대로도 넣을 수 있어요.
p:**[[** 를 치면 다른 노트와 이어져요. 이어진 노트는 그래프에서 보여요.
h2:3. 찾기
p:**Ctrl+P** 나 아래 **찾기** 로 모든 노트·명령을 찾아요.
h2:4. 정리
p:아래 **서랍** 에 모든 노트가 있어요. 끌어서 다른 노트 안에 넣을 수 있어요.
p:어디서든 **오른쪽 클릭** 하면 그 자리에서 할 수 있는 일이 나와요.
h2:5. 계정과 저장
p:왼쪽 아래 동그란 버튼에서 **이 기기 계정** 을 만들면 열 때 비밀번호를 물어봐요. 모든 내용은 자동 저장되고, 다시 열면 마지막 화면에서 이어져요.`)});S.recent=[g.id];S.lastRoute='page:'+g.id}

function seed(){S=freshState();const mk=(type,o)=>newPage(type,o);
  const home=mk('doc',{title:'시작하기',icon:'👋',tags:['가이드'],blocks:T(`callout:✨|**ULTIMATE NOTE**에 오신 걸 환영해요. 문서·데이터베이스·캔버스·그래프가 하나로 이어진 작업 공간이에요.
h2:30초 사용법
todo:아무 줄에서 **/** 를 눌러 블록을 골라 보세요 (제목, 할 일, 표, 코드, 사진…)
todo:**[[** 를 입력해 다른 문서를 연결해 보세요 — 예: [[사업 프로젝트]]
todo:블록 왼쪽의 점 여섯 개를 끌어 순서를 바꿔 보세요
todo:오른쪽 위 패널 버튼으로 목차·백링크·기록을 열어 보세요
h2:둘러보기
ul:[[작업 관리]] — 표·보드·캘린더로 보는 데이터베이스
ul:[[아이디어 캔버스]] — 무한 화면 위 마인드맵
ul:[[독서 기록]] — 갤러리 보기
toggle:단축키가 궁금하다면|Ctrl+P 검색 · Ctrl+N 새 문서 · Ctrl+K 링크 · Ctrl+\\ 사이드바
quote:예시 내용이에요. 마음껏 고치고 지우세요.`)});
  const biz=mk('doc',{title:'사업 프로젝트',icon:'🚀',tags:['사업'],blocks:T(`p:앱으로 하는 첫 사업을 준비하는 공간이에요.
toc
h2:하위 문서
ul:[[사업 아이디어]] · [[시장 조사]] · [[경쟁사 분석]]
ul:[[마케팅 전략]] · [[회의록]] · [[개발 계획]]
h2:이번 주 할 일
todo:[[시장 조사]] 설문 10명 받기
done:[[사업 아이디어]] 한 문장으로 정리`)});
  const kidsT=[['사업 아이디어','💡','callout:💡|한 문장: 사람들이 자기 생각을 자유롭게 펼치고 연결하는 노트\nh2:왜 필요할까\np:메모 앱마다 쓰는 방식이 달라 자료가 흩어져요.\np:관련: [[시장 조사]]'],['시장 조사','📊','h2:조사 질문\nul:어떤 메모 앱을 쓰나요?\nul:무엇이 불편한가요?\nh2:결과\ntable:응답,인원;노션,4;메모장,3;원노트,2\np:다음: [[경쟁사 분석]]'],['경쟁사 분석','🔎','table:앱,강점,약점;노션,데이터베이스,무거움;옵시디언,링크와 그래프,배우기 어려움;원노트,자유 배치,정리 어려움\np:참고: [[마케팅 전략]]'],['마케팅 전략','📣','h2:채널\nul:인스타그램 짧은 영상\nul:학교 커뮤니티\nquote:한 줄 메시지: 생각을 펼치는 노트'],['회의록','🤝',`date:${today()}\nh2:결정 사항\nul:[[개발 계획]] 1단계부터 시작`]];
  kidsT.forEach(([t,i,b])=>mk('doc',{title:t,icon:i,parent:biz.id,tags:['사업'],blocks:T(b)}));
  const dev=mk('doc',{title:'개발 계획',icon:'🛠️',parent:biz.id,tags:['사업','개발'],blocks:T('h2:단계\nol:핵심 기반 — UI, 블록 편집기, 저장\nol:고급 문서 — 링크, 태그, 템플릿\nol:데이터베이스·캔버스·그래프\ntoggle:기술 메모|IndexedDB 로컬 저장, 블록 단위 데이터 구조')});
  [['UI 설계','🎨','p:레일 + 사이드바 + 작업 영역 + 오른쪽 패널'],['기능 명세서','📋','todo:슬래시 명령\ntodo:백링크\ntodo:그래프 뷰'],['개발 진행 상황','📈','done:1단계 완료\ntodo:2단계 진행 중']].forEach(([t,i,b])=>mk('doc',{title:t,icon:i,parent:dev.id,tags:['개발'],blocks:T(b)}));
  mk('db',{title:'작업 관리',icon:'✅',db:DBV.make('tasks'),tags:['사업']});
  mk('canvas',{title:'아이디어 캔버스',icon:'🧠',cv:Canvas.make('mindmap')});
  mk('db',{title:'독서 기록',icon:'📚',db:DBV.make('books')});
  mk('folder',{title:'개인',icon:'📁'});
  linkify();S.recent=[home.id];S.open[biz.id]=true;return home}
/* ---------- 스튜디오: 리본 · 독 · 객체 · 공유 ---------- */
function walkHTML(){if(!S.settings.mods.walk)return'';const w=walk();if(!w.pick.length)return'';
  return `<section class="sect walk"><div class="secth"><h2>오늘의 지식 산책</h2><small class="note">하루에 한 번 바뀌어요</small></div><div class="grid">${w.pick.map(pcard).join('')}</div>${w.pair?`<div class="pairc">${ic('link')}<span><b>${esc(pTitle(w.pair[0]))}</b> 와 <b>${esc(pTitle(w.pair[1]))}</b> 은 같은 태그인데 아직 이어져 있지 않아요</span><button class="btn sm pr" data-pair="${w.pair[0].id},${w.pair[1].id}">이어 주기</button></div>`:''}</section>`}
function vObjects(){const m=$('#main');const dbs=live().filter(p=>p.type==='db'&&p.db?.obj);const objs=live().filter(p=>p.objOf);
  const em={사람:'🧑',회사:'🏢',프로젝트:'🚀',책:'📚',영화:'🎬',장소:'📍',아이디어:'💡',목표:'🎯',작업:'✅',사건:'🗓️',제품:'📦',웹사이트:'🌐',자료:'📎',게임:'🎮'};
  m.innerHTML=`<div class="wrap"><div class="secth" style="margin-top:6px"><h2 style="font-size:28px">객체</h2></div><p class="note">사람·책·장소처럼 ‘무엇’을 모아 두는 곳이에요. 객체끼리 관계로 이어지고, 하나하나가 문서로 열려요.</p>
  <div class="objtypes">${Object.keys(DBV.OBJ||{}).map(n=>{const ex=dbs.find(d=>d.title===n);return ex?`<button class="objt has" data-open="${ex.id}"><i>${em[n]||'◆'}</i><b>${n}</b><small>${ex.db.rows.length}개</small></button>`:`<button class="objt" data-mkobj="${n}" data-em="${em[n]||''}"><i>${em[n]||'◆'}</i><b>${n}</b><small>+ 만들기</small></button>`}).join('')}</div>
  ${objs.length?`<section class="sect"><div class="secth"><h2>최근 객체 문서</h2></div><div class="grid">${objs.sort((a,b)=>b.updated-a.updated).slice(0,12).map(pcard).join('')}</div></section>`:''}</div>`}
async function vShared(){const m=$('#main');m.innerHTML=`<div class="wrap"><div class="secth" style="margin-top:6px"><h2 style="font-size:28px">공유된 문서</h2></div><div id="shl"><p class="note">불러오는 중…</p></div></div>`;
  const l=await Sync.listShared();const el=$('#shl');if(!el)return;
  if(l===null){el.innerHTML='<div class="empty"><b>공유는 claude.ai에서 열었을 때 쓸 수 있어요</b>문서 메뉴(⋯) → ‘공유하기’로 이 노트를 볼 수 있는 사람에게 문서를 보여 줘요.</div>';return}
  if(!l.length){el.innerHTML='<div class="empty"><b>아직 공유된 문서가 없어요</b>문서 메뉴(⋯) → ‘공유하기’를 눌러 보세요.</div>';return}
  el.innerHTML=`<div class="lst">${l.map((x,i)=>`<button class="lrow" data-sh="${i}"><span class="ti">${ic('share')}</span><span class="t">${esc(x.t||'제목 없음')}</span><small>${ago(x.u||0)}</small></button>`).join('')}</div>`;
  el.onclick=e=>{const b=e.target.closest('[data-sh]');if(!b)return;let p;try{p=JSON.parse(l[+b.dataset.sh].j)}catch(er){return}modal({title:pTitle(p),cls:'mid',html:`<div class="peekdoc">${Peek.html(p)}</div>`,btns:[{t:'내 노트로 가져오기',cls:'pr',fn:()=>{const c=JSON.parse(JSON.stringify(p));c.id=uid();c.parent=null;c.order=nextOrder(null);delete c.sharedAt;c.updated=now();S.pages[c.id]=c;save();go('page:'+c.id);toast('사본을 가져왔어요')}},{t:'닫기'}]})}}
const RIB={
  doc:[['sel'],['b','bold','굵게'],['i','italic','기울임'],['m','mark','형광'],['|'],['ul','list','목록'],['todo','todo','할 일'],['table','table','표'],['image','image','사진'],['link','link','링크'],['|'],['more','more','더보기'],['ai','ai','AI']],
  db:[['newrow','plus','새 항목'],['addv','board','보기'],['filter','filter','필터'],['sort','sort','정렬'],['props','eye','속성'],['addprop','list','속성 추가'],['export','dl','내보내기']],
  canvas:[['tool:select','select','선택'],['tool:pen','pen','펜'],['tool:hl','hl','형광펜'],['tool:lasso','shape','올가미'],['tool:erase','erase','지우개'],['|'],['add:sticky','sticky','메모지'],['add:node','node','노드'],['add:text','text','글'],['add:shape','shape','도형'],['add:frame','frame','프레임'],['|'],['autoshape','shape','도형 보정'],['fit','fit','전체 보기'],['undo','restore','되돌리기'],['todoc','page','문서로']]};
function renderRibbon(){const r=$('#ribbon');if(!r)return;const p=curPage();const k=p&&!p.lock?p.type:null;const L=RIB[k];document.body.classList.toggle('hasrib',!!L);if(!L){r.innerHTML='';return}
  r.innerHTML=`<div class="rib">${L.map(([a,i,n])=>a==='|'?'<i class="rsep"></i>':a==='sel'?`<select class="rsel" data-rs aria-label="글 모양"><option value="">글 모양</option><option value="p">본문</option><option value="h1">큰 제목</option><option value="h2">중간 제목</option><option value="h3">작은 제목</option><option value="quote">인용</option><option value="toggle">토글</option></select>`:`<button class="rb${a==='ai'?' aib':''}" data-rb="${a}" title="${n}"${a==='ai'&&!AI?' disabled':''}>${ic(i)}<span>${n}</span></button>`).join('')}</div>`}
function ribClick(e){const b=e.target.closest('[data-rb]');if(!b)return;const a=b.dataset.rb,p=curPage();if(!p)return;
  if(p.type==='db')return DBV.act(a,b);if(p.type==='canvas')return Canvas.cmd(a);
  if('biusm'.includes(a)&&a.length===1)return Editor.fmt({b:'bold',i:'italic',u:'underline',s:'strike',m:'mark'}[a],b);
  if(a==='more'){const r=b.getBoundingClientRect();return menu(r.left,r.bottom+4,[['ol','번호 목록','olist'],['media','파일','file'],['code','코드','code'],['callout','콜아웃','callout'],['math','수식','fx'],['h1','큰 제목','h1'],['h2','중간 제목','h2'],['toggle','토글','toggle'],['quote','인용','quote'],['divider','구분선','divider'],['toc','목차','toc'],['date','날짜','date'],['bookmark','웹 링크 카드','web'],['button','버튼','bolt'],['page','하위 페이지','page']].map(([k,t,i])=>({t,i,fn:()=>Editor.insert(k)})))}
  if(a==='ai'){const r=b.getBoundingClientRect();return menu(r.left,r.bottom+4,[{t:'이 문서 요약',i:'ai',fn:()=>Editor.aiPage('sum')},{t:'구조 추천',i:'ai',fn:()=>Editor.aiPage('struct')},{t:'문서에 질문하기',i:'ai',fn:()=>Editor.aiPage('qa')},{t:'관련 문서 추천',i:'ai',fn:()=>Editor.aiPage('rel')}])}
  if(a==='link'){const sel=getSelection(),rg=sel.rangeCount?sel.getRangeAt(0).cloneRange():null,txt=String(sel||'').trim(),r=b.getBoundingClientRect();
    return menu(r.left,r.bottom+4,[{h:'링크 넣기'},{t:'웹 주소 넣기 (https://…)',i:'web',fn:()=>webLink(rg,txt)},{t:'웹 링크 카드 (미리보기)',i:'link',fn:()=>Editor.insert('bookmark')},{t:'다른 노트 연결 ([[ )',i:'page',fn:()=>Editor.insert('link')}])}
  Editor.insert(a)}
async function webLink(rg,txt){let url=await ask('웹 주소',{sub:'유튜브·노션·캔바·구글·네이버 등 어떤 주소든 돼요',ph:'https://'});if(!url)return;url=url.trim();if(!/^[a-z]+:\/\//i.test(url))url='https://'+url;
  let label=txt;if(!label){label=await ask('보여 줄 글자',{sub:'비워 두면 주소가 그대로 보여요',ph:url});label=(label||'').trim()||url}
  const ed=rg&&(rg.startContainer.nodeType===1?rg.startContainer:rg.startContainer.parentElement)?.closest?.('[data-f]');
  if(!ed){Editor.insert('p');await new Promise(r=>setTimeout(r,60))}else{ed.focus();const s=getSelection();s.removeAllRanges();s.addRange(rg)}
  document.execCommand('insertHTML',false,`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>&nbsp;`);toast('링크를 넣었어요')}
function dockClick(e){const b=e.target.closest('[data-dk]');if(!b)return;const a=b.dataset.dk,r=b.getBoundingClientRect();
  ({new:()=>openCreate(),quick:quickNote,graph:()=>go('graph'),find:()=>openPalette('all'),drawer:()=>toggleSide(),panel:()=>togglePanel(),bell:()=>Remind.open(r.left,r.top-260)})[a]?.()}
async function boot(){bindGlobal();await idbOpen();let raw=await tx('kv','readonly',s=>s.get('state'));if(!raw){try{raw=localStorage.getItem('un-fallback')}catch(e){}}
  try{if(raw){S=JSON.parse(raw);S.settings={...defSettings(),...S.settings,sideItems:{...defSettings().sideItems,...(S.settings||{}).sideItems}};S.open??={};S.tpls??=[];S.recentQ??=[];S.settings.mods={...defSettings().mods,...(S.settings.mods||{})};S.settings.keys??={};S.snips??=[]}}catch(e){S=null}
  let first=false;if(!S||!S.pages){S=freshState();S.open={};S.toured=1;first=true;const c0=newPage('canvas',{title:'내 캔버스',cv:Canvas.make('blank')});c0.kind='';S.recent=[c0.id];S.lastRoute='page:'+c0.id}else S.open??={};if(!S.settings.accent||['#6478E8','#1A73E8','#3B5BDB'].includes(S.settings.accent))S.settings.accent='#2563EB';
  try{V=JSON.parse(await tx('kv','readonly',s=>s.get('versions'))||'{}')}catch(e){V={}}
  if(IDB){const keys=await tx('blobs','readonly',s=>s.getAllKeys())||[],vals=await tx('blobs','readonly',s=>s.getAll())||[];keys.forEach((k,i)=>{const b=vals[i];if(b)blobs[k]={url:URL.createObjectURL(b),name:b.name||'파일',type:b.type||'',size:b.size||0}})}
  S.settings.side=false;applySettings();renderFoot();Peek.bind();await Auth.lockScreen();if(!S.v7){S.v7=1;S.settings.simple=1}S.settings.one=1;S.settings.simple=1;S.settings.lang='ko';if(!S.v9){S.v9=1;Object.values(S.pages).forEach(p=>{if(p.cv&&p.cv.world)delete p.cv.world})}if(!S.v6){S.v6=1;S.settings.theme='light';applySettings();const g=seedGuide2();if(!first){S.lastRoute='page:'+g.id}}MS.init();const st=S.settings.start||'last';let lr=S.lastRoute;if(st==='home')lr='home';if(st==='canvas'&&!first){const c=newPage('canvas',{title:'',cv:Canvas.make('blank')});lr='page:'+c.id}const ok=lr&&(!lr.startsWith('page:')||(P(lr.slice(5))&&!P(lr.slice(5)).trash));go(ok?lr:'home',{push:true});Auth.start();if(first)flush();setSave(IDB?'ok':'ls');
  setTimeout(()=>{try{Remind.start()}catch(e){}Sync.start()},300);
  const cu=window.claude?.use;if(cu){cu('downloads').then(d=>DL=d,()=>{});/* 앱 안의 AI는 쓰지 않아요 */}}
