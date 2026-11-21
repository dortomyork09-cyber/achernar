/* Achernar — 선생님 모아보기: 여러 조의 공유 캔버스를 한 화면에서 */
const Teach=(()=>{
const KEY='ach-class';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
const store=a=>{try{localStorage.setItem(KEY,JSON.stringify(a.slice(0,60)))}catch(e){}};
function parse(u){try{const h=new URL(u).hash.slice(1),q=new URLSearchParams(h),r=q.get('r');if(!r)return null;const kind=q.get('e')?'e':q.get('c')?'c':'v';return{r,kind,key:q.get(kind)||null,url:u}}catch(e){return null}}
const ago=t=>{if(!t)return '-';const s=(Date.now()-t)/1000;return s<60?'방금':s<3600?Math.floor(s/60)+'분 전':s<86400?Math.floor(s/3600)+'시간 전':Math.floor(s/86400)+'일 전'};
function mini(items){const its=items.filter(i=>i.type!=='link');if(!its.length)return '<svg viewBox="0 0 160 90"></svg>';const xs=its.map(i=>i.x),ys=its.map(i=>i.y),xe=its.map(i=>i.x+(i.w||160)),ye=its.map(i=>i.y+(i.h||100));
  const x0=Math.min(...xs),y0=Math.min(...ys),W=Math.max(...xe)-x0||1,H=Math.max(...ye)-y0||1,k=Math.min(150/W,80/H);const col={w:'#E6E3DA',y:'#FFE27A',o:'#FFC58A',p:'#FFB8CB',m:'#A6ECC8',s:'#A9D6FF',l:'#D7C8FF'};
  return `<svg viewBox="0 0 160 90">${its.slice(0,300).map(i=>`<rect x="${5+(i.x-x0)*k}" y="${5+(i.y-y0)*k}" width="${Math.max(1.5,(i.w||160)*k)}" height="${Math.max(1.5,(i.h||100)*k)}" rx="1" fill="${i.type==='frame'?'none':col[i.c]||'#D9D5CB'}" stroke="${i.type==='frame'?'#9AA3BF':'none'}" stroke-width=".6"/>`).join('')}</svg>`}
async function open(){if(typeof Collab==='undefined')return;const C=await Collab.cloud('선생님 모아보기는 구글 계정으로 로그인하면 쓸 수 있어요.');if(!C)return;
  let ov=document.querySelector('#teach');if(ov)ov.remove();ov=document.createElement('div');ov.id='teach';document.body.appendChild(ov);
  const close=()=>{ov.remove();removeEventListener('keydown',k,true)};const k=e=>{if(e.key==='Escape'&&!document.querySelector('#modal:not([hidden])')){e.stopPropagation();close()}};addEventListener('keydown',k,true);
  async function draw(){const list=load();ov.innerHTML=`<header><b>반 모아보기</b><span class="note">조마다 받은 공유 링크를 추가하면, 진행 상황을 한눈에 볼 수 있어요. 댓글 링크로 추가하면 바로 피드백을 남길 수 있어요.</span><button class="btn pr" data-add>+ 링크 추가</button><button class="btn" data-mine>내 공유 캔버스에서 가져오기</button><button class="btn" data-x>닫기 (Esc)</button></header><div class="tg">${list.length?'':'<p class="note cempty">아직 추가한 캔버스가 없어요. 학생들에게 “공유 → 댓글 가능 링크”를 받아 추가해 보세요.</p>'}</div>`;
    ov.querySelector('[data-x]').onclick=close;
    ov.querySelector('[data-add]').onclick=async()=>{const v=await ask('공유 링크 추가',{sub:'여러 개면 줄을 바꿔 한꺼번에 붙여 넣어도 돼요',multi:true,ph:'https://…/achernar/#r=…',ok:'추가'});if(!v)return;const add=String(v).split(/\s+/).map(parse).filter(Boolean);if(!add.length)return toast('Achernar 공유 링크가 아니에요');const L=load();add.forEach(a=>{if(!L.some(x=>x.r===a.r))L.push(a)});store(L);draw()};
    ov.querySelector('[data-mine]').onclick=async()=>{let v={};try{v=(await C.db.ref('users/'+C.uid+'/rooms').once('value')).val()||{}}catch(e){}const L=load();let n=0;Object.entries(v).forEach(([r,x])=>{if(L.some(y=>y.r===r))return;const kk=x.k&&x.r!=='owner'?Object.entries(x.k)[0]:null;L.push({r,kind:kk?kk[0]:'v',key:kk?kk[1]:null});n++});store(L);draw();toast(n?`${n}개를 가져왔어요`:'새로 가져올 캔버스가 없어요')};
    const G=ov.querySelector('.tg');
    for(const e of list){const el=document.createElement('article');el.className='tc';el.innerHTML='<div class="tmn"></div><div class="tbd"><b>불러오는 중…</b></div>';G.appendChild(el);
      try{const v=(await C.db.ref('rooms/'+e.r).once('value')).val();if(!v||!v.meta){el.querySelector('.tbd').innerHTML=`<b>공유가 끝난 캔버스</b><button class="lnk dang" data-rm>목록에서 빼기</button>`;el.querySelector('[data-rm]').onclick=()=>{store(load().filter(x=>x.r!==e.r));draw()};continue}
        const P=o=>Object.values(o||{}).map(s=>{try{return JSON.parse(s)}catch(x){return null}}).filter(Boolean);const items=P(v.items),cms=P(v.comments),mem=Object.values(v.members||{});
        const last=Math.max(v.meta.at||0,...items.map(i=>i.et||0),...cms.map(c=>c.at||0));const open_=cms.filter(c=>!c.res).length;const chks=items.filter(i=>i.type==='check').flatMap(i=>(i.checks||[]).filter(c=>c.t));const done=chks.filter(c=>c.d).length;
        const by={};items.forEach(i=>{Object.entries(i.cx||{}).forEach(([u,n])=>{by[u]=(by[u]||0)+n})});const tot=Object.values(by).reduce((a,b)=>a+b,0)||1;
        el.innerHTML=`<div class="tmn">${mini(items)}</div><div class="tbd"><b>${esc(v.meta.title||'캔버스')}</b><small>${mem.map(m=>esc(m.n||'')).join(', ')||'멤버 없음'}</small>
          <ul class="tst"><li>카드 <b>${items.length}</b></li><li>마지막 활동 <b>${ago(last)}</b></li><li>열린 댓글 <b>${open_}</b></li>${chks.length?`<li>할 일 <b>${done}/${chks.length}</b></li>`:''}</ul>
          <div class="tbar">${Object.entries(by).map(([u,n])=>`<i title="${esc((mem.find(m=>m)&&Object.entries(v.members||{}).find(([x])=>x===u)?.[1]?.n)||'')} ${Math.round(n/tot*100)}%" style="flex:${n};background:${['#E5484D','#F76B15','#E2A400','#30A46C','#0090FF','#6E56CF','#D6409F','#12A594'][[...u].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,0)%8]}"></i>`).join('')}</div>
          <div class="tac"><button class="btn sm pr" data-go>${e.kind==='v'?'보기':'열어서 피드백'}</button><button class="lnk dang" data-rm>빼기</button></div></div>`;
        el.querySelector('[data-go]').onclick=()=>{close();Collab.join(e.r,e.kind,e.key)};el.querySelector('[data-rm]').onclick=()=>{store(load().filter(x=>x.r!==e.r));draw()}}
      catch(err){console.warn(err);el.querySelector('.tbd').innerHTML='<b>불러오지 못했어요</b>'}}}
  draw()}
return {open,moreMenu:()=>[{t:'선생님 모아보기 (여러 조 한눈에)',i:'grid',fn:open}]};
})();
