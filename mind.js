/* MINDSPACE — 마인드맵 · 연결 · 링크 열기 */
const Mind=(()=>{
const ap=()=>Canvas.api,C=()=>ap().C();
const tx=i=>{const d=document.createElement('div');d.innerHTML=i?.text||i?.title||'';return d.textContent.trim()};
const kids=id=>C().links.filter(l=>l.a===id&&l.k==='mm').map(l=>ap().I(l.b)).filter(Boolean);
const parent=id=>{const l=C().links.find(l=>l.b===id&&l.k==='mm');return l?ap().I(l.a):null};
const rootOf=it=>{let r=it,seen=new Set();while(parent(r.id)&&!seen.has(r.id)){seen.add(r.id);r=parent(r.id)}return r};
const desc=(id,acc=[],seen=new Set())=>{kids(id).forEach(k=>{if(seen.has(k.id))return;seen.add(k.id);acc.push(k);desc(k.id,acc,seen)});return acc};
const isMind=it=>it&&(it.type==='node'||kids(it.id).length||parent(it.id));
const sz=it=>{const b=ap().box(it.id);return b?{w:b.w,h:b.h}:{w:it.w||180,h:44}};

/* 자동 정렬 */
function layout(it,mode){const a=ap();a.push();const root=rootOf(it);const GX=70,GY=26;
  const leaves=n=>{const k=n.clp?[]:kids(n.id);return k.length?k.reduce((s,c)=>s+leaves(c),0):1};
  if(mode==='right'||mode==='left'){const dir=mode==='left'?-1:1;const place=(n,x,yTop)=>{const k=n.clp?[]:kids(n.id),s=sz(n),H=leaves(n)*(48+GY);n.x=dir>0?x:x-s.w;n.y=yTop+H/2-s.h/2;let y=yTop;k.forEach(c=>{const h=leaves(c)*(48+GY);place(c,dir>0?x+s.w+GX:x-s.w-GX,y);y+=h})};
    const H=leaves(root)*(48+GY);const ox=root.x+(dir>0?0:sz(root).w),oy=root.y+sz(root).h/2-H/2;place(root,ox,oy)}
  if(mode==='both'){const k=kids(root.id);const L=[],R=[];let lc=0,rc=0;k.forEach(c=>{const n=leaves(c);if(rc<=lc){R.push(c);rc+=n}else{L.push(c);lc+=n}});const s=sz(root),cx=root.x,cy=root.y+s.h/2;
    const side=(arr,dir)=>{const H=arr.reduce((t,c)=>t+leaves(c)*(48+GY),0);let y=cy-H/2;const place=(n,x,yTop)=>{const kk=n.clp?[]:kids(n.id),sn=sz(n),h=leaves(n)*(48+GY);n.x=dir>0?x:x-sn.w;n.y=yTop+h/2-sn.h/2;let yy=yTop;kk.forEach(c=>{place(c,dir>0?x+sn.w+GX:x-sn.w-GX,yy);yy+=leaves(c)*(48+GY)})};arr.forEach(c=>{place(c,dir>0?cx+s.w+GX:cx-GX,y);y+=leaves(c)*(48+GY)})};side(R,1);side(L,-1)}
  if(mode==='down'){const W=n=>{const k=n.clp?[]:kids(n.id);return k.length?k.reduce((t,c)=>t+W(c),0):sz(n).w+30};const place=(n,xL,y)=>{const k=n.clp?[]:kids(n.id),s=sz(n),w=W(n);n.x=xL+w/2-s.w/2;n.y=y;let x=xL;k.forEach(c=>{place(c,x,y+s.h+70);x+=W(c)})};const w=W(root);place(root,root.x+sz(root).w/2-w/2,root.y)}
  if(mode==='radial'){const s=sz(root),cx=root.x+s.w/2,cy=root.y+s.h/2;const place=(n,a0,a1,d)=>{const k=n.clp?[]:kids(n.id);const tot=k.reduce((t,c)=>t+leaves(c),0)||1;let a=a0;k.forEach(c=>{const span=(a1-a0)*leaves(c)/tot,mid=a+span/2,r=d*230,sc=sz(c);c.x=cx+Math.cos(mid)*r-sc.w/2;c.y=cy+Math.sin(mid)*r-sc.h/2;place(c,a,a+span,d+1);a+=span})};place(root,-Math.PI/2,Math.PI*1.5,1)}
  a.render();a.save();a.fit?.();toast('마인드맵을 정리했어요 · Ctrl+Z로 되돌릴 수 있어요')}

/* 접기 · 펼치기 */
function fold(it){const a=ap();a.push();const d=desc(it.id);if(it.clp){delete it.clp;const show=(n)=>kids(n.id).forEach(k=>{delete k.hid;if(!k.clp)show(k)});show(it)}else if(d.length){it.clp=d.length;d.forEach(k=>k.hid=1)}a.render();a.save()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-clp]');if(b){e.stopPropagation();const it=ap().I(b.dataset.clp);if(it)fold(it)}},true);
document.addEventListener('pointerdown',e=>{if(e.target.closest('[data-clp],a.lopen'))e.stopPropagation()},true);

/* 가지 일괄 */
function colorBranch(it){const a=ap();a.push();desc(it.id).forEach(k=>{if(it.c)k.c=it.c});a.render();a.save();toast('가지 전체를 같은 색으로 칠했어요')}
function selectBranch(it){ap().setSel([it.id,...desc(it.id).filter(k=>!k.hid).map(k=>k.id)])}
async function note(it){const v=await ask('노드 설명',{sub:'노드 아래에 작은 글씨로 보여요',val:it.note||'',multi:true});if(v===null||v===undefined)return;const a=ap();a.push();if(v.trim())it.note=v.trim();else delete it.note;a.render();a.save()}
const EMO=['💡','⭐','🔥','✅','❓','⚠️','🎯','📌','🚀','❤️','🎵','🏀'];
function emoji(it,e){const a=ap();a.push();const t=it.text||'';const clean=t.replace(/^(\p{Extended_Pictographic}️?\s?)/u,'');it.text=e?e+' '+clean:clean;a.render();a.save()}

/* 개요 ↔ 마인드맵 */
function outline(it){const root=rootOf(it);const lines=[];const walk=(n,d)=>{lines.push('  '.repeat(d)+'- '+tx(n));(n.clp?[]:kids(n.id)).forEach(k=>walk(k,d+1));if(n.clp)kids(n.id).forEach(k=>walk(k,d+1))};walk(root,0);const t=lines.join('\n');
  navigator.clipboard?.writeText(t).then(()=>toast('개요를 복사했어요 · 어디든 붙여 넣으세요'),()=>{});const a=ap();a.push();const b=a.box(root.id)||root;a.mk('text',b.x,(b.y||0)-40-lines.length*22,{w:320,h:0,text:lines.map(l=>esc(l)).join('<br>')});a.render();a.save()}
async function fromOutline(pt){const t=await ask('글 → 마인드맵',{sub:'한 줄에 하나씩, 들여쓰기(스페이스·탭)나 - 로 가지를 나눠요. 첫 줄이 가운데 생각이에요.',multi:true,ph:'여행 계획\n  숙소\n  맛집\n    해산물\n  교통'});if(!t||!t.trim())return;
  One.home();setTimeout(()=>{const a=ap();a.push();const[x,y]=pt||a.center();const rows=t.split('\n').filter(l=>l.trim()).map(l=>{const m=l.match(/^(\s*)(?:[-*•]\s*)?(.*)$/);return{d:m[1].replace(/\t/g,'  ').length,t:m[2].trim()}});
    const base=rows[0].d;const stack=[];let root=null;const C2=['p','m','s','l','o'];let br=0;
    rows.forEach((r,i)=>{const d=i===0?0:Math.max(1,Math.round((r.d-base)/2)+(rows[0].d===r.d?1:0));while(stack.length&&stack.at(-1).d>=d)stack.pop();const par=stack.at(-1);if(par&&par.d===0)br++;
      const n=a.mk('node',x,y,{w:i===0?200:180,text:i===0?`<b>${esc(r.t)}</b>`:esc(r.t),c:i===0?'y':(par&&par.d>0?par.n.c:C2[br%C2.length]),shape:'pill'});if(i===0)root=n;if(par)a.link(par.n.id,n.id);stack.push({d,n})});
    a.render();setTimeout(()=>{layout(root,'right');ap().setSel([root.id])},60)},120)}

/* 카드 잇기 */
function join(its){if(its.length<2)return toast('카드를 2개 이상 골라 주세요');const a=ap();a.push();const s=[...its].sort((p,q)=>(p.x-q.x)||(p.y-q.y));for(let i=0;i<s.length-1;i++){if(!C().links.some(l=>(l.a===s[i].id&&l.b===s[i+1].id)||(l.a===s[i+1].id&&l.b===s[i].id)))a.link(s[i].id,s[i+1].id,{k:'arrow'})}a.render();a.save();toast(`${s.length-1}개의 선으로 이었어요`)}
let joining=null;
function startJoin(it){joining=it.id;document.body.classList.add('joining');toast('이을 카드를 눌러 주세요 · Esc로 취소')}
document.addEventListener('pointerdown',e=>{if(!joining)return;const cd=e.target.closest('.card');if(!cd)return;e.stopPropagation();e.preventDefault();const id=cd.dataset.id;if(id&&id!==joining){const a=ap();a.push();a.link(joining,id,{k:'arrow'});a.render();a.save();toast('이었어요')}joining=null;document.body.classList.remove('joining')},true);
addEventListener('keydown',e=>{if(joining&&e.key==='Escape'){joining=null;document.body.classList.remove('joining')}},true);

/* 웹 링크 열기 (막히면 복사) */
function openURL(u){let w=null;try{w=window.open(u,'_blank')}catch(e){}if(w){try{w.opener=null}catch(e){}return}
  modal({title:'링크 열기',html:`<p class="note" style="margin-top:0">이 화면에서는 새 창이 막혀 있어요. 아래 버튼으로 열거나, 주소를 복사해 브라우저에 붙여 넣으세요.</p><div class="urlbox">${esc(u)}</div>`,btns:[{t:'주소 복사',fn:()=>{navigator.clipboard?.writeText(u);toast('복사했어요')}},{t:'열기',cls:'pr',fn:()=>{const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}}]})}
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;const u=a.getAttribute('href');if(!/^https?:/i.test(u))return;if(a.closest('#modal'))return;if(a.closest('[data-f]')&&!a.classList.contains('lopen'))return;e.preventDefault();e.stopPropagation();openURL(u)},true);

/* 메뉴 */
function cardMenu(its){const it=its[0],n=its.length;const out=[];
  if(n>=2)out.push({t:'🔗 선으로 잇기',i:'link',fn:()=>join(its)});
  if(n===1)out.push({t:'🔗 다른 카드와 잇기…',i:'link',fn:()=>startJoin(it)});
  if(n===1&&it.type==='link')out.push({t:'↗ 링크 열기',i:'web',fn:()=>openURL(/^[a-z]+:\/\//i.test(it.url)?it.url:'https://'+it.url)},{t:'주소 복사',i:'copy',fn:()=>{navigator.clipboard?.writeText(it.url);toast('복사했어요')}});
  if(n===1&&(isMind(it)||parent(it.id)||kids(it.id).length))out.push({t:'우주로 띄워 보기 (3D)',i:'cube',fn:()=>Mind3D.open(rootOf(it).id)});
  if(n===1&&isMind(it)){const hasK=kids(it.id).length||it.clp;out.push({t:'🧠 마인드맵',i:'node',sub:[
    {t:'나의 작은 우주로 보기 (3D)',i:'cube',fn:()=>Mind3D.open(rootOf(it).id)},
    {t:'정렬: 오른쪽으로',i:'arrow',fn:()=>layout(it,'right')},{t:'정렬: 양쪽으로',i:'layout',fn:()=>layout(it,'both')},{t:'정렬: 아래로 (조직도)',i:'down',fn:()=>layout(it,'down')},{t:'정렬: 둥글게 (방사형)',i:'node',fn:()=>layout(it,'radial')},{t:'정렬: 왼쪽으로',i:'back',fn:()=>layout(it,'left')},'-',
    ...(hasK?[{t:it.clp?'가지 펼치기':'가지 접기',i:'toggle',fn:()=>fold(it)},{t:'가지 전체 선택',i:'grid',fn:()=>selectBranch(it)},{t:'가지를 이 색으로 통일',i:'color',fn:()=>colorBranch(it)}]:[]),
    {t:'설명 달기',i:'text',fn:()=>note(it)},{t:'아이콘 붙이기',i:'star',sub:[...EMO.map(e=>({t:e,fn:()=>emoji(it,e)})),{t:'아이콘 없애기',fn:()=>emoji(it,'')}]},
    {t:'개요(글)로 복사',i:'list',fn:()=>outline(it)}]})}
  return out}
function addMenu(pt){return[{t:'🧠 글 → 마인드맵',i:'node',fn:()=>fromOutline(pt)},{t:'나의 작은 우주 (3D 마인드맵)',i:'cube',fn:()=>Mind3D.open()}]}
return{layout,fold,join,openURL,cardMenu,addMenu,fromOutline,outline}})();
