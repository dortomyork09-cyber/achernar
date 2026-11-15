/* Achernar 간단 화면 — 버튼 하나로 모든 것 */
const Zen={
 init(){if($('#zbar'))return;document.body.insertAdjacentHTML('beforeend',`<div id="zbar"><button id="zmenu" aria-label="메뉴">${ic('menu')}</button><span id="ztitle" contenteditable="plaintext-only" spellcheck="false"></span></div>
  <div id="zpanel" hidden><div class="zp"><div class="zph"><span class="msmark"><i></i><i></i><i></i></span><b>Achernar</b><button class="ib sm" id="zclose" aria-label="닫기">${ic('x')}</button></div>
  <div class="znew"><button data-zn="canvas">${ic('canvas')}<b>새 캔버스</b></button><button data-zn="doc">${ic('page')}<b>새 노트</b></button><button data-zn="more">${ic('plus')}<b>다른 종류</b></button></div>
  <input class="inp zq" id="zq" placeholder="찾기…" autocomplete="off"><div class="zlist" id="zlist"></div>
  <div class="zfoot"><button data-zf="full">${ic('layout')}모든 도구 보기</button><button data-zf="settings">${ic('settings')}설정</button></div></div></div>`);
  const t=$('#ztitle');t.oninput=()=>{const p=curPage();if(!p)return;p.title=t.textContent.trim();touch(p)};t.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();t.blur()}};
  $('#zmenu').onclick=()=>Zen.open();$('#zclose').onclick=()=>Zen.close();$('#zpanel').onclick=e=>{if(e.target.id==='zpanel')return Zen.close();
   const n=e.target.closest('[data-zn]');if(n){Zen.close();const k=n.dataset.zn;if(k==='more')return openCreate();return k==='canvas'?create('canvas',{title:'',cv:Canvas.make('blank')}):create('doc')}
   const g=e.target.closest('[data-zgo]');if(g){Zen.close();return go(g.dataset.zgo)}
   const f=e.target.closest('[data-zf]');if(f){Zen.close();if(f.dataset.zf==='settings')return openSettings();S.settings.simple=0;applySettings();save();render()}};
  $('#zq').oninput=()=>Zen.list();$('#zq').onkeydown=e=>{if(e.key==='Enter'){const b=$('#zlist [data-zgo]');if(b)b.click()}if(e.key==='Escape')Zen.close()};
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#zpanel').hidden){Zen.close()}},true)},
 open(){$('#zpanel').hidden=false;$('#zq').value='';Zen.list();setTimeout(()=>$('#zq').focus(),30)},
 close(){$('#zpanel').hidden=true},
 list(){const q=$('#zq').value.trim().toLowerCase();let l=live().filter(p=>!p.archived&&!p.objOf&&p.type!=='folder').sort((a,b)=>b.updated-a.updated);if(q)l=l.filter(p=>pTitle(p).toLowerCase().includes(q)||(p.type==='doc'&&Editor.text(p).toLowerCase().includes(q)));
  const cur=curPage()?.id;$('#zlist').innerHTML=l.length?l.slice(0,40).map(p=>`<button data-zgo="page:${p.id}" class="${p.id===cur?'on':''}"><span class="zi">${p.icon||ic(TYPES[p.type].i)}</span><span class="zt">${esc(pTitle(p))}</span><small>${ago(p.updated)}</small></button>`).join(''):'<p class="note" style="padding:10px">없어요</p>'},
 after(){const p=curPage(),t=$('#ztitle');if(!t)return;if(document.activeElement!==t)t.textContent=p?(p.title||''):'';t.dataset.ph=p?'제목 없음':'';t.hidden=!p}};
