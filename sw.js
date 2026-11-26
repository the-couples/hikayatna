// شبكة أولاً للصفحة، وإذا ما في نت منرجع لآخر نسخة محفوظة
const C='hk-v3';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','en.html','manifest.json','manifest-en.json','icons/icon-192.png'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))))});
// الإشعارات
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){try{d={body:e.data.text()}}catch(y){}}
 const title=d.title||'حكايتنا',url=d.url||'./';
 e.waitUntil(self.registration.showNotification(title,{body:d.body||'',icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:d.tag||'hk',renotify:true,data:{url}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.startsWith(self.registration.scope)&&'focus' in c)return c.focus()}return clients.openWindow(u)}))});
