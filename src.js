/* Achernar — 출처 표시 · AI 활용 내역
   2026학년도부터 수행평가에서 AI를 쓰면 'AI 종류 · 넣은 질문 · 활용 범위'를 밝혀야 해요.
   글을 붙여넣으면 어디서 왔는지 묻고, 카드에 표시를 남기고, 제출할 때 내역표로 모아 줘요. (앱 안에 AI는 없어요) */
const Src=(()=>{
const A=()=>typeof Canvas!=='undefined'?Canvas.api:null;
const TOOLS=['ChatGPT','Gemini','Claude','뤼튼','Copilot','기타 AI'];
const MIN=30;let bar=null,hideT=0;
const label=s=>s.k==='ai'?'AI · '+(s.tool||'AI'):s.k==='web'?'웹'+(s.u?' · '+host(s.u):''):'내가 씀';
const host=u=>{try{return new URL(/^https?:/i.test(u)?u:'https://'+u).hostname.replace(/^www\./,'')}catch(e){return String(u).slice(0,24)}};
const strip=h=>{const d=document.createElement('div');d.innerHTML=h||'';return (d.textContent||'').replace(/\s+/g,' ').trim()};

function add(it,s){const a=A();if(!a||!it)return;a.push();it.srcs=(it.srcs||[]).filter(x=>!(x.k==='me'&&s.k==='me'));if(s.k!=='me'||!it.srcs.length)it.srcs.push({...s,at:Date.now()});a.render();a.save()}
function clear(it){const a=A();a.push();delete it.srcs;a.render();a.save()}

/* 붙여넣은 뒤 묻는 작은 막대 */
function close(){clearTimeout(hideT);if(bar){bar.remove();bar=null}}
function ask(it,len){if(!it||len<MIN)return;close();const el=document.querySelector(`.card[data-id="${it.id}"]`);if(!el)return;const r=el.getBoundingClientRect();
  bar=document.createElement('div');bar.id='srcask';bar.innerHTML=`<span>이 글은 어디서 왔나요?</span><button data-k="me">내가 씀</button><button data-k="web">웹</button><button data-k="ai">AI</button><button class="x" aria-label="닫기">✕</button>`;
  document.body.appendChild(bar);const W=bar.offsetWidth;bar.style.left=Math.max(8,Math.min(innerWidth-W-8,r.left))+'px';bar.style.top=Math.max(64,r.top-46)+'px';
  bar.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation()});
  bar.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.classList.contains('x'))return close();const k=b.dataset.k;close();
    if(k==='me')return add(it,{k:'me'});if(k==='web')return askWeb(it);askAI(it)};
  hideT=setTimeout(close,9000)}
function askWeb(it){modal({title:'웹에서 가져온 글',cls:'mid',html:`<p class="note" style="margin:0 0 8px">가져온 페이지 주소를 적어 두면 참고 자료에 자동으로 들어가요 (비워 둬도 돼요).</p><input class="inp" id="srcu" placeholder="https://…" style="width:100%">`,
  btns:[{t:'취소'},{t:'표시하기',cls:'pr',fn:()=>{const u=document.querySelector('#srcu').value.trim();add(it,{k:'web',u})}}],onOpen:()=>setTimeout(()=>document.querySelector('#srcu')?.focus(),30)})}
function askAI(it){let tool=TOOLS[0];modal({title:'AI로 만든 글',cls:'mid',html:`<p class="note" style="margin:0 0 10px">수행평가에서는 <b>쓴 AI</b>와 <b>넣은 질문</b>을 밝혀야 해요. 제출할 때 내역표로 모아 드려요.</p>
  <div class="srct">${TOOLS.map((t,i)=>`<button class="${i?'':'on'}" data-t="${t}">${t}</button>`).join('')}</div>
  <label class="note" style="display:block;margin:12px 0 4px">AI에 넣은 질문 (프롬프트)</label><textarea class="inp" id="srcq" rows="3" style="width:100%;font:inherit;resize:vertical" placeholder="예) 광합성 과정을 중학생이 이해하기 쉽게 3줄로 설명해 줘"></textarea>
  <label class="note" style="display:block;margin:10px 0 4px">어디에 썼나요</label><input class="inp" id="srcw" style="width:100%" placeholder="예) 개념 정리 초안 · 내가 다시 고쳐 씀">`,
  btns:[{t:'취소'},{t:'표시하기',cls:'pr',fn:()=>{add(it,{k:'ai',tool,q:document.querySelector('#srcq').value.trim(),w:document.querySelector('#srcw').value.trim()})}}],
  onOpen:()=>{const b=document.querySelector('#mbody');b.querySelectorAll('[data-t]').forEach(x=>x.onclick=()=>{tool=x.dataset.t;b.querySelectorAll('[data-t]').forEach(y=>y.classList.toggle('on',y===x))});setTimeout(()=>document.querySelector('#srcq')?.focus(),30)}})}

/* 카드 표시 · 메뉴 */
function badge(it){const s=it.srcs;if(!s||!s.length)return '';const ai=s.filter(x=>x.k==='ai'),web=s.filter(x=>x.k==='web');if(!ai.length&&!web.length)return '';
  const t=ai.length?label(ai[ai.length-1]):label(web[web.length-1]);return `<span class="srcb ${ai.length?'ai':'web'}" title="${esc(s.map(x=>label(x)+(x.q?' — '+x.q:'')).join('\n'))}">${esc(t)}${s.length>1?' +'+(s.length-1):''}</span>`}
function cardMenu(its){if(its.length!==1)return[];const it=its[0];if(['frame','image','video','file','link','page'].includes(it.type))return[];
  return[{t:'출처 표시',i:'quote',sub:[{t:'내가 씀',fn:()=>add(it,{k:'me'})},{t:'웹에서 가져옴…',fn:()=>askWeb(it)},{t:'AI로 만듦…',fn:()=>askAI(it)},...(it.srcs&&it.srcs.length?['-',{t:'출처 표시 지우기',dg:1,fn:()=>clear(it)}]:[])]}]}

/* 내역표 */
function rows(){const a=A();if(!a)return[];const c=a.C();const out=[];(c.items||[]).forEach(it=>(it.srcs||[]).forEach(s=>{if(s.k==='ai')out.push({tool:s.tool||'AI',q:s.q||'(적지 않음)',w:s.w||'',where:strip(it.text||it.front||it.title||'').slice(0,40)||'카드',at:s.at})}));return out.sort((a,b)=>a.at-b.at)}
function webRefs(){const a=A();if(!a)return[];const out=[];(a.C().items||[]).forEach(it=>(it.srcs||[]).forEach(s=>{if(s.k==='web'&&s.u)out.push({t:host(s.u),u:s.u,h:host(s.u),d:s.at})}));return out}
function tableHTML(R){return R.length?`<table><thead><tr><th>번호</th><th>사용한 AI</th><th>넣은 질문</th><th>활용한 곳 · 범위</th><th>날짜</th></tr></thead><tbody>${R.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.tool)}</td><td>${esc(r.q)}</td><td>${esc(r.where)}${r.w?' — '+esc(r.w):''}</td><td>${new Date(r.at).toLocaleDateString('ko-KR')}</td></tr>`).join('')}</tbody></table>`:'<p>이 과제에서는 AI를 쓰지 않았어요.</p>'}
function makeTable(){const R=rows();const a=A();a.push();const[x,y]=a.center();const n=a.mk('doc',x-320,y-160,{w:640,text:`<h2>AI 활용 내역</h2>${tableHTML(R)}`});a.render();a.setSel([n.id]);a.save();toast(R.length?`AI 사용 ${R.length}건으로 내역표를 만들었어요`:'AI 사용 기록이 없어요 · ‘쓰지 않았어요’로 만들었어요',{ms:3000})}

/* 붙여넣기 감지: 캔버스의 붙여넣기가 끝난 뒤 어느 카드에 들어갔는지 찾아요 */
addEventListener('paste',e=>{const t=e.clipboardData&&e.clipboardData.getData('text/plain')||'';if(t.trim().length<MIN||/^\s*https?:\/\/\S+\s*$/.test(t))return;const a=A();if(!a||!a.C())return;
  const act=document.activeElement,card=act&&act.closest&&act.closest('.card');const before=new Set((a.C().items||[]).map(i=>i.id));
  setTimeout(()=>{let it=null;if(card)it=a.I(card.dataset.id);else{it=(a.C().items||[]).find(i=>!before.has(i.id))}if(it&&it.type!=='code')ask(it,t.trim().length)},120)},true);
addEventListener('keydown',e=>{if(e.key==='Escape'&&bar)close()},true);
return{badge,cardMenu,rows,webRefs,tableHTML,makeTable,add,_ask:ask}})();
