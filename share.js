/* Achernar — 폰에서 공유로 던져 넣기 · 수집함
   앱을 홈 화면에 설치하면 폰의 ‘공유’ 목록에 아케르나르가 생겨요. 보낸 링크·글·사진은 캔버스의 ‘수집함’에 쌓여요.
   (공유받은 내용은 서비스 워커가 잠깐 'ach-share' 저장소에 두고, 앱이 열리면 꺼내요) */
const Share=(()=>{
const A=()=>typeof Canvas!=='undefined'?Canvas.api:null;
function idb(){return new Promise((res,rej)=>{const q=indexedDB.open('ach-share',1);q.onupgradeneeded=()=>q.result.createObjectStore('q',{autoIncrement:true});q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
async function take(){try{const db=await idb();return await new Promise(res=>{const t=db.transaction('q','readwrite'),s=t.objectStore('q'),g=s.getAll();g.onsuccess=()=>{s.clear();res(g.result||[])};g.onerror=()=>res([])})}catch(e){return[]}}
const inside=(i,f)=>i!==f&&i.x>=f.x&&i.y>=f.y&&i.x<f.x+f.w&&i.y<f.y+f.h;
function inbox(){const a=A(),c=a.C();let f=c.items.find(i=>i.type==='frame'&&i.inbox);if(f)return f;const xs=c.items.map(i=>i.x+(i.w||0)),ys=c.items.map(i=>i.y);
  a.push();f=a.mk('frame',c.items.length?Math.max(...xs)+160:-460,c.items.length?Math.min(...ys):-300,{w:860,h:420,text:'수집함',inbox:true,c:'y'});a.render();a.save();return f}
function slot(f){const c=A().C();const n=c.items.filter(i=>inside(i,f)).length;const W=270,H=190,x=f.x+30+(n%3)*W,y=f.y+56+Math.floor(n/3)*H;if(y+H+30>f.y+f.h)f.h=y+H+30-f.y;return[x,y]}
async function receive(list){const a=A();if(!a||!list.length)return 0;One.home();await new Promise(r=>setTimeout(r,120));const f=inbox();let n=0;
  for(const e of list){const urlIn=String(e.text||'').match(/https?:\/\/\S+/);const url=e.url||(urlIn&&urlIn[0])||'';const rest=String(e.text||'').replace(url,'').trim();
    if(url){const[x,y]=slot(f);a.text(url,x+150,y+60);n++;const it=a.C().items[a.C().items.length-1];if(it&&it.type==='link'&&(e.title||rest))it.title=esc((e.title||rest).slice(0,80));if(e.title&&rest){const[x2,y2]=slot(f);a.text(rest,x2+120,y2+60);n++}}
    else if(rest||e.title){const[x,y]=slot(f);a.text([e.title,rest].filter(Boolean).join('\n'),x+120,y+60);n++}
    for(const file of e.files||[]){const[x,y]=slot(f);await a.files([file],x,y);n++}}
  a.render();a.save();setTimeout(()=>{try{a.focus(f.id)}catch(e){}},200);return n}
async function check(){const sp=new URLSearchParams(location.search);if(!sp.has('share'))return;history.replaceState(null,'',location.pathname+location.hash);
  let tries=0;while(!(A()&&A().C())&&tries++<100)await new Promise(r=>setTimeout(r,100));const n=await receive(await take());
  if(n)toast(`수집함에 ${n}개를 넣었어요`,{ms:2600,act:'정리하기',fn:()=>tidy(inbox(),'type')});else toast('받은 내용이 없어요 · 다시 공유해 보세요')}

/* ---------- 정리하기 ---------- */
const ORDER=['link','image','video','file','text','sticky','doc','check','node','shape','table','chart','flip','dday'];
const tagOf=it=>{const m=String(it.text||'').replace(/<[^>]+>/g,' ').match(/#([0-9A-Za-z가-힣_]+)/);return m?m[1]:'~'};
function tidy(f,by){const a=A(),c=a.C();const its=c.items.filter(i=>inside(i,f));if(!its.length)return toast('안에 카드가 없어요');a.push();
  const key=i=>by==='tag'?tagOf(i):String(ORDER.indexOf(i.type)).padStart(2,'0');const groups={};its.forEach(i=>(groups[key(i)]=groups[key(i)]||[]).push(i));
  let y=f.y+56;const W=270,G=24;Object.keys(groups).sort().forEach(k=>{let x=f.x+30,rowH=0;groups[k].forEach((i,idx)=>{if(idx&&(idx%3===0||x+(i.w||240)>f.x+Math.max(f.w,900)-20)){y+=rowH+G;x=f.x+30;rowH=0}i.x=x;i.y=y;x+=Math.max(W,(i.w||240)+G);rowH=Math.max(rowH,i.h||((a.box&&a.box(i.id)||{}).h)||140)});y+=rowH+G*2});
  f.h=Math.max(f.h,y-f.y);a.render();a.save();toast(by==='tag'?'#태그별로 정리했어요':'종류별로 정리했어요')}
function cardMenu(its){if(its.length!==1||its[0].type!=='frame')return[];const f=its[0];return[{t:f.inbox?'수집함 정리하기':'안에 있는 카드 정리하기',i:'grid',sub:[{t:'종류별로 (링크·사진·글…)',fn:()=>tidy(f,'type')},{t:'#태그별로',fn:()=>tidy(f,'tag')}]}]}
function open(){const a=A();if(!a)return;const f=inbox();a.setSel([f.id]);a.focus(f.id)}
function howto(){modal({title:'폰에서 보내기',cls:'mid',html:`<ol style="margin:0;padding-left:18px;line-height:1.9"><li>폰 크롬에서 아케르나르를 열고 <b>⋯ → 홈 화면에 추가(앱 설치)</b></li><li>같은 구글 계정으로 로그인 (컴퓨터와 이어져요)</li><li>유튜브·인스타·기사에서 <b>공유 → Achernar</b></li><li>캔버스의 <b>수집함</b>에 쌓여요. 집 컴퓨터에도 바로 떠요</li></ol><p class="note" style="margin:12px 0 0">안드로이드 크롬에서 돼요. 아이폰(사파리)은 아직 ‘공유로 받기’를 지원하지 않아서, 링크를 복사해 캔버스에 붙여넣어 주세요.</p>`})}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',()=>setTimeout(check,400));else setTimeout(check,400);
return{receive,tidy,cardMenu,open,howto,_take:take}})();
