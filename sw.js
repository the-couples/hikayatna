// حكايتنا: تخزين للعمل بدون إنترنت + الإشعارات
const C='hk-v4';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','en.html','manifest.json','manifest-en.json','icons/icon-192.png'])).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./'))))});
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data?e.data.text():''}}
  const en=String(d.url||'').includes('en.html');
  const opts={body:d.body||'',tag:d.tag||'hk',renotify:true,icon:'icons/icon-192.png',badge:'icons/icon-192.png',data:{url:d.url||'./?open=chat'},lang:en?'en':'ar',dir:en?'ltr':'rtl'};
  e.waitUntil((async()=>{
    await self.registration.showNotification(d.title||(en?'Hikayatna':'حكايتنا'),opts);
    try{if(self.navigator&&self.navigator.setAppBadge)await self.navigator.setAppBadge()}catch(x){}
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil((async()=>{
    const all=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of all){if(c.url.startsWith(self.registration.scope)){try{await c.focus()}catch(x){}c.postMessage({open:'chat'});return}}
    await self.clients.openWindow(url);
  })());
});
