// Sindh Plus Media Network — service worker (offline shell cache)
const CACHE='spmn-v10.2';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  // Never cache Firebase/Firestore/Google APIs — always go to network
  if(/firestore|firebase|googleapis|gstatic/.test(u.hostname))return;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      const net=fetch(e.request).then(r=>{
        if(r&&r.ok&&u.origin===location.origin){const c=r.clone();caches.open(CACHE).then(cc=>cc.put(e.request,c));}
        return r;
      }).catch(()=>hit);
      return hit||net;
    })
  );
});
