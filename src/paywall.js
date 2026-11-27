/* ---------- الاشتراك: تجربة مجانية ثم اشتراك واحد للشريكين ---------- */
(function(){
const TRIAL_DAYS=7;
const FREE_PLANS=['beta'];          // الأزواج اللي سجّلوا بالنسخة التجريبية على الويب
const RC_KEY='';                     // مفتاح RevenueCat العام لأندرويد (goog_...) — يُضاف لاحقًا
const ENT='premium';
const DAY=864e5;
const A=()=>window.__app;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const native=()=>!!window.__NATIVE;
const P=()=>{const C=window.Capacitor;return C&&C.Plugins&&C.Plugins.Purchases};
let couple=null,rcReady=false,pkgs=null,shown=false,busy=false;

const premiumOn=c=>!!(c&&c.premium&&c.premium.until>Date.now());
const trialEnd=c=>(c&&c.createdAt||Date.now())+TRIAL_DAYS*DAY;
const daysLeft=c=>Math.max(0,Math.ceil((trialEnd(c)-Date.now())/DAY));
function gated(c){
  if(!c||premiumOn(c))return false;
  if(FREE_PLANS.includes(c.plan))return false;
  if(!native()&&c.plan!=='store')return false;
  return Date.now()>=trialEnd(c);
}
window.__sub={get couple(){return couple},gated:()=>gated(couple),daysLeft:()=>daysLeft(couple),premium:()=>premiumOn(couple),open:()=>show(false)};

/* ---------- RevenueCat (داخل تطبيق الأندرويد فقط) ---------- */
async function rcInit(){
  if(rcReady||!native()||!RC_KEY||!P()||!A()||!A().cid)return rcReady;
  try{await P().configure({apiKey:RC_KEY,appUserID:A().cid});rcReady=true;
    const r=await P().getCustomerInfo();await syncInfo(r&&r.customerInfo);
  }catch(e){console.warn('rc',e)}
  return rcReady;
}
async function loadPkgs(){
  if(pkgs)return pkgs;if(!(await rcInit()))return null;
  try{const o=await P().getOfferings();const cur=o&&o.current;
    if(cur)pkgs={m:(cur.availablePackages||[]).find(p=>p.packageType==='MONTHLY'),y:(cur.availablePackages||[]).find(p=>p.packageType==='ANNUAL')};
  }catch(e){console.warn('rc offers',e)}
  return pkgs;
}
async function syncInfo(info){
  const e=info&&info.entitlements&&info.entitlements.active&&info.entitlements.active[ENT];
  if(!e)return false;
  const until=Date.parse(e.expirationDate||'')||Date.now()+35*DAY;
  if(!couple||!couple.premium||Math.abs((couple.premium.until||0)-until)>6e4){
    try{await A().coupleSet({premium:{until,product:e.productIdentifier||'',store:'google',by:A().me||'',t:Date.now()}})}catch(x){}
  }
  return true;
}
async function buy(which){
  if(busy)return;busy=true;paint();
  try{const p=await loadPkgs();const pk=p&&p[which];
    if(!pk){A().toast('الاشتراك غير متاح الآن، حاولا لاحقًا');return}
    const r=await P().purchasePackage({aPackage:pk});
    if(await syncInfo(r&&r.customerInfo)){A().toast('تم الاشتراك 💞 شكرًا لكما');hide()}
  }catch(e){if(!(e&&(e.userCancelled||e.code==='1')))A().toast('لم يكتمل الدفع، حاولا مجددًا')}
  finally{busy=false;paint()}
}
async function restore(){
  if(busy)return;busy=true;paint();
  try{if(!(await rcInit())){A().toast('الاستعادة متاحة من تطبيق الهاتف');return}
    const r=await P().restorePurchases();
    if(await syncInfo(r&&r.customerInfo)){A().toast('تمت استعادة الاشتراك');hide()}else A().toast('لم نجد اشتراكًا سابقًا')
  }catch(e){A().toast('تعذّرت الاستعادة')}finally{busy=false;paint()}
}

/* ---------- الواجهة ---------- */
let el=null,blocking=false;
function priceOf(which){const p=pkgs&&pkgs[which];return p&&p.product&&p.product.priceString||(which==='y'?'599.99 TL':'79.99 TL')}
function paint(){
  if(!el)return;
  const canBuy=native()&&!!RC_KEY;
  const left=daysLeft(couple),on=premiumOn(couple);
  let title='اشتراك حكايتنا',sub='اشتراك واحد يكفي لكما معًا';
  if(on){title='اشتراككما فعّال';sub='شكرًا لكما! كل المزايا مفتوحة للشريكين.'}
  else if(blocking){title='انتهت التجربة المجانية';sub='اشتركا لتواصلا حكايتكما معًا. كل ذكرياتكما محفوظة بأمان.'}
  else if(left>0){sub='باقٍ من تجربتكما المجانية: '+left+' '+(left===1?'يوم':'أيام')}
  const dis=busy?' disabled':'';
  let plansHtml='';
  if(!on){
    plansHtml='<div class="pw-plans"><button class="pw-plan best" data-a="y"'+dis+'><span class="pw-tag">'+'الأوفر'+'</span><b>'+'سنوي'+'</b><i>'+esc(priceOf('y'))+'</i><small>'+'تقريبًا 50 TL شهريًا'+'</small></button>'
     +'<button class="pw-plan" data-a="m"'+dis+'><b>'+'شهري'+'</b><i>'+esc(priceOf('m'))+'</i><small>'+'يتجدد كل شهر'+'</small></button></div>';
    if(!canBuy)plansHtml+='<p class="pw-note">'+(native()?'الاشتراك سيتوفر قريبًا.':'للاشتراك حمّلا تطبيق حكايتنا من Google Play.')+'</p>';
    plansHtml+='<button class="pw-rest" data-a="r">'+'استعادة اشتراك سابق'+'</button>';
  }
  const accHtml=blocking?'<div class="pw-acc"><button data-a="out">'+'تسجيل الخروج'+'</button><button data-a="del">'+'حذف الحساب'+'</button></div>':'';
  const xHtml=blocking?'':'<button class="pw-x" aria-label="'+'إغلاق'+'" data-a="x">✕</button>';
  el.innerHTML=`<div class="pw-card" role="dialog" aria-modal="true">
   ${xHtml}
   <div class="pw-ic">💞</div>
   <h2>${esc(title)}</h2>
   <p class="pw-sub">${esc(sub)}</p>
   <ul class="pw-f"><li>💬 محادثة خاصة ومكالمات</li><li>📸 لحظاتنا وألبومنا بلا حدود</li><li>🏠 بيتنا: المشتريات والوجبات والتذكيرات</li><li>🔔 إشعارات فورية لشريكك</li><li>👫 اشتراك واحد يكفي للشريكين</li></ul>
   ${plansHtml}
   <p class="pw-legal">يتجدد الاشتراك تلقائيًا ويمكن إلغاؤه في أي وقت من إعدادات Google Play. <a href="https://the-couples.github.io/hikayatna/legal/terms.html" target="_blank" rel="noopener">الشروط</a> · <a href="https://the-couples.github.io/hikayatna/legal/privacy.html" target="_blank" rel="noopener">الخصوصية</a></p>
   ${accHtml}
  </div>`;
}
function show(block){
  blocking=!!block;
  if(!el){el=document.createElement('div');el.id='pw';el.className='pw';document.body.appendChild(el);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b){if(e.target===el&&!blocking)hide();return}
      const a=b.dataset.a;
      if(a==='x')hide();
      else if(a==='m'||a==='y'){if(!native()||!RC_KEY){A().toast(native()?'الاشتراك سيتوفر قريبًا':'للاشتراك حمّلا التطبيق من Google Play');return}buy(a)}
      else if(a==='r')restore();
      else if(a==='out')window.__logout&&window.__logout();
      else if(a==='del'){if(confirm('حذف حسابك نهائيًا؟ لا يمكن التراجع.'))window.__deleteAccount&&window.__deleteAccount()}
    });}
  shown=true;el.hidden=false;document.documentElement.classList.add('pw-on');paint();
  if(native()&&RC_KEY)loadPkgs().then(paint);
}
function hide(){if(!el)return;el.hidden=true;shown=false;blocking=false;document.documentElement.classList.remove('pw-on')}

function evaluate(){
  if(gated(couple)){if(!shown||!blocking)show(true)}
  else if(shown&&blocking)hide();
}

/* زر الاشتراك داخل الإعدادات */
function addSettingsRow(){
  const del=document.getElementById('delacc');if(!del||document.getElementById('subrow'))return;
  const b=document.createElement('button');b.id='subrow';b.type='button';b.className=del.className||'btn ghost';
  const on=premiumOn(couple),left=daysLeft(couple),free=couple&&FREE_PLANS.includes(couple.plan);
  b.textContent='💎 الاشتراك'+(on?' · فعّال':free?' · مجاني (من الأوائل)':left>0?' · '+left+' أيام تجربة':'');
  b.onclick=()=>{try{A().close()}catch(x){}show(false)};
  del.parentNode.insertBefore(b,del);
}
new MutationObserver(addSettingsRow).observe(document.documentElement,{childList:true,subtree:true});

/* ربط مع وثيقة الزوجين */
let unwatch=null,lastCid='';
setInterval(()=>{
  const a=A();if(!a||!a.cid||!a.coupleWatch)return;
  if(a.cid!==lastCid){lastCid=a.cid;if(unwatch)try{unwatch()}catch(x){}
    unwatch=a.coupleWatch(c=>{couple=c||null;evaluate();if(native())rcInit()});}
  else evaluate();
},2000);
})();
