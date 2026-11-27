/* ========== أقسام: بيتنا (المشتريات، طعام الأسبوع، التذكيرات) + أمنياتنا (أفكار السهرات، الأمنيات والهدايا) + المزاج ========== */
(function(){
const A=()=>window.__app;const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let db=null,shop=[],meals={},rems=[],wishes=[],moods={},homeSeg='shop',wishSeg='ideas',showBought=false;
const W=k=>(A().WHO[k]||'');const fem=k=>A().G[k]==='f';const other=k=>k==='hassan'?'leen':'hassan';
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const todayIso=()=>iso(new Date());
const pdate=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,(m||1)-1,d||1)};
const LOC=()=>document.documentElement.lang==='en'?'en-GB':'ar-u-nu-latn';
const fmtD=(s,o)=>pdate(s).toLocaleDateString(LOC(),o||{weekday:'long',day:'numeric',month:'long'});
const save=(fn,ok)=>A().write(fn,ok);

/* ---------- المزاج ---------- */
const MOODS=[['happy','😊','سعيد','سعيدة'],['love','🥰','مشتاق','مشتاقة'],['calm','😌','مرتاح','مرتاحة'],['tired','😴','متعب','متعبة'],['stress','😤','مضغوط','مضغوطة'],['sad','😔','حزين','حزينة'],['sick','🤒','مريض','مريضة']];
const moodOf=k=>{const m=moods[k];if(!m||!m.m)return null;if(Date.now()-(m.t||0)>20*36e5)return null;return MOODS.find(x=>x[0]===m.m)||null};
function renderMoods(){const box=$('#moods');if(!box)return;const me=A().me;if(!me){box.innerHTML='';return}
 const chip=k=>{const m=moodOf(k);const lbl=m?(fem(k)?m[3]:m[2]):(k===me?'كيف حالك اليوم؟':'لم يحدّد بعد');
  return '<button class="mood'+(k===me?' mine':'')+'" data-mood="'+k+'"><span class="me1">'+(m?m[1]:(k===me?'➕':'💭'))+'</span><span><b>'+esc(W(k))+'</b><i>'+lbl+'</i></span></button>'};
 box.innerHTML=chip(me)+chip(other(me))}
function openMood(){const me=A().me;if(!me)return;const cur=moods[me]||{};
 A().open('<h2>كيف حالك اليوم؟</h2><p class="small" style="margin-top:0">سيرى '+esc(W(other(me)))+' مزاجك، ويختفي تلقائيًا بعد يوم.</p><div class="moodgrid">'+MOODS.map(m=>'<button data-mk="'+m[0]+'"'+(cur.m===m[0]?' aria-pressed="true"':'')+'><span>'+m[1]+'</span>'+(fem(me)?m[3]:m[2])+'</button>').join('')+'</div><label class="l">كلمة صغيرة (اختياري)</label><input class="in" id="md-n" maxlength="80" placeholder="مثلًا: يومي طويل، اشتقت إليك" value="'+esc(cur.m&&Date.now()-(cur.t||0)<20*36e5?cur.n||'':'')+'"><div class="acts"><button class="btn pri" id="md-ok">احفظ</button>'+(cur.m?'<button class="btn" id="md-x">امسح</button>':'')+'</div>');
 let pick=cur.m||'';const sh=$('#sheet');
 sh.querySelector('.moodgrid').addEventListener('click',e=>{const b=e.target.closest('[data-mk]');if(!b)return;pick=b.dataset.mk;sh.querySelectorAll('.moodgrid button').forEach(x=>x.setAttribute('aria-pressed',x===b))});
 $('#md-ok').onclick=()=>{if(!pick){A().toast('اختر مزاجك أولًا');return}A().close();save(()=>db.doc('mood/'+me).set({m:pick,n:$('#md-n').value.trim(),t:Date.now()}),'وصل مزاجك إلى '+W(other(me)))};
 const x=$('#md-x');if(x)x.onclick=()=>{A().close();save(()=>db.doc('mood/'+me).set({m:'',n:'',t:0}))}}
function showMoodNote(k){const m=moodOf(k),n=moods[k]&&moods[k].n;if(!m)return;A().toast(W(k)+': '+m[1]+' '+(fem(k)?m[3]:m[2])+(n?' — '+n:''))}

/* ---------- بيتنا ---------- */
function renderHouse(){const box=$('#house');if(!box)return;
 const seg='<div class="seg hseg">'+[['shop','🛒 المشتريات'],['meals','🍲 طعام الأسبوع'],['rem','⏰ التذكيرات']].map(s=>'<button data-hs="'+s[0]+'" aria-pressed="'+(homeSeg===s[0])+'">'+s[1]+'</button>').join('')+'</div>';
 box.innerHTML=seg+'<div id="hbody"></div>';
 if(homeSeg==='shop')renderShop();else if(homeSeg==='meals')renderMeals();else renderRems()}

function renderShop(){const b=$('#hbody'),me=A().me;
 const need=shop.filter(s=>!s.done).sort((a,b)=>(b.urgent?1:0)-(a.urgent?1:0)||(a.createdAt||0)-(b.createdAt||0));
 const got=shop.filter(s=>s.done).sort((a,b)=>(b.doneAt||0)-(a.doneAt||0));
 const item=s=>'<article class="card plan shopi'+(s.done?' done':'')+(s.urgent&&!s.done?' urgent':'')+'"><button class="check" data-sh="'+esc(s.id)+'" aria-label="'+(s.done?'أرجعه للقائمة':'اشتريته')+'">'+(s.done?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg>':'')+'</button><div class="body"><h3>'+esc(s.text)+(s.qty?' <span class="qty">× '+esc(s.qty)+'</span>':'')+'</h3><div class="meta">'+(s.urgent&&!s.done?'<span class="urg">مستعجل</span>':'')+(s.note?'<span>'+esc(s.note)+'</span>':'')+'<span>'+(s.done?(s.doneBy?'اشتراه '+esc(W(s.doneBy)):''):(s.by?'طلب '+esc(W(s.by)):''))+'</span></div></div><button class="more" data-she="'+esc(s.id)+'" aria-label="تعديل"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg></button></article>';
 b.innerHTML='<form class="qadd" id="shf"><input class="in" id="sh-t" maxlength="80" placeholder="ماذا نحتاج؟ مثلًا: خبز، حليب…" autocomplete="off"><button class="btn pri" aria-label="أضف">أضف</button></form>'+
 (need.length?'<div class="month">'+need.length+' '+(need.length===1?'غرض مطلوب':'أغراض مطلوبة')+'</div>'+need.map(item).join(''):'<div class="empty"><h3>القائمة فارغة 🎉</h3>اكتب ما يحتاجه البيت، وسيراه '+esc(W(other(me)))+' فورًا.</div>')+
 (got.length?'<button class="chip" id="sh-tog" style="margin:14px 0 8px">'+(showBought?'إخفاء':'عرض')+' ما اشتريناه ('+got.length+')</button>'+(showBought?got.slice(0,40).map(item).join('')+'<button class="chip" id="sh-clr" style="margin-top:6px">امسح كل المشترى</button>':''):'');
 $('#shf').addEventListener('submit',e=>{e.preventDefault();const raw=$('#sh-t').value.trim();if(!raw)return;
  const parts=raw.split(/[،,\n]/).map(x=>x.trim()).filter(Boolean);$('#sh-t').value='';
  parts.forEach((t,i)=>save(()=>db.collection('shopping').add({text:t,qty:'',note:'',urgent:false,by:me,done:false,createdAt:Date.now()+i})));
  A().toast(parts.length>1?'أُضيفت '+parts.length+' أغراض':'أُضيف إلى القائمة')});
 const tg=$('#sh-tog');if(tg)tg.onclick=()=>{showBought=!showBought;renderShop()};
 const cl=$('#sh-clr');if(cl)cl.onclick=()=>{const list=got.map(s=>s.id);A().toast('امسح '+list.length+' غرضًا من المشترى؟','امسح',()=>list.forEach(id=>save(()=>db.collection('shopping').doc(id).delete())))}}
function openShopItem(s){A().open('<h2>تعديل الغرض</h2><form id="sef"><label class="l">الغرض</label><input class="in" id="se-t" maxlength="80" required value="'+esc(s.text)+'"><div style="display:flex;gap:8px"><div style="flex:1"><label class="l">الكمية</label><input class="in" id="se-q" maxlength="20" placeholder="مثلًا: 2 كيلو" value="'+esc(s.qty||'')+'"></div><div style="flex:1"><label class="l">ملاحظة</label><input class="in" id="se-n" maxlength="60" placeholder="نوع، ماركة…" value="'+esc(s.note||'')+'"></div></div><label class="cbrow"><input type="checkbox" id="se-u"'+(s.urgent?' checked':'')+'> مستعجل</label><div class="acts"><button class="btn pri">احفظ</button><button type="button" class="btn del" id="se-d">احذف</button></div></form>');
 $('#sef').addEventListener('submit',e=>{e.preventDefault();A().close();save(()=>db.collection('shopping').doc(s.id).update({text:$('#se-t').value.trim()||s.text,qty:$('#se-q').value.trim(),note:$('#se-n').value.trim(),urgent:$('#se-u').checked}),'حُفظ')});
 $('#se-d').onclick=()=>{A().close();const c={...s};delete c.id;save(()=>db.collection('shopping').doc(s.id).delete());A().toast('حُذف','تراجع',()=>save(()=>db.collection('shopping').doc(s.id).set(c)))}}

function renderMeals(){const b=$('#hbody');const t=new Date();const days=[...Array(7)].map((_,i)=>new Date(t.getFullYear(),t.getMonth(),t.getDate()+i));
 b.innerHTML='<p class="small" style="margin:12px 4px">خطّطا لطعام الأسبوع، وأضيفا المكوّنات إلى المشتريات بضغطة.</p>'+days.map((d,i)=>{const k=iso(d),m=meals[k]||{};
  return '<article class="card meal" data-meal="'+k+'"><div class="mday"><b>'+(i===0?'اليوم':i===1?'غدًا':d.toLocaleDateString(LOC(),{weekday:'long'}))+'</b><span>'+d.toLocaleDateString(LOC(),{day:'numeric',month:'short'})+'</span></div><div class="body">'+
  (m.lunch||m.dinner?((m.lunch?'<div><i>الغداء</i> '+esc(m.lunch)+'</div>':'')+(m.dinner?'<div><i>العشاء</i> '+esc(m.dinner)+'</div>':'')):'<div class="mute">لم نقرّر بعد · اضغط للتخطيط</div>')+'</div></article>'}).join('')}
function openMeal(k){const m=meals[k]||{};
 A().open('<h2>'+fmtD(k)+'</h2><form id="mf"><label class="l">الغداء</label><input class="in" id="m-l" maxlength="60" placeholder="مثلًا: مقلوبة" value="'+esc(m.lunch||'')+'"><label class="l">العشاء</label><input class="in" id="m-d" maxlength="60" placeholder="مثلًا: فطائر وسلطة" value="'+esc(m.dinner||'')+'"><label class="l">المكوّنات التي نحتاجها</label><textarea class="in" id="m-i" maxlength="400" placeholder="افصل بينها بفاصلة: أرز، باذنجان، لبن">'+esc((m.ing||[]).join('، '))+'</textarea><div class="acts"><button class="btn pri">احفظ</button><button type="button" class="btn" id="m-s">🛒 أضف المكوّنات للمشتريات</button></div></form>');
 const ing=()=>$('#m-i').value.split(/[،,\n]/).map(x=>x.trim()).filter(Boolean);
 $('#mf').addEventListener('submit',e=>{e.preventDefault();const d={lunch:$('#m-l').value.trim(),dinner:$('#m-d').value.trim(),ing:ing(),by:A().me,t:Date.now()};A().close();save(()=>db.doc('meals/'+k).set(d),'حُفظ')});
 $('#m-s').onclick=()=>{const list=ing();if(!list.length){A().toast('اكتب المكوّنات أولًا');return}
  const have=new Set(shop.filter(s=>!s.done).map(s=>s.text.trim()));const add=list.filter(x=>!have.has(x));
  save(()=>db.doc('meals/'+k).set({lunch:$('#m-l').value.trim(),dinner:$('#m-d').value.trim(),ing:list,by:A().me,t:Date.now()}));
  add.forEach((t,i)=>save(()=>db.collection('shopping').add({text:t,qty:'',note:'لـ'+fmtD(k,{weekday:'long'}),urgent:false,by:A().me,done:false,createdAt:Date.now()+i})));
  A().close();A().toast(add.length?'أُضيف '+add.length+' إلى المشتريات':'كل المكوّنات موجودة في القائمة')}}

const RCAT=[['bill','💡','فاتورة'],['doctor','🩺','موعد طبي'],['med','💊','دواء'],['paper','📄','أوراق وتجديد'],['family','👨‍👩‍👧','مناسبة عائلية'],['other','📌','أخرى']];
const rcat=k=>RCAT.find(x=>x[0]===k)||RCAT[5];
function nextDue(r){if(!r.date)return null;let d=pdate(r.date);const t=new Date();t.setHours(0,0,0,0);
 if(r.done&&r.repeat==='none')return d;
 if(r.repeat==='monthly'){while(d<t||(r.doneFor&&iso(d)<=r.doneFor))d=new Date(d.getFullYear(),d.getMonth()+1,d.getDate())}
 else if(r.repeat==='yearly'){while(d<t||(r.doneFor&&iso(d)<=r.doneFor))d=new Date(d.getFullYear()+1,d.getMonth(),d.getDate())}
 else if(r.repeat==='weekly'){while(d<t||(r.doneFor&&iso(d)<=r.doneFor))d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+7)}
 return d}
function dueInfo(r){const d=nextDue(r);if(!d)return {d:null,txt:'',cls:''};const t=new Date();t.setHours(0,0,0,0);const n=Math.round((d-t)/864e5);
 if(r.done&&r.repeat==='none')return {d,txt:'تمّ',cls:'ok'};
 if(n<0)return {d,txt:'متأخر '+(-n)+' يوم',cls:'late'};if(n===0)return {d,txt:'اليوم',cls:'now'};if(n===1)return {d,txt:'غدًا',cls:'soon'};
 return {d,txt:'بعد '+n+' يوم',cls:n<=3?'soon':''}}
function renderRems(){const b=$('#hbody');
 const list=rems.map(r=>({r,i:dueInfo(r)})).sort((a,b)=>((a.r.done&&a.r.repeat==='none')-(b.r.done&&b.r.repeat==='none'))||((a.i.d||0)-(b.i.d||0)));
 b.innerHTML=list.length?list.map(({r,i})=>{const c=rcat(r.cat);const once=r.repeat==='none';
  return '<article class="card plan rem'+(once&&r.done?' done':'')+'"><button class="check" data-rd="'+esc(r.id)+'" aria-label="تمّ">'+(once&&r.done?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg>':'')+'</button><div class="body"><h3>'+c[1]+' '+esc(r.title)+'</h3><div class="meta"><span class="due '+i.cls+'">'+i.txt+'</span>'+(i.d?'<span>'+i.d.toLocaleDateString(LOC(),{day:'numeric',month:'short'})+(r.time?' · '+esc(r.time):'')+'</span>':'')+(r.repeat!=='none'?'<span>🔁 '+({weekly:'أسبوعيًا',monthly:'شهريًا',yearly:'سنويًا'}[r.repeat]||'')+'</span>':'')+(r.who&&r.who!=='both'?'<span>على '+esc(W(r.who))+'</span>':'')+'</div></div><button class="more" data-re="'+esc(r.id)+'" aria-label="تعديل"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg></button></article>'}).join(''):
 '<div class="empty"><h3>لا تذكيرات بعد</h3>الفواتير، مواعيد الطبيب، الأدوية، تجديد الأوراق، ومناسبات العائلتين… كل شيء في مكان واحد.</div>'}
function openRem(r){r=r||{};const me=A().me;
 const opt=(v,l,cur)=>'<option value="'+v+'"'+(cur===v?' selected':'')+'>'+l+'</option>';
 A().open('<h2>'+(r.id?'تعديل التذكير':'تذكير جديد')+'</h2><form id="rf"><label class="l">ماذا نتذكّر؟</label><input class="in" id="r-t" maxlength="80" required placeholder="مثلًا: فاتورة الكهرباء" value="'+esc(r.title||'')+'"><label class="l">النوع</label><div class="chips" id="r-c">'+RCAT.map(c=>'<button type="button" class="chip" data-rc="'+c[0]+'" aria-pressed="'+((r.cat||'bill')===c[0])+'">'+c[1]+' '+c[2]+'</button>').join('')+'</div>'+
 '<div style="display:flex;gap:8px"><div style="flex:1.3"><label class="l">التاريخ</label><input class="in" id="r-d" type="date" required value="'+esc(r.date||todayIso())+'"></div><div style="flex:1"><label class="l">الوقت (اختياري)</label><input class="in" id="r-h" type="time" value="'+esc(r.time||'')+'"></div></div>'+
 '<div style="display:flex;gap:8px"><div style="flex:1"><label class="l">التكرار</label><select class="in" id="r-r">'+opt('none','مرة واحدة',r.repeat||'none')+opt('weekly','أسبوعيًا',r.repeat)+opt('monthly','شهريًا',r.repeat)+opt('yearly','سنويًا',r.repeat)+'</select></div><div style="flex:1"><label class="l">على من؟</label><select class="in" id="r-w">'+opt('both','علينا معًا',r.who||'both')+opt('hassan',W('hassan'),r.who)+opt('leen',W('leen'),r.who)+'</select></div></div>'+
 '<div class="acts"><button class="btn pri">احفظ</button>'+(r.id?'<button type="button" class="btn del" id="r-x">احذف</button>':'')+'</div></form>');
 let cat=r.cat||'bill';$('#r-c').addEventListener('click',e=>{const b=e.target.closest('[data-rc]');if(!b)return;cat=b.dataset.rc;$('#sheet').querySelectorAll('[data-rc]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
 $('#rf').addEventListener('submit',e=>{e.preventDefault();const d={title:$('#r-t').value.trim(),cat,date:$('#r-d').value,time:$('#r-h').value,repeat:$('#r-r').value,who:$('#r-w').value,done:r.done||false,doneFor:r.doneFor||'',by:r.by||me,createdAt:r.createdAt||Date.now()};A().close();
  save(()=>r.id?db.collection('reminders').doc(r.id).set(d):db.collection('reminders').add(d),r.id?'حُفظ':'أُضيف التذكير')});
 const x=$('#r-x');if(x)x.onclick=()=>{A().close();save(()=>db.collection('reminders').doc(r.id).delete(),'حُذف')}}
function toggleRem(r){if(r.repeat==='none')return save(()=>db.collection('reminders').doc(r.id).update({done:!r.done}),r.done?'':'أحسنتم 👏');
 const d=nextDue(r);save(()=>db.collection('reminders').doc(r.id).update({doneFor:iso(d)}),'تمّ، وسيعود في موعده القادم')}
function dueBanner(){const n=rems.filter(r=>{const i=dueInfo(r);return i.cls==='now'||i.cls==='late'}).length;
 const b=document.querySelector('#bnav [data-go="house"]')||document.querySelector('.tabs [data-t="house"]');if(b)b.classList.toggle('hasdot',n>0||shop.some(s=>!s.done&&s.urgent))}

/* ---------- أمنياتنا ---------- */
const IDEAS=[['home','🍿','ليلة أفلام في البيت مع فشار وبطانية'],['home','🍳','نطبخ معًا طبقًا لم نجرّبه من قبل'],['home','🕯️','عشاء على ضوء الشموع في البيت'],['home','🧩','ليلة ألعاب: ورق، أونو، أو أحجية'],['home','📸','نتصفّح صورنا القديمة ونحكي قصصها'],['home','💌','يكتب كلٌّ منّا رسالة للآخر ويقرأها بصوته'],['home','🎤','ليلة أغانٍ قديمة نحبها'],['home','🧖','ليلة عناية واسترخاء وأقنعة وجه'],
['out','🌅','نشاهد الغروب من مكان مرتفع'],['out','☕','نجرّب مقهى جديدًا لم نزره'],['out','🚶','مشوار طويل على البحر أو في حديقة'],['out','🍦','جولة بوظة: كلٌّ منّا يختار نكهة للآخر'],['out','🎳','بولينغ أو بلياردو'],['out','🧺','نزهة في الطبيعة مع سلة طعام'],['out','🎬','سينما وعشاء بعدها'],['out','🛍️','سوق شعبي نشتري منه شيئًا صغيرًا لبعض'],
['cheap','🌙','نجلس على الشرفة ونشرب الشاي ونخطّط لأحلامنا'],['cheap','🚗','مشوار بالسيارة بلا وجهة مع أغانينا'],['cheap','📚','نختار كتابًا ونقرأه معًا'],['cheap','🏃','نتمرّن معًا ثم فطور صحي'],['cheap','🎨','نرسم معًا من التطبيق ونحتفظ بالرسمة'],['cheap','📝','نكتب قائمة 10 أشياء نحبها في بعضنا'],
['special','🏨','ليلة في فندق قريب كأننا مسافرون'],['special','✈️','نخطّط لرحلة قصيرة في نهاية الأسبوع'],['special','💐','مفاجأة بورد وهدية صغيرة بلا مناسبة'],['special','🍽️','عشاء في مطعم فاخر بلباس رسمي'],['special','🎁','يومٌ كامل يختار برنامجه أحدنا للآخر']];
const ICAT=[['all','الكل'],['home','في البيت'],['out','خارج البيت'],['cheap','بلا تكلفة تقريبًا'],['special','مناسبة خاصة']];
let ideaCat='all',ideaPick=null;
function renderWish(){const box=$('#wish');if(!box)return;
 box.innerHTML='<div class="seg hseg">'+[['ideas','✨ أفكار السهرات'],['wishes','🎁 الأمنيات والهدايا']].map(s=>'<button data-ws="'+s[0]+'" aria-pressed="'+(wishSeg===s[0])+'">'+s[1]+'</button>').join('')+'</div><div id="wbody"></div>';
 wishSeg==='ideas'?renderIdeas():renderWishes()}
function renderIdeas(){const b=$('#wbody');const list=IDEAS.filter(i=>ideaCat==='all'||i[0]===ideaCat);
 b.innerHTML='<div class="idea-hero"><div class="ih-e">'+(ideaPick?ideaPick[1]:'🎲')+'</div><div class="ih-t">'+(ideaPick?esc(ideaPick[2]):'لا تعرفان ماذا تفعلان الليلة؟')+'</div><div class="acts" style="margin-top:12px"><button class="btn pri" id="id-r">'+(ideaPick?'فكرة أخرى':'اقترح علينا فكرة')+'</button>'+(ideaPick?'<button class="btn" id="id-p">أضفها لخططنا</button>':'')+'</div></div>'+
 '<div class="chips" id="id-c" style="margin:12px 0">'+ICAT.map(c=>'<button class="chip" data-ic="'+c[0]+'" aria-pressed="'+(ideaCat===c[0])+'">'+c[1]+'</button>').join('')+'</div>'+
 list.map(i=>'<article class="card idea" data-idea="'+esc(i[2])+'"><span class="ie">'+i[1]+'</span><div class="body"><h3>'+esc(i[2])+'</h3></div><button class="chip" data-iadd="'+esc(i[2])+'">+ خطة</button></article>').join('');
 $('#id-r').onclick=()=>{const pool=list.filter(i=>i!==ideaPick);ideaPick=pool[Math.floor(Math.random()*pool.length)];renderIdeas()};
 const p=$('#id-p');if(p)p.onclick=()=>addPlan(ideaPick[2])}
function addPlan(t){save(()=>db.collection('plans').add({title:t,cat:'out',when:'',by:A().me,done:false,createdAt:Date.now()}),'أُضيفت إلى «خططنا» 💫')}
function renderWishes(){const b=$('#wbody'),me=A().me,ot=other(me);
 const mine=wishes.filter(w=>w.by===me),theirs=wishes.filter(w=>w.by===ot);
 const card=(w,own)=>'<article class="card wishc'+(w.gotAt&&!own?' done':'')+'"><div class="body"><h3>'+esc(w.title)+'</h3><div class="meta">'+(w.price?'<span>'+esc(w.price)+'</span>':'')+(w.note?'<span>'+esc(w.note)+'</span>':'')+(w.link?'<a href="'+esc(w.link)+'" target="_blank" rel="noopener noreferrer">الرابط ↗</a>':'')+(!own&&w.reserved?'<span class="resv">🤫 حجزتها أنت</span>':'')+'</div></div>'+(own?'<button class="more" data-we="'+esc(w.id)+'" aria-label="تعديل"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg></button>':'<button class="chip" data-wr="'+esc(w.id)+'">'+(w.reserved?'إلغاء الحجز':'سأهديها 🎁')+'</button>')+'</article>';
 b.innerHTML='<div class="month">أمنيات '+esc(W(ot))+' <small>· '+(fem(ot)?'لا تعلم':'لا يعلم')+' بما تحجزه</small></div>'+(theirs.length?theirs.map(w=>card(w,false)).join(''):'<div class="empty" style="padding:18px">'+(fem(ot)?'لم تكتب ':'لم يكتب ')+esc(W(ot))+' أمنيات بعد. '+(fem(ot)?'ذكّرها':'ذكّره')+' بلطف 😉</div>')+
 '<div class="month">أمنياتي <small>· اكتب ما تتمنّاه ليعرف '+esc(W(ot))+' ماذا يهديك</small></div>'+mine.map(w=>card(w,true)).join('')+'<button class="btn pri" id="w-add" style="width:100%;margin-top:8px">+ أمنية جديدة</button>'}
function openWish(w){w=w||{};A().open('<h2>'+(w.id?'تعديل الأمنية':'أمنية جديدة')+'</h2><form id="wf"><label class="l">ماذا تتمنّى؟</label><input class="in" id="w-t" maxlength="80" required placeholder="مثلًا: ساعة رياضية، عطر، كتاب…" value="'+esc(w.title||'')+'"><div style="display:flex;gap:8px"><div style="flex:1"><label class="l">السعر التقريبي</label><input class="in" id="w-p" maxlength="20" value="'+esc(w.price||'')+'"></div><div style="flex:1"><label class="l">ملاحظة</label><input class="in" id="w-n" maxlength="60" placeholder="اللون، المقاس…" value="'+esc(w.note||'')+'"></div></div><label class="l">رابط (اختياري)</label><input class="in" id="w-l" type="url" dir="ltr" maxlength="300" placeholder="https://" value="'+esc(w.link||'')+'"><div class="acts"><button class="btn pri">احفظ</button>'+(w.id?'<button type="button" class="btn del" id="w-x">احذف</button>':'')+'</div></form>');
 $('#wf').addEventListener('submit',e=>{e.preventDefault();let l=$('#w-l').value.trim();if(l&&!/^https?:\/\//i.test(l))l='https://'+l;
  const d={title:$('#w-t').value.trim(),price:$('#w-p').value.trim(),note:$('#w-n').value.trim(),link:l,by:w.by||A().me,reserved:w.reserved||'',createdAt:w.createdAt||Date.now()};A().close();
  save(()=>w.id?db.collection('wishes').doc(w.id).set(d):db.collection('wishes').add(d),'حُفظت')});
 const x=$('#w-x');if(x)x.onclick=()=>{A().close();save(()=>db.collection('wishes').doc(w.id).delete(),'حُذفت')}}

/* ---------- ربط ---------- */
const FAB={house:()=>homeSeg==='rem'?openRem():homeSeg==='meals'?openMeal(todayIso()):(()=>{const i=$('#sh-t');if(i){i.focus();i.scrollIntoView({block:'center'})}})(),wish:()=>wishSeg==='wishes'?openWish():$('#id-r')&&$('#id-r').click()};
window.__extFab=FAB;
document.addEventListener('click',e=>{const t=e.target;
 let b=t.closest('[data-mood]');if(b&&b.id!=='chav'){const k=b.dataset.mood;k===A().me?openMood():showMoodNote(k);return}
 b=t.closest('[data-hs]');if(b){homeSeg=b.dataset.hs;renderHouse();return}
 b=t.closest('[data-sh]');if(b){const s=shop.find(x=>x.id===b.dataset.sh);if(!s)return;b.classList.add('popped');save(()=>db.collection('shopping').doc(s.id).update(s.done?{done:false,doneBy:'',doneAt:0}:{done:true,doneBy:A().me,doneAt:Date.now()}));return}
 b=t.closest('[data-she]');if(b){const s=shop.find(x=>x.id===b.dataset.she);if(s)openShopItem(s);return}
 b=t.closest('[data-meal]');if(b){openMeal(b.dataset.meal);return}
 b=t.closest('[data-rd]');if(b){const r=rems.find(x=>x.id===b.dataset.rd);if(r)toggleRem(r);return}
 b=t.closest('[data-re]');if(b){const r=rems.find(x=>x.id===b.dataset.re);if(r)openRem(r);return}
 b=t.closest('[data-ws]');if(b){wishSeg=b.dataset.ws;renderWish();return}
 b=t.closest('[data-ic]');if(b){ideaCat=b.dataset.ic;renderIdeas();return}
 b=t.closest('[data-iadd]');if(b){addPlan(b.dataset.iadd);return}
 b=t.closest('[data-we]');if(b){const w=wishes.find(x=>x.id===b.dataset.we);if(w)openWish(w);return}
 b=t.closest('[data-wr]');if(b){const w=wishes.find(x=>x.id===b.dataset.wr);if(w)save(()=>db.collection('wishes').doc(w.id).update({reserved:w.reserved?'':A().me}),w.reserved?'أُلغي الحجز':'محجوزة لك، والسرّ عندنا 🤫');return}
 if(t.closest('#w-add')){openWish();return}
});
window.__extRender=()=>{renderMoods();renderHouse();renderWish();dueBanner()};
window.__dbReady.then(d=>{db=d;const go=()=>{try{window.__extRender()}catch(x){}};
 const sub=(c,fn)=>{try{db.collection(c).onSnapshot(sn=>{fn(sn.docs.map(x=>({...x.data(),id:x.id})));go()},()=>{})}catch(x){}};
 sub('shopping',l=>shop=l);sub('reminders',l=>rems=l);sub('wishes',l=>wishes=l);
 sub('meals',l=>{meals={};l.forEach(m=>meals[m.id]=m)});
 sub('mood',l=>{moods={};l.forEach(m=>moods[m.id]=m)});
 const iv=setInterval(()=>{if(A()&&A().me){clearInterval(iv);go()}},400)});
})();
