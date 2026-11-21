/* Achernar — 나의 작은 우주: 마인드맵이 행성계가 되어 움직여요 (three.js) */
const Mind3D=(()=>{
const SAT={w:'#8B8EF0',y:'#F5C842',o:'#FF9F5A',p:'#FF7FA8',m:'#4FD39A',s:'#5AAEFF',l:'#A98BFF'};
const PAL=['#5AAEFF','#FF7FA8','#4FD39A','#FF9F5A','#A98BFF','#F5C842','#46C8D8','#FF6F6F'];
const FONT='"Pretendard","Noto Sans KR","Apple SD Gothic Neo",system-ui,sans-serif';
const WISH=['이게 10배 커지면?','반대로 하면 어떨까?','아이에게 설명한다면?','100년 뒤에는?','전혀 다른 분야와 섞으면?','가장 작게 시작한다면?','이걸 놀이로 바꾸면?','누가 제일 좋아할까?','돈이 없다면 어떻게?','오늘 당장 할 수 있는 한 가지는?'];
let st=null;
const txt=i=>{const d=document.createElement('div');d.innerHTML=(i?.text||i?.title||i?.cap||i?.name||(i?.checks||[]).map(c=>c.t).join(', ')||'').replace(/<br\s*\/?>/gi,' ');return d.textContent.trim()};
function loadThree(){if(window.THREE)return Promise.resolve();return new Promise((res,rej)=>{const s=document.createElement('script');s.src='three.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
const tex=c=>{const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t};
function label(text,col,big){const c=document.createElement('canvas'),g=c.getContext('2d');const fs=big?46:34;g.font=`700 ${fs}px ${FONT}`;const t=text.length>18?text.slice(0,17)+'…':text||'·';const W=Math.ceil(g.measureText(t).width+44+fs*.6),H=fs+26;c.width=W;c.height=H+10;
  g.fillStyle='rgb(255 255 255/.9)';rr(g,4,4,W-8,H,H/2);g.fill();g.fillStyle=col;g.beginPath();g.arc(4+H/2-2,4+H/2,8,0,7);g.fill();
  g.fillStyle='#202124';g.font=`700 ${fs}px ${FONT}`;g.textBaseline='middle';g.fillText(t,H/2+12,4+H/2+2);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(c),transparent:true,depthWrite:false,depthTest:false}));const k=big?.036:.03;sp.scale.set(c.width*k,c.height*k,1);sp.renderOrder=5;return sp}
/* 행성 표면 (줄무늬 + 반점) */
function skin(col,seed){const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');const base=new THREE.Color(col);g.fillStyle=col;g.fillRect(0,0,256,128);let r=(seed*7919)%233280;const rnd=()=>(r=(r*9301+49297)%233280)/233280;
  for(let y=0;y<128;y+=4+rnd()*10){const k=(rnd()-.5)*.3;const cc=base.clone().offsetHSL(0,0,k);g.fillStyle='#'+cc.getHexString();g.globalAlpha=.55;g.fillRect(0,y,256,3+rnd()*8)}
  g.globalAlpha=.25;for(let i=0;i<14;i++){g.fillStyle=rnd()>.5?'#fff':'#'+base.clone().offsetHSL(0,0,-.2).getHexString();g.beginPath();g.ellipse(rnd()*256,rnd()*128,4+rnd()*18,2+rnd()*7,0,0,7);g.fill()}g.globalAlpha=1;return tex(c)}
function glowTex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,inner);gr.addColorStop(.35,outer);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return tex(c)}
/* 그래프 모으기 */
function collect(rootId){const c=Canvas.api.C();let ids;
  if(rootId){ids=new Set([rootId]);let grew=true;while(grew){grew=false;c.links.forEach(l=>{if(ids.has(l.a)&&!ids.has(l.b)&&c.items.some(i=>i.id===l.b)){ids.add(l.b);grew=true}})}}
  else{const linked=new Set(c.links.flatMap(l=>[l.a,l.b]));ids=new Set(c.items.filter(i=>!i.hid&&linked.has(i.id)).map(i=>i.id))}
  const nodes=c.items.filter(i=>ids.has(i.id)).map(i=>({id:i.id,it:i,t:txt(i)||'생각'}));const links=c.links.filter(l=>ids.has(l.a)&&ids.has(l.b)).map(l=>({a:l.a,b:l.b}));
  const tg=new Set(links.map(l=>l.b));const roots=nodes.filter(n=>!tg.has(n.id));const root=rootId||(roots.length===1?roots[0].id:null);
  return{nodes,links,root,roots}}
/* 궤도 트리 만들기 */
function buildTree(){const N=st.N;N.forEach(n=>{n.kids=[];n.par=null});const seen=new Set([st.sun.id]);const q=[st.sun];
  while(q.length){const p=q.shift();st.g.links.filter(l=>l.a===p.id).forEach(l=>{const k=st.byId[l.b];if(k&&!seen.has(k.id)){seen.add(k.id);k.par=p;p.kids.push(k);q.push(k)}});
    if(!q.length){const lost=N.find(n=>!seen.has(n.id));if(lost){seen.add(lost.id);lost.par=st.sun;st.sun.kids.push(lost);q.push(lost)}}}
  const desc=n=>n.kids.reduce((s,k)=>s+1+desc(k),0);const depth=(n,d)=>{n.d=d;n.kids.forEach(k=>depth(k,d+1))};depth(st.sun,0);
  N.forEach(n=>{n.desc=desc(n);n.r=n===st.sun?4.6:Math.min(3.4,(n.d===1?2:1.1)+.4*Math.sqrt(n.desc))});
  const ext=n=>{const gap=n===st.sun?2.5:.9;let acc=n.r*1.6+1;n.kids.forEach(k=>{const e=ext(k);acc+=e;k.R=acc;acc+=e+gap});return n.ext=n.kids.length?acc-gap:n.r};ext(st.sun);
  N.forEach((n,i)=>{if(n===st.sun)return;n.w=(.9/Math.sqrt(n.R))*(n.d>1?1.6:1);if(n.ph==null)n.ph=Math.random()*Math.PI*2;if(!n.q){const tilt=n.d===1?(Math.random()-.5)*.35:(Math.random()-.5)*1.1;n.q=new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt,Math.random()*6,tilt*.6))}})}
function makeNode(nd,i){const isSun=nd.id===st.sunId;let col=nd.it.bg&&!/^#fff(fff)?$/i.test(nd.it.bg)?nd.it.bg:(nd.it.c&&nd.it.c!=='w'?SAT[nd.it.c]:PAL[i%PAL.length]);if(isSun)col='#FFC23D';
  const grp=new THREE.Group();const mat=isSun?new THREE.MeshBasicMaterial({color:'#FFE08A',map:skin('#FFC23D',i+3),transparent:true}):new THREE.MeshStandardMaterial({map:skin(col,i+1),roughness:.55,metalness:0,transparent:true,emissive:col,emissiveIntensity:.1});
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,40,28),mat);mesh.userData={id:nd.id};grp.add(mesh);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:isSun?glowTex('rgba(255,236,160,1)','rgba(255,190,60,.55)'):glowTex('rgba(255,255,255,.6)','rgba(150,160,255,.2)'),transparent:true,depthWrite:false}));grp.add(glow);
  const sp=label(nd.t,col,isSun);sp.userData={id:nd.id};st.scene.add(grp);st.scene.add(sp);
  return{...nd,grp,mesh,glow,sp,col,pos:new THREE.Vector3(),vel:new THREE.Vector3(),spin:.2+Math.random()*.5}}
function dress(){st.N.forEach(n=>{n.mesh.scale.setScalar(n.r);n.glow.scale.setScalar(n.r*(n===st.sun?7:3));
    if(n.ring){n.grp.remove(n.ring);n.ring.geometry.dispose();n.ring=null}if(n!==st.sun&&n.kids.length>=3){const rg=new THREE.Mesh(new THREE.RingGeometry(n.r*1.45,n.r*2.15,64),new THREE.MeshBasicMaterial({color:n.col,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}));rg.rotation.x=Math.PI/2.4;n.grp.add(rg);n.ring=rg}
    if(n.orb){st.scene.remove(n.orb);n.orb.geometry.dispose();n.orb=null}if(n.par){const pts=[];for(let k=0;k<=96;k++){const a=k/96*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*n.R,0,Math.sin(a)*n.R))}n.orb=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),st.orbMat);n.orb.quaternion.copy(n.q);st.scene.add(n.orb)}});
  st.links.visible=st.mode==='free';st.N.forEach(n=>n.orb&&(n.orb.visible=st.mode==='orbit'));const t=st.el.querySelector('.w3t span');if(t)t.textContent=`나의 작은 우주 · 별 ${st.N.length}개`}
/* 열기 */
async function open(rootId){if(st)return;One.home?.();await new Promise(r=>setTimeout(r,120));const g=collect(rootId);if(!g.nodes.length)return toast('캔버스에 카드를 만들고 선으로 이어 보세요 · 그게 우주의 행성이 돼요');
  document.body.classList.add('w3open');const el=document.createElement('div');el.id='m3d';el.innerHTML=`<div class="w3load"><div><i></i>우주를 펼치는 중…</div></div>`;document.body.appendChild(el);
  try{await loadThree()}catch(e){el.remove();document.body.classList.remove('w3open');return toast('3D 엔진을 불러오지 못했어요')}
  el.innerHTML=`<canvas></canvas><div class="w3top"><button class="w3b" data-m="back">${ic('back')}캔버스로</button><span class="w3t">${ic('node')}<span></span></span><span class="sp"></span><button class="w3b pri" data-m="mode">${ic('restore')}<span>궤도</span></button><button class="w3b" data-m="tour">${ic('play')}<span>우주 여행</span></button><button class="btn sm" data-m="pres" title="행성을 하나씩 넘기며 설명 (← → 스페이스)">${ic('board')}<span>우주 발표</span></button><button class="w3b" data-m="sky">${ic('moon')}<span>밤하늘</span></button><button class="w3b" data-m="shot">${ic('camera')}사진</button></div><div class="w3hint">끌어서 돌리기 · 휠로 확대 · 행성을 누르면 따라가요 · 빈 곳 더블클릭: 새 행성 · 스페이스: 시간 멈춤</div>`;
  const cv=el.querySelector('canvas');const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true});R.setPixelRatio(Math.min(devicePixelRatio,1.75));R.setSize(innerWidth,innerHeight);R.outputEncoding=THREE.sRGBEncoding;
  const scene=new THREE.Scene();const cam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,3000);st={el,R,scene,cam,g,mode:'orbit',speed:1,sel:null,time:0,clock:new THREE.Clock(),shoot:[],night:false};
  st.orbMat=new THREE.LineBasicMaterial({color:'#8F91EE',transparent:true,opacity:.3});
  scene.add(new THREE.AmbientLight('#ffffff',.5));st.sunLight=new THREE.PointLight('#fff4dd',1.4,0,0);scene.add(st.sunLight);scene.add(new THREE.HemisphereLight('#ffffff','#b9bdf5',.35));
  st.stars=[0,1].map(k=>{const n=900,p=new Float32Array(n*3);for(let i=0;i<n;i++){const v=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(300+Math.random()*500);p.set([v.x,v.y,v.z],i*3)}const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(p,3));const pt=new THREE.Points(gg,new THREE.PointsMaterial({color:'#8E90E8',size:k?2.4:1.5,sizeAttenuation:false,transparent:true,opacity:.7}));scene.add(pt);return pt});
  st.neb=[['rgba(169,139,255,.35)','rgba(169,139,255,.12)'],['rgba(90,174,255,.3)','rgba(90,174,255,.1)'],['rgba(255,127,168,.25)','rgba(255,127,168,.08)']].map(([a,b],i)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(a,b),transparent:true,depthWrite:false}));s.scale.setScalar(420);s.position.set([-260,280,40][i],[60,-80,180][i],[-400,-300,-500][i]);scene.add(s);return s});
  // 태양: 뿌리가 하나면 그 생각, 여러 개면 '나의 우주'
  let sunNd=g.nodes.find(n=>n.id===g.root);if(!sunNd){sunNd={id:'__me',it:{x:0,y:0},t:'나의 우주',virtual:1};g.nodes.unshift(sunNd);g.roots.forEach(r=>g.links.push({a:'__me',b:r.id}))}st.sunId=sunNd.id;
  st.N=g.nodes.map((nd,i)=>makeNode(nd,i));st.byId=Object.fromEntries(st.N.map(n=>[n.id,n]));st.sun=st.byId[st.sunId];
  st.links=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:'#2563EB',transparent:true,opacity:.6}));scene.add(st.links);
  buildTree();dress();
  st.c={theta:.5,phi:1.05,dist:Math.max(30,st.sun.ext*1.3),tgt:new THREE.Vector3()};st.d={...st.c,tgt:new THREE.Vector3()};
  bind(cv);el.querySelector('.w3top').onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;const k=b.dataset.m,lb=b.querySelector('span');
    if(k==='back')close();
    if(k==='mode'){st.mode=st.mode==='orbit'?'free':'orbit';lb.textContent=st.mode==='orbit'?'궤도':'자유 연결';b.classList.toggle('pri',st.mode==='orbit');st.N.forEach(n=>n.vel.set(0,0,0));dress();if(st.sel)select(st.sel)}
    if(k==='speed')setSpeed([1,3,8,0][([1,3,8,0].indexOf(st.speed)+1)%4]);
    if(k==='tour')st.tour?stopTour():tour();
    if(k==='pres')st.pres?stopPres():startPres();
    if(k==='wish')wish();
    if(k==='sky'){st.night=!st.night;el.classList.toggle('night',st.night);lb.textContent=st.night?'낮하늘':'밤하늘';st.stars.forEach(s=>s.material.color.set(st.night?'#ffffff':'#8E90E8'));st.orbMat.color.set(st.night?'#B9BBFF':'#8F91EE')}
    if(k==='shot')shot()};
  st.onR=()=>{R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};addEventListener('resize',st.onR);
  st.onK=e=>{if(!$('#modal').hidden||e.target.closest?.('input,textarea'))return;if(st.pres){if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();return presGo(st.pres.i+1)}if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)){e.preventDefault();return presGo(st.pres.i-1)}if(e.key==='Escape'){e.preventDefault();return stopPres()}}if(e.key==='Escape'){if(st.tour)return stopTour();if($('#w3card'))return select(null);close()}if(e.key===' '){e.preventDefault();setSpeed(st.speed?0:1)}};addEventListener('keydown',st.onK);
  loop()}
function setSpeed(v){st.speed=v;toast(v?'다시 움직여요':'잠깐 멈췄어요 · 스페이스로 다시 움직여요',{ms:1200})}
function shot(){const R=st.R,pr=R.getPixelRatio();R.setPixelRatio(Math.min(4,Math.max(2,devicePixelRatio)*1.5));R.setSize(innerWidth,innerHeight);R.render(st.scene,st.cam);R.domElement.toBlob(bl=>{bl&&saveFile('my-universe.png',bl);R.setPixelRatio(pr);R.setSize(innerWidth,innerHeight)},'image/png')}
/* 움직임 */
function stepOrbit(dt){const walk=n=>{let target;if(n===st.sun)target=new THREE.Vector3();else{n.ph+=dt*n.w*st.speed;target=new THREE.Vector3(Math.cos(n.ph)*n.R,0,Math.sin(n.ph)*n.R).applyQuaternion(n.q).add(n.par.pos);if(n.orb)n.orb.position.copy(n.par.pos)}
    n.pos.lerp(target,Math.min(1,dt*(st.time<3?1.8:14)));n.kids.forEach(walk)};walk(st.sun)}
function stepFree(dt){const N=st.N,L=st.g.links;const k=Math.min(dt,.033)*60;
  for(let i=0;i<N.length;i++){const a=N[i];for(let j=i+1;j<N.length;j++){const b=N[j];const d=a.pos.clone().sub(b.pos);const l=d.length()||.01;if(l>70)continue;const f=Math.min(4,(90+(a.r+b.r)*20)/(l*l));d.multiplyScalar(f/l);a.vel.addScaledVector(d,.02*k);b.vel.addScaledVector(d,-.02*k)}}
  L.forEach(l=>{const a=st.byId[l.a],b=st.byId[l.b];if(!a||!b)return;const d=b.pos.clone().sub(a.pos);const len=d.length()||.01;const f=(len-(a.r+b.r+8))*.02;d.multiplyScalar(f/len);a.vel.addScaledVector(d,k*.6);b.vel.addScaledVector(d,-k*.6)});
  N.forEach((n,i)=>{n.vel.addScaledVector(n.pos,-.0015*k);n.vel.y+=Math.sin(st.time*.8+i)*.0016*k;n.vel.multiplyScalar(.9);if(st.speed)n.pos.addScaledVector(n.vel,k*.6)});
  const arr=new Float32Array(L.length*6);L.forEach((l,i)=>{const a=st.byId[l.a],b=st.byId[l.b];if(a&&b)arr.set([a.pos.x,a.pos.y,a.pos.z,b.pos.x,b.pos.y,b.pos.z],i*6)});st.links.geometry.setAttribute('position',new THREE.BufferAttribute(arr,3));st.links.geometry.computeBoundingSphere()}
function loop(){if(!st)return;st.raf=requestAnimationFrame(loop);if(document.hidden)return;const dt=Math.min(st.clock.getDelta(),.05);st.time+=dt;
  st.mode==='orbit'?stepOrbit(dt):stepFree(dt);
  st.N.forEach(n=>{n.grp.position.copy(n.pos);if(st.speed)n.mesh.rotation.y+=dt*n.spin*st.speed;if(n.ring&&st.speed)n.ring.rotation.z+=dt*.1;n.sp.position.copy(n.pos).add(new THREE.Vector3(0,-(n.r+1.4),0))});st.sunLight.position.copy(st.sun.pos);
  st.stars[0].material.opacity=.55+Math.sin(st.time*1.7)*.25;st.stars[1].material.opacity=.55+Math.sin(st.time*1.1+2)*.3;st.neb.forEach((s,i)=>s.material.rotation+=dt*.01*(i%2?1:-1));
  shootStep(dt);
  const fol=st.tourN||st.byId[st.sel];if(fol)st.d.tgt.copy(fol.pos);
  if(!st.drag&&!fol)st.d.theta+=dt*.05;
  const c=st.c,d=st.d,k=1-Math.pow(.002,dt);c.theta+=(d.theta-c.theta)*k;c.phi+=(d.phi-c.phi)*k;c.dist+=(d.dist-c.dist)*k;c.tgt.lerp(d.tgt,Math.min(1,k*1.5));const s=Math.sin(c.phi);st.cam.position.set(c.tgt.x+c.dist*s*Math.sin(c.theta),c.tgt.y+c.dist*Math.cos(c.phi),c.tgt.z+c.dist*s*Math.cos(c.theta));st.cam.lookAt(c.tgt);
  st.R.render(st.scene,st.cam)}
/* 별똥별 */
function shootStep(dt){st.nextShoot=(st.nextShoot??3)-dt;if(st.nextShoot<0){st.nextShoot=5+Math.random()*7;spawnShoot()}
  st.shoot=st.shoot.filter(s=>{s.t+=dt;s.line.position.addScaledVector(s.v,dt);s.line.material.opacity=Math.max(0,1-s.t/s.life);if(s.t>s.life){st.scene.remove(s.line);s.line.geometry.dispose();return false}return true})}
function spawnShoot(to){const from=to?to.clone().add(new THREE.Vector3(60,50,-30)):new THREE.Vector3((Math.random()-.5)*300,80+Math.random()*80,(Math.random()-.5)*300);const end=to||new THREE.Vector3(from.x+(Math.random()-.5)*200,from.y-120,from.z+(Math.random()-.5)*200);const life=to?1.1:1.6;const v=end.clone().sub(from).divideScalar(life);
  const tail=v.clone().normalize().multiplyScalar(-14);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),tail]),new THREE.LineBasicMaterial({color:st.night?'#ffffff':'#2563EB',transparent:true}));line.position.copy(from);st.scene.add(line);st.shoot.push({line,v,t:0,life})}
function wish(){const host=st.byId[st.sel]||st.sun;const q=WISH[Math.floor(Math.random()*WISH.length)];spawnShoot(host.pos.clone());
  setTimeout(async()=>{if(!st)return;const v=await ask('별똥별이 떨어졌어요',{sub:`「${host.t.slice(0,24)}」에게 온 질문 — ${q}`,ph:'떠오른 생각을 적으면 새 위성이 돼요',ok:'위성 만들기'});if(st&&v&&v.trim())addPlanet(host,v.trim())},1100)}
/* 새 행성·위성 */
function addPlanet(host,text){const a=Canvas.api,C=a.C();a.push();const hi=host.virtual?null:host.it;const it={id:uid(),type:'node',text:esc(text),x:(hi?.x??0)+240,y:(hi?.y??0)+Math.round((Math.random()-.5)*240),w:150,h:46,c:['s','p','m','o','l','y'][Math.floor(Math.random()*6)]};C.items.push(it);
  if(hi)C.links.push({id:uid(),a:hi.id,b:it.id});a.render();a.save();
  const nd=makeNode({id:it.id,it,t:text},st.N.length);nd.pos.copy(host.pos);st.N.push(nd);st.byId[it.id]=nd;st.g.links.push({a:host.id,b:it.id});buildTree();dress();toast(`「${text.slice(0,20)}」 별이 태어났어요`);select(it.id)}
async function newPlanet(){const host=st.byId[st.sel]||st.sun;const v=await ask(host===st.sun?'새 행성 만들기':`「${host.t.slice(0,16)}」의 위성 만들기`,{ph:'생각을 적어 보세요',ok:'만들기'});if(st&&v&&v.trim())addPlanet(host,v.trim())}
async function rename(n){const v=await ask('이름 바꾸기',{val:n.t,ok:'바꾸기'});if(!st||!v||!v.trim())return;const a=Canvas.api;a.push();n.it.text=esc(v.trim());a.render();a.save();n.t=v.trim();st.scene.remove(n.sp);n.sp.material.map.dispose();n.sp=label(n.t,n.col,n===st.sun);n.sp.userData={id:n.id};st.scene.add(n.sp);select(n.id)}
/* 우주 여행 */
function tour(){const order=[];const walk=n=>{order.push(n);n.kids.forEach(walk)};walk(st.sun);select(null);st.tour={order,i:0};const b=st.el.querySelector('[data-m=tour]');b.classList.add('pri');b.querySelector('span').textContent='여행 멈추기';
  const next=()=>{if(!st?.tour)return;const n=order[st.tour.i++%order.length];st.tourN=n;st.d.dist=Math.max(18,n.r*8+(n.kids.length?n.ext*1.4:0));showTag(n);st.tour.tm=setTimeout(next,3200)};next()}
function stopTour(){if(!st?.tour)return;clearTimeout(st.tour.tm);st.tour=null;st.tourN=null;$('#m3dtag')?.remove();const b=st.el.querySelector('[data-m=tour]');b.classList.remove('pri');b.querySelector('span').textContent='우주 여행'}
function showTag(n){$('#m3dtag')?.remove();const d=document.createElement('div');d.id='m3dtag';d.innerHTML=`<small>${n===st.sun?'태양':n.d===1?'행성':'위성'}</small><b>${esc(n.t.slice(0,40))}</b>${n.it?.note?`<p>${esc(String(n.it.note).slice(0,120))}</p>`:''}`;st.el.appendChild(d)}
/* 우주 발표: 행성을 하나씩 넘기며 설명 */
function startPres(){stopTour();const order=[];const walk=n=>{if(!n.virtual)order.push(n);n.kids.forEach(walk)};walk(st.sun);if(!order.length)return;select(null);st.pres={order,i:0};st.el.classList.add('m3pres');
  const b=st.el.querySelector('[data-m=pres]');b.classList.add('pri');b.querySelector('span').textContent='발표 끝내기';try{st.el.requestFullscreen?.().catch(()=>{})}catch(e){}presGo(0)}
function presGo(i){if(!st?.pres)return;const P=st.pres;i=Math.max(0,Math.min(P.order.length-1,i));P.i=i;const n=P.order[i];st.tourN=n;st.d.dist=Math.max(16,n.r*7+(n.kids.length?n.ext*1.2:0));
  $('#m3dtag')?.remove();const d=document.createElement('div');d.id='m3dtag';d.className='big';const kids=n.kids.filter(k=>!k.virtual).map(k=>k.t);
  d.innerHTML=`<small>${n===st.sun?'중심 생각':n.d===1?'큰 가지':'작은 가지'} · ${i+1} / ${P.order.length}</small><b>${esc(n.t.slice(0,60))}</b>${n.it?.note?`<p>${esc(String(n.it.note).slice(0,200))}</p>`:''}${kids.length?`<ul>${kids.slice(0,6).map(k=>`<li>${esc(k.slice(0,40))}</li>`).join('')}</ul>`:''}<div class="m3pb"><button data-pv="-1">← 이전</button><button data-pv="1">다음 →</button></div>`;
  d.onclick=e=>{const v=e.target.closest('[data-pv]')?.dataset.pv;if(v)presGo(P.i+ +v)};st.el.appendChild(d)}
function stopPres(){if(!st?.pres)return;st.pres=null;st.tourN=null;$('#m3dtag')?.remove();st.el.classList.remove('m3pres');const b=st.el.querySelector('[data-m=pres]');b.classList.remove('pri');b.querySelector('span').textContent='우주 발표';try{document.fullscreenElement&&document.exitFullscreen()}catch(e){}}
/* 조작 */
function bind(cv){let down=null;const ray=new THREE.Raycaster(),v=new THREE.Vector2();const hit=e=>{const r=cv.getBoundingClientRect();v.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(v,st.cam);return ray.intersectObjects(st.N.flatMap(n=>[n.mesh,n.sp]),false)[0]};
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);down={x:e.clientX,y:e.clientY,b:e.button,m:false};st.drag=true});
  cv.addEventListener('pointermove',e=>{if(!down){cv.style.cursor=hit(e)?'pointer':'grab';return}const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.hypot(dx,dy)>4)down.m=true;if(!down.m)return;down.x=e.clientX;down.y=e.clientY;
    if(down.b===2||e.shiftKey){const s=st.d.dist*.0015;const rt=new THREE.Vector3().setFromMatrixColumn(st.cam.matrix,0),up=new THREE.Vector3().setFromMatrixColumn(st.cam.matrix,1);if(st.sel)select(null);st.d.tgt.addScaledVector(rt,-dx*s).addScaledVector(up,dy*s)}else{st.d.theta-=dx*.006;st.d.phi=Math.max(.15,Math.min(2.95,st.d.phi-dy*.006))}});
  cv.addEventListener('pointerup',e=>{st.drag=false;if(!down)return;const m=down.m;down=null;if(m)return;if(st.tour)stopTour();const h=hit(e);select(h?h.object.userData.id:null)});
  cv.addEventListener('dblclick',e=>{const h=hit(e);if(h){const n=st.byId[h.object.userData.id];if(!n.virtual)edit(n.id)}else newPlanet()});
  cv.addEventListener('wheel',e=>{e.preventDefault();st.d.dist=Math.max(5,Math.min(900,st.d.dist*Math.exp(e.deltaY*.0012)))},{passive:false})}
function family(id){const keep=new Set([id]);const n=st.byId[id];const down=x=>x.kids.forEach(k=>{keep.add(k.id);down(k)});down(n);let p=n.par;while(p){keep.add(p.id);p=p.par}return keep}
function select(id){st.sel=id;const keep=id?family(id):null;
  st.N.forEach(n=>{const on=!id||keep.has(n.id);n.mesh.material.opacity=on?1:.22;n.sp.material.opacity=on?1:.2;n.glow.material.opacity=on?1:.15;if(n.orb)n.orb.visible=st.mode==='orbit'&&on});
  $('#w3card')?.remove();if(!id){st.d.tgt.set(0,0,0);st.d.dist=Math.max(st.d.dist,30,st.sun.ext*1.3);return}
  const n=st.byId[id];st.d.dist=Math.max(18,n.r*8+(n.kids.length?n.ext*1.5:0));const kind=n===st.sun?'태양':n.d===1?'행성':'위성';
  const d=document.createElement('div');d.id='w3card';
  d.innerHTML=`<div class="w3ch"><span class="w3ci" style="background:${n.col}26;color:${n.col}">${ic('node')}</span><div style="flex:1;min-width:0"><b>${esc(n.t.slice(0,60))}</b><br><small>${kind} · ${n===st.sun?'행성':'위성'} ${n.kids.length}개${n.desc>n.kids.length?` · 전체 ${n.desc}개`:''}</small></div><button class="ib sm" data-x aria-label="닫기">${ic('x')}</button></div>${n.it?.note?`<p>${esc(n.it.note)}</p>`:''}
  <div class="w3cb" style="flex-wrap:wrap"><button class="btn sm ghost" data-b="add">${n===st.sun?'+ 행성':'+ 위성'}</button>${n.virtual?'':`<button class="btn sm ghost" data-b="ren">이름 바꾸기</button><button class="btn sm pr" data-b="edit">캔버스에서 편집</button>`}</div>`;
  d.onclick=e=>{if(e.target.closest('[data-x]'))return select(null);const b=e.target.closest('[data-b]');if(!b)return;const k=b.dataset.b;if(k==='edit')edit(id);if(k==='add')newPlanet();if(k==='wish')wish();if(k==='ren')rename(n)};st.el.appendChild(d)}
function edit(id){close();setTimeout(()=>Feat.fly(id),250)}
function close(){if(!st)return;stopTour();stopPres();cancelAnimationFrame(st.raf);removeEventListener('resize',st.onR);removeEventListener('keydown',st.onK);try{st.scene.traverse(o=>{o.geometry?.dispose?.();o.material?.map?.dispose?.();o.material?.dispose?.()});st.R.dispose()}catch(e){}st.el.remove();st=null;document.body.classList.remove('w3open')}
return{open,close,isOpen:()=>!!st}})();
