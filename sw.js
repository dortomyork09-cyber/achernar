/* Achernar 오프라인 캐시 — 파일을 고치면 VERSION 숫자를 올려 주세요 */
const VERSION='ach-v11';
const FILES=["./","auth.js","canvas.js","core.js","database.js","docppt.js","editor.js","extra.js","feat.js","graph.js","icons.js","icons/apple-touch-icon.png","icons/favicon-32.png","icons/icon-192.png","icons/icon.svg","icons/icon-512.png","icons/maskable-192.png","icons/maskable-512.png","index.html","manifest.webmanifest","mind.js","mind3d.js","ms.js","ms2.js","one.js","print.js","saveboard.js","style.css","sync.js","three.min.js","world.js","zen.js","vault.js","tpl.js","collab.js","hwp.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){/* 내 파일: 인터넷 먼저, 안 되면 저장본 */e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))));return}
  if(/fonts\.(googleapis|gstatic)\.com/.test(u.host)){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res})))}});
