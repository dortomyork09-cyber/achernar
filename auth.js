/* ULTIMATE NOTE — 로그인 (이 기기 계정 + claude.ai 계정) */
const Auth=(()=>{let U=null,me=null;
const acc=()=>S.account||null;
async function hash(pw,salt){try{const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pw));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('')}catch(e){let h=0;for(const c of salt+pw)h=(h*31+c.charCodeAt(0))>>>0;return'f'+h}}
function avatar(){const a=$('#me');if(!a)return;const n=acc()?.name||me?.name||'';a.textContent=n?[...n][0]:'나';a.title=n?`${n}${acc()?' · 이 기기 계정':''}${me?' · claude.ai 연결됨':''}`:'로그인';a.classList.toggle('in',!!(acc()||me))}
async function start(){avatar();try{U=await window.claude?.use?.('user');if(U){me=await U.me();avatar()}}catch(e){}}
function lockScreen(){if(!acc())return Promise.resolve(true);return new Promise(res=>{const d=document.createElement('div');d.id='login';
  d.innerHTML=`<form class="lg"><div class="lgav">${esc([...acc().name][0]||'나')}</div><h2>${esc(acc().name)}</h2><p class="note">비밀번호를 입력하면 이어서 작업해요</p><input class="inp big" type="password" id="lgpw" placeholder="비밀번호" autocomplete="current-password"><p class="lgerr" id="lgerr"></p><button class="btn pr" style="width:100%;justify-content:center;height:46px">로그인</button><button type="button" class="lgforgot" id="lgfg">비밀번호를 잊었어요</button></form>`;
  document.body.appendChild(d);const pw=$('#lgpw');setTimeout(()=>pw.focus(),50);
  d.querySelector('form').onsubmit=async e=>{e.preventDefault();if(await hash(pw.value,acc().salt)===acc().hash){d.remove();res(true)}else{$('#lgerr').textContent='비밀번호가 달라요';pw.select()}};
  $('#lgfg').onclick=()=>{$('#lgerr').innerHTML='데이터는 이 기기에 있어서 비밀번호를 되살릴 수 없어요. 백업 파일이 있다면 브라우저 데이터를 지우고 백업을 불러오세요.'}})}
async function signup(){const n=await ask('이 기기 계정 만들기',{sub:'이름을 정해 주세요',ph:'이름'});if(!n)return;const p1=await ask('비밀번호',{sub:'4자 이상 · 이 기기에서 노트를 열 때 써요',ph:'비밀번호'});if(!p1||p1.length<4)return toast('비밀번호는 4자 이상이어야 해요');
  const p2=await ask('비밀번호 한 번 더',{ph:'비밀번호 확인'});if(p1!==p2)return toast('두 비밀번호가 달라요');const salt=uid();S.account={name:n,salt,hash:await hash(p1,salt),created:now()};save();flush();avatar();toast(`${n}님, 계정을 만들었어요 · 다음부터 열 때 비밀번호를 물어봐요`)}
async function logout(){flush();await lockScreen();toast('다시 로그인했어요')}
async function changePw(){const o=await ask('지금 비밀번호',{ph:'지금 비밀번호'});if(o==null)return;if(await hash(o,acc().salt)!==acc().hash)return toast('비밀번호가 달라요');const p1=await ask('새 비밀번호',{ph:'4자 이상'});if(!p1||p1.length<4)return toast('4자 이상이어야 해요');acc().salt=uid();acc().hash=await hash(p1,acc().salt);save();toast('비밀번호를 바꿨어요')}
async function remove(){const o=await ask('계정 없애기',{sub:'비밀번호를 입력하면 로그인 없이 열리게 돼요 (노트는 그대로)',ph:'비밀번호'});if(o==null)return;if(await hash(o,acc().salt)!==acc().hash)return toast('비밀번호가 달라요');delete S.account;save();avatar();toast('계정을 없앴어요')}
function menuAt(x,y){const a=acc();menu(x,y,[{h:a?a.name+' · 이 기기 계정':'로그인하지 않았어요'},
  ...(a?[{t:'로그아웃 (잠그기)',i:'lock',fn:logout},{t:'비밀번호 바꾸기',i:'edit',fn:changePw},{t:'계정 없애기',i:'x',dg:1,fn:remove}]:[{t:'이 기기 계정 만들기',i:'user',fn:signup}]),'-',
  {h:me?`claude.ai 연결됨${me.name?' · '+me.name:''}`:'claude.ai 계정'},...(me?[{t:'기기 간 동기화: '+({on:'켜짐',busy:'동기화 중',bad:'실패',off:'꺼짐',local:'꺼짐'}[Sync.status()]||''),i:'restore',fn:()=>openSettings('mods')}]:[{t:'claude.ai에서 열면 자동으로 로그인돼요',i:'info',dis:1}]),
  '-',{t:'설정',i:'settings',fn:()=>openSettings()},{t:'전체 백업',i:'dl',fn:()=>backupAll()}])}
return{start,lockScreen,signup,logout,menuAt,avatar,isIn:()=>!!(acc()||me)}})();
