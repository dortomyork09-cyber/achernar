/* Achernar — 보관함: 내 컴퓨터 폴더에 캔버스를 파일로 저장 (옵시디언처럼 내 데이터는 내 손에) */
const Vault=(()=>{
const ok=typeof window.showDirectoryPicker==='function';
let dir=null,granted=false,last='',busy=false,timer=0;
const safeName=s=>(s||'내 캔버스').replace(/[\\/:*?"<>|]/g,'_').replace(/\s+/g,' ').trim().slice(0,60)||'내 캔버스';
const b64toBlob=(b64,type)=>{const bin=atob(b64.split(',').pop());const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Blob([u],{type:type||''})};
async function loadHandle(){try{dir=await tx('kv','readonly',s=>s.get('vault'))||null}catch(e){dir=null}if(dir){try{granted=(await dir.queryPermission({mode:'readwrite'}))==='granted'}catch(e){granted=false}}chip()}
async function saveHandle(){try{await tx('kv','readwrite',s=>dir?s.put(dir,'vault'):s.delete('vault'))}catch(e){}}
async function perm(){if(!dir)return false;try{if((await dir.queryPermission({mode:'readwrite'}))==='granted')return granted=true;granted=(await dir.requestPermission({mode:'readwrite'}))==='granted'}catch(e){granted=false}chip();return granted}
function chip(){let c=$('#vchip');const bar=$('#obar');if(!bar)return;if(!c){c=document.createElement('button');c.id='vchip';c.className='vchip';c.onclick=e=>{const r=c.getBoundingClientRect();menu(r.left,r.bottom+6,items())};const ref=$('#ost');ref?ref.after(c):bar.appendChild(c)}
  if(!ok||!dir){c.hidden=true;return}c.hidden=false;c.classList.toggle('off',!granted);c.innerHTML=`${ic('folder')}<span>${granted?esc(dir.name):'보관함 다시 연결'}</span>`;c.title=granted?`보관함: ${dir.name} 폴더에 자동 저장 중`:'눌러서 보관함 폴더 권한을 다시 허락해 주세요'}
function items(){if(!ok)return[{t:'이 브라우저는 폴더 저장을 지원하지 않아요 (크롬·엣지 PC에서 가능)',i:'info',fn:()=>{}}];
  if(!dir)return[{t:'보관함 폴더 연결하기',i:'folder',fn:connect}];
  if(!granted)return[{t:`‘${dir.name}’ 다시 연결 (권한 허락)`,i:'folder',fn:async()=>{if(await perm()){toast('보관함에 다시 연결했어요');writeNow(true)}}},{t:'다른 폴더로 바꾸기',i:'restore',fn:connect},{t:'연결 끊기',i:'x',fn:disconnect}];
  return[{t:'지금 폴더에 저장',i:'save',fn:()=>writeNow(true)},{t:'폴더에서 캔버스 열기',i:'page',fn:openFrom},'-',{t:'다른 폴더로 바꾸기',i:'restore',fn:connect},{t:'연결 끊기',i:'x',fn:disconnect}]}
async function connect(){if(!ok)return toast('이 브라우저는 폴더 저장을 지원하지 않아요 · 크롬이나 엣지(PC)에서 써 주세요',{ms:3000});
  try{dir=await window.showDirectoryPicker({id:'achernar',mode:'readwrite'})}catch(e){return}granted=true;await saveHandle();chip();await writeNow(true);
  toast(`‘${dir.name}’ 폴더를 보관함으로 연결했어요 · 이제 자동으로 파일로 저장돼요`,{ms:3200})}
async function disconnect(){if(!await confirmDlg('보관함 연결을 끊을까요?','폴더 안의 파일은 그대로 남아요. 앱 안의 캔버스도 그대로예요.','연결 끊기'))return;dir=null;granted=false;await saveHandle();chip();toast('보관함 연결을 끊었어요')}
async function packCanvas(m){const out={app:'Achernar',v:1,title:m.title||'',t:Date.now(),cv:m.cv,blobs:{}};const used=new Set();JSON.stringify(m.cv).replace(/"(?:src|img|blob)":"([^"]+)"/g,(_,i)=>used.add(i));
  for(const id of used){try{const b=await tx('blobs','readonly',s=>s.get(id));if(b)out.blobs[id]={name:blobs[id]?.name,type:b.type,data:await blobB64(b)}}catch(e){}}return out}
async function write(name,text){const fh=await dir.getFileHandle(name,{create:true});const w=await fh.createWritable();await w.write(text);await w.close()}
async function writeNow(force){if(!dir||busy)return;if(!granted&&!(force&&await perm()))return;const m=One.main();if(!m?.cv)return;const sig=JSON.stringify([m.title,m.cv.items,m.cv.links,m.cv.strokes]);if(!force&&sig===last)return;busy=true;
  try{const nm=safeName(m.title);const data=await packCanvas(m);await write(nm+'.achernar',JSON.stringify(data));
    try{const md=typeof toMD==='function'?toMD(m):'';if(md)await write(nm+'.md',md)}catch(e){}
    last=sig;const st=$('#ost');if(st&&force)st.textContent='폴더에 저장됨';if(force)toast(`‘${nm}.achernar’ 파일로 저장했어요`,{ms:1400})}
  catch(e){granted=false;chip();if(force)toast('폴더에 저장하지 못했어요 · 보관함을 다시 연결해 주세요')}busy=false}
async function openFrom(){if(!await perm())return;const files=[];for await(const [n,h] of dir.entries()){if(h.kind==='file'&&n.endsWith('.achernar'))files.push([n,h])}
  if(!files.length)return toast('이 폴더에 .achernar 파일이 아직 없어요');files.sort((a,b)=>a[0].localeCompare(b[0],'ko'));
  const r=$('#vchip').getBoundingClientRect();menu(r.left,r.bottom+6,files.slice(0,30).map(([n,h])=>({t:n.replace(/\.achernar$/,''),i:'page',fn:()=>openFile(h)})))}
async function openFile(h){let o;try{o=JSON.parse(await (await h.getFile()).text())}catch(e){return toast('파일을 읽을 수 없어요')}if(o?.app!=='Achernar'||!o.cv)return toast('Achernar 캔버스 파일이 아니에요');
  if(!await confirmDlg(`‘${esc(o.title||h.name)}’을(를) 열까요?`,'지금 캔버스는 저장 화면에 먼저 보관해 둘게요.','열기'))return;
  for(const[id,b]of Object.entries(o.blobs||{})){try{const bl=b64toBlob(b.data,b.type);await tx('blobs','readwrite',s=>s.put(bl,id));blobs[id]={url:URL.createObjectURL(bl),name:b.name||'파일',type:b.type||'',size:bl.size}}catch(e){}}
  await One.snap('폴더에서 열기 전 자동 저장');const m=One.main();m.cv=o.cv;m.title=o.title||'';touch(m);flush();if(window.render)render();setTimeout(()=>Canvas.cmd('fit'),200);last='';toast('폴더에서 캔버스를 열었어요')}
function moreMenu(){return ok?[{t:dir?`보관함: ${dir.name}`:'보관함 (내 컴퓨터 폴더에 저장)',i:'folder',sub:items()}]:[]}
function start(){loadHandle();clearInterval(timer);timer=setInterval(()=>{if(!document.hidden&&dir&&granted)writeNow(false)},4000);addEventListener('beforeunload',()=>{if(dir&&granted)writeNow(false)})}
setTimeout(start,1500);
return{connect,writeNow,openFrom,moreMenu,supported:ok,get dir(){return dir}}})();
