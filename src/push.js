/* ========== الإشعارات (Web Push عبر Cloudflare Worker) ========== */
(function(){
const VAPID='__VAPID_PUBLIC__';
const PUSH_URL='__PUSH_URL__';
const A=()=>window.__app;const $=s=>document.querySelector(s);
const EN=document.documentElement.lang==='en';
const tx=(ar,en)=>EN?en:ar;
let db=null;
const supported=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.userAgent.includes('Mac')&&'ontouchend' in document);
const u8=b=>{b=b.replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';const s=atob(b);return Uint8Array.from(s,c=>c.charCodeAt(0))};
const other=k=>k==='hassan'?'leen':'hassan';
const ready=()=>PUSH_URL.startsWith('https://');
const state=()=>!supported()?(ios&&!standalone()?'ios':'no'):Notification.permission; // ios | no | default | granted | denied

async function subscribe(){const reg=await navigator.serviceWorker.ready;let s=await reg.pushManager.getSubscription();
 if(s&&s.options&&s.options.applicationServerKey){const a=new Uint8Array(s.options.applicationServerKey),b=u8(VAPID);if(a.length!==b.length||a.some((x,i)=>x!==b[i])){await s.unsubscribe();s=null}}
 if(!s)s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(VAPID)});return s.toJSON()}
async function saveSub(sj){const me=A().me;if(!me||!db)return;const ref=db.doc('push/'+me);const cur=await ref.get();const d=cur.exists?cur.data():{};
 const subs=(d.subs||[]).filter(x=>x.endpoint!==sj.endpoint);subs.unshift({endpoint:sj.endpoint,keys:sj.keys,t:Date.now()});
 await ref.set({subs:subs.slice(0,5),lang:document.documentElement.lang,t:Date.now()})}
async function enable(){const st=state();
 if(st==='ios'){A().toast(tx('على الآيفون تعمل الإشعارات بعد إضافة التطبيق إلى الشاشة الرئيسية وفتحه منها','On iPhone, notifications work after adding the app to your Home Screen and opening it from there'));return}
 if(st==='no'){A().toast(tx('هذا المتصفح لا يدعم الإشعارات','This browser does not support notifications'));return}
 let p=Notification.permission;if(p==='default')p=await Notification.requestPermission();
 if(p!=='granted'){A().toast(tx('الإشعارات مغلقة. فعّلها من إعدادات الهاتف للتطبيق','Notifications are blocked. Enable them in your phone settings'));render();return}
 try{await saveSub(await subscribe());A().toast(tx('تفعّلت الإشعارات 🔔','Notifications are on 🔔'))}catch(e){A().toast(tx('لم نستطع تفعيل الإشعارات، حاول مرة أخرى','Could not turn on notifications, try again'))}
 render()}
function snoozed(){try{return Date.now()<(+localStorage.getItem('hk-push-snooze')||0)}catch(e){return false}}
function render(){const bar=$('#pushbar');if(!bar)return;const st=state();const me=A()&&A().me;
 if(!me||!ready()||st==='granted'||st==='no'||snoozed()){bar.innerHTML='';return}
 const ot=A().WHO[other(me)]||'';
 bar.innerHTML='<div class="pushbar"><span class="pi">🔔</span><span class="pt">'+(st==='denied'?tx('الإشعارات مغلقة لهذا التطبيق. فعّلها من إعدادات الهاتف','Notifications are blocked. Turn them on in your phone settings'):st==='ios'?tx('أضف التطبيق للشاشة الرئيسية لتصلك رسائل ','Add the app to your Home Screen to get messages from ')+esc(ot)+tx(' وقبلاته',''):tx('فعّل الإشعارات لتعرف فورًا حين يراسلك ','Turn on notifications to know when ')+esc(ot)+tx('',' messages you'))+'</span>'+(st==='default'?'<button class="pb" id="push-on">'+tx('فعّل','Turn on')+'</button>':'')+'<button class="px" id="push-x" aria-label="'+tx('إغلاق','Close')+'">✕</button></div>';
 const on=$('#push-on');if(on)on.onclick=enable;
 $('#push-x').onclick=()=>{try{localStorage.setItem('hk-push-snooze',Date.now()+5*864e5)}catch(e){}render()}}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.__pushBtn=()=>{if(!ready())return '';const st=state();
 return '<button type="button" class="btn" id="pushset" style="width:100%;margin-bottom:6px" onclick="window.__pushEnable()">'+(st==='granted'?tx('🔔 الإشعارات مفعّلة · حدّث','🔔 Notifications on · refresh'):tx('🔔 فعّل الإشعارات','🔔 Turn on notifications'))+'</button>'};
window.__pushEnable=()=>{try{A().close()}catch(e){}enable()};

window.__notify=async(type,data)=>{try{
 if(!ready()||!db)return;const me=A().me;if(!me)return;const ot=other(me);
 const s=await db.doc('push/'+ot).get();if(!s.exists)return;const d=s.data();const subs=(d.subs||[]).map(x=>({endpoint:x.endpoint,keys:x.keys}));if(!subs.length)return;
 const en=d.lang==='en',name=A().WHO[me]||(en?'Your partner':'شريكك'),fem=A().G[me]==='f';
 let title,body,tag;
 if(type==='chat'){title=name;tag='chat';
  body=data.text?String(data.text).slice(0,140):data.img?(en?'📷 Photo':'📷 صورة'):data.aud?(en?'🎤 Voice message':'🎤 رسالة صوتية'):data.stk?(en?'🌟 Sticker':'🌟 ملصق'):'…';
  if(data.reply&&data.text)body=(en?'↩︎ ':'↩︎ ')+body}
 else if(type==='kiss'){title=en?'Hikayatna':'حكايتنا';tag='kiss';body=name+(en?' sent you a kiss 💋':(fem?' أرسلت لك قبلة 💋':' أرسل لك قبلة 💋'))}
 else return;
 const tok=await window.__idToken();
 const r=await fetch(PUSH_URL+'/notify',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify({subs,title,body,tag,url:en?'./en.html':'./'})});
 const j=await r.json().catch(()=>({}));
 if(j.gone&&j.gone.length)await db.doc('push/'+ot).set({...d,subs:(d.subs||[]).filter(x=>!j.gone.includes(x.endpoint))});
}catch(e){}};

window.__dbReady.then(d=>{db=d;
 const iv=setInterval(async()=>{if(!(A()&&A().me))return;clearInterval(iv);render();
  if(ready()&&supported()&&Notification.permission==='granted'){try{await saveSub(await subscribe())}catch(e){}}},500)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
})();
