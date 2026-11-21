/* Achernar 오프라인 캐시 — 파일을 고치면 VERSION 숫자를 올려 주세요 */
const VERSION='ach-v26';
const FILES=["./","privacy.html","auth.js","canvas.js","core.js","database.js","docppt.js","editor.js","extra.js","feat.js","graph.js","icons.js","icons/apple-touch-icon.png","icons/favicon-32.png","icons/icon-192.png","icons/icon.svg","icons/icon-512.png","icons/maskable-192.png","icons/maskable-512.png","index.html","manifest.webmanifest","mind.js","ms.js","ms2.js","one.js","print.js","saveboard.js","style.css","sync.js","world.js","zen.js","vault.js","tpl.js","collab.js","cloud.js","class.js","src.js","tl.js","share.js","hwp.js","submit.js","charmap.js","i18n.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* 폰 ‘공유 → Achernar’로 받은 것: 잠깐 보관했다가 앱을 열어요 */
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='POST')return;const u=new URL(r.url);if(u.origin!==location.origin||!u.pathname.endsWith('/share'))return;
  e.respondWith((async()=>{try{const fd=await r.formData();const item={t:Date.now(),title:String(fd.get('title')||''),text:String(fd.get('text')||''),url:String(fd.get('url')||''),files:fd.getAll('files').filter(f=>f&&f.size)};
    const db=await new Promise((res,rej)=>{const q=indexedDB.open('ach-share',1);q.onupgradeneeded=()=>q.result.createObjectStore('q',{autoIncrement:true});q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
    await new Promise((res,rej)=>{const t=db.transaction('q','readwrite');t.objectStore('q').add(item);t.oncomplete=res;t.onerror=()=>rej(t.error)})}catch(err){}
    return Response.redirect(new URL('./?share=1',self.registration.scope).href,303)})())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){/* 내 파일: 인터넷 먼저, 안 되면 저장본 */e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))));return}
  if(/fonts\.(googleapis|gstatic)\.com/.test(u.host)){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res})))}});
