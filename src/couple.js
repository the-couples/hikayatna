/* ---------- دعوة الشريك + معلوماتنا (قابلة للتعديل دائمًا) ---------- */
(function(){
const A=()=>window.__app;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cdoc=null,dismissed=false;
const partnerJoined=()=>!!(cdoc&&cdoc.members&&cdoc.members.leen);
const code=()=>(cdoc&&cdoc.code)||(A()&&A().COUPLE&&A().COUPLE.code)||'';
const needInvite=()=>!!(cdoc&&!partnerJoined()&&code());
const en=()=>document.documentElement.lang==='en';

const GET_URL='https://the-couples.github.io/hikayatna/get.html';
function inviteText(){
  const link=GET_URL+'?c='+encodeURIComponent(code())+(en()?'&lang=en':'');
  return 'انضمّ إليّ في حكايتنا 💞\nكود الدعوة: '+code()+'\nحمّل التطبيق من هنا: '+link;
}
async function copyCode(){
  try{await navigator.clipboard.writeText(code());A().toast('نُسخ الكود ✅')}
  catch(x){A().toast('الكود: '+code())}
}
async function shareCode(){
  const t=inviteText();
  try{if(navigator.share){await navigator.share({text:t});return}}catch(x){if(x&&x.name==='AbortError')return}
  try{await navigator.clipboard.writeText(t);A().toast('نُسخت رسالة الدعوة، الصقها لشريكك')}catch(x){A().toast('الكود: '+code())}
}
function inviteCard(compact){
  return '<div class="invc'+(compact?' cmp':'')+'"><div class="invt"><b>💌 شريكك لم ينضم بعد</b><span>أرسل له كود الدعوة ليدخل مساحتكما</span></div>'+
    '<div class="invcode" dir="ltr">'+esc(code())+'</div>'+
    '<div class="inva"><button type="button" class="btn pri" data-inv="share">شارك الدعوة</button><button type="button" class="btn" data-inv="copy">انسخ الكود</button>'+
    (compact?'':'<button type="button" class="invx" data-inv="x" aria-label="لاحقًا">لاحقًا</button>')+'</div></div>';
}

/* بطاقة على الصفحة الرئيسية بعد الدخول */
function homeCard(){
  const home=document.getElementById('v-home');if(!home)return;
  let el=document.getElementById('invhome');
  if(!needInvite()||dismissed){if(el)el.remove();return}
  if(!el){el=document.createElement('div');el.id='invhome';home.insertBefore(el,home.firstChild)}
  const h=inviteCard(false);if(el.innerHTML!==h)el.innerHTML=h;
}

/* داخل الإعدادات: دعوة + معلوماتنا */
function settingsRows(){
  const cust=document.getElementById('cust');if(!cust||document.getElementById('inforow'))return;
  const wrap=document.createElement('div');wrap.id='inforow';
  wrap.innerHTML=(needInvite()?inviteCard(true):'')+
    '<button type="button" class="btn" id="info-open" style="width:100%;margin-bottom:6px">👤 معلوماتنا (الأسماء والتواريخ)</button>';
  cust.parentNode.insertBefore(wrap,cust);
}

/* نافذة تعديل المعلومات */
function openInfo(){
  const a=A();if(!a)return;
  const c=a.COUPLE||{},st=a.settings||{},names=c.names||{},rel=c.relation||'engaged';
  const d={...(st.dates||{})};if(st.start&&!d[rel])d[rel]=st.start;
  const g=c.gender||{};
  const gsel=(id,v)=>'<select class="in" id="'+id+'" style="flex:none;width:auto"><option value="m"'+(v!=='f'?' selected':'')+'>ذكر</option><option value="f"'+(v==='f'?' selected':'')+'>أنثى</option></select>';
  const rels=[['dating','نتعارف / مرتبطان'],['engaged','مخطوبان'],['married','متزوجان']];
  a.open('<h2>معلوماتنا</h2><p class="small" style="margin-top:0">يمكنكما تعديلها في أي وقت.</p><form id="inf">'+
    '<label class="l">الاسم الأول</label><div style="display:flex;gap:8px"><input class="in" id="inf-n1" maxlength="20" required value="'+esc(names.hassan||'')+'">'+gsel('inf-g1',g.hassan)+'</div>'+
    '<label class="l">الاسم الثاني</label><div style="display:flex;gap:8px"><input class="in" id="inf-n2" maxlength="20" required value="'+esc(names.leen||'')+'">'+gsel('inf-g2',g.leen||'f')+'</div>'+
    '<label class="l">علاقتكما الآن</label><select class="in" id="inf-r">'+rels.map(o=>'<option value="'+o[0]+'"'+(rel===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>'+
    '<label class="l" id="inf-l-dating">تاريخ التعارف</label><input class="in" type="date" id="inf-d-dating" value="'+esc(d.dating||'')+'">'+
    '<label class="l" id="inf-l-engaged">تاريخ الخطبة</label><input class="in" type="date" id="inf-d-engaged" value="'+esc(d.engaged||'')+'">'+
    '<label class="l" id="inf-l-married">تاريخ الزواج</label><input class="in" type="date" id="inf-d-married" value="'+esc(d.married||'')+'">'+
    '<p class="small">يعتمد عدّاد الأيام على تاريخ علاقتكما الحالية.</p>'+
    '<div class="acts"><button class="btn pri" type="submit">احفظ</button></div></form>');
  const LB={dating:{dating:'تاريخ التعارف',engaged:'تاريخ الخطوبة المتوقّع (اختياري)',married:'تاريخ الزواج المتوقّع (اختياري)'},
    engaged:{dating:'تاريخ التعارف (اختياري)',engaged:'تاريخ الخطبة',married:'تاريخ الزواج المقرّر (اختياري)'},
    married:{dating:'تاريخ التعارف (اختياري)',engaged:'تاريخ الخطبة (اختياري)',married:'تاريخ الزواج'}};
  const relab=()=>{const r=document.getElementById('inf-r').value;['dating','engaged','married'].forEach(k=>{const l=document.getElementById('inf-l-'+k);if(l)l.textContent=LB[r][k]})};
  document.getElementById('inf-r').onchange=relab;relab();
  document.getElementById('inf').addEventListener('submit',async e=>{e.preventDefault();
    const $=id=>document.getElementById(id);
    const n1=$('inf-n1').value.trim(),n2=$('inf-n2').value.trim();if(!n1||!n2)return;
    const r=$('inf-r').value;
    const dates={dating:$('inf-d-dating').value||'',engaged:$('inf-d-engaged').value||'',married:$('inf-d-married').value||''};
    const nc={...(a.COUPLE||{}),names:{hassan:n1,leen:n2},gender:{hassan:$('inf-g1').value,leen:$('inf-g2').value},relation:r};delete nc.legacy;
    if(r!==rel){let x=Array.isArray(nc.sections)&&nc.sections.length?nc.sections.slice():['moments','album','fit','cal','us','games','house','wish','plans','stats'];if(r==='dating')x=x.filter(t=>t!=='house');else if(rel==='dating'&&!x.includes('house'))x.push('house');if(x.length)nc.sections=x}
    const ns={...(a.settings||{}),dates,start:dates[r]||''};
    a.close();
    await a.write(async()=>{await a.db.doc('meta/couple').set(nc);await a.db.doc('meta/settings').set(ns)},'حُفظت معلوماتكما ✅');
    try{window.__applyCouple&&window.__applyCouple(nc)}catch(x){}
  });
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-inv]');
  if(b){const k=b.dataset.inv;if(k==='copy')copyCode();else if(k==='share')shareCode();else if(k==='x'){dismissed=true;homeCard()}return}
  if(e.target.closest('#info-open')){try{A().close()}catch(x){}setTimeout(openInfo,250)}
});
new MutationObserver(()=>{settingsRows();if(document.getElementById('v-home')&&!document.getElementById('invhome')&&needInvite()&&!dismissed)homeCard()}).observe(document.documentElement,{childList:true,subtree:true});

let unwatch=null,lastCid='';
setInterval(()=>{
  const a=A();if(!a||!a.cid||!a.coupleWatch)return;
  if(a.cid!==lastCid){lastCid=a.cid;dismissed=false;if(unwatch)try{unwatch()}catch(x){}
    unwatch=a.coupleWatch(c=>{cdoc=c||null;homeCard()});}
},1500);
window.__openInfo=openInfo;
})();

/* ---------- الصور الشخصية: اضغط على الاسم أو الأيقونة أعلى المحادثة ---------- */
(function(){
const A=()=>window.__app;
let av={},unsub=null,base='';
const oth=w=>w==='hassan'?'leen':'hassan';
function paint(){
  const a=A();if(!a||!a.me)return;
  const el=document.getElementById('chav');if(!el)return;
  const src=av[oth(a.me)];
  if(src){el.style.backgroundImage='url("'+src+'")';el.classList.add('hasimg')}
  else{el.style.backgroundImage='';el.classList.remove('hasimg')}
  const sh=document.getElementById('avsh');if(sh)fill(sh);
}
function watch(){
  const a=A();if(!a||!a.db||!a.cid)return;
  if(base===a.cid&&unsub)return;
  try{unsub&&unsub()}catch(x){}
  base=a.cid;av={};
  unsub=a.db.doc('meta/avatars').onSnapshot(s=>{av=(s.exists&&s.data())||{};paint()},()=>{});
}
setInterval(watch,1500);
function circle(w,big){
  const a=A(),src=av[w],nm=(a.WHO&&a.WHO[w])||'?';
  return '<div class="avc'+(big?' big':'')+'"'+(src?' style="background-image:url(&quot;'+src+'&quot;)"':'')+'>'+(src?'':String(nm).charAt(0))+'</div>';
}
function fill(sh){
  const a=A(),me=a.me,o=oth(me);
  sh.innerHTML='<div class="avrow"><div class="avp">'+circle(me,1)+'<b>'+((a.WHO&&a.WHO[me])||'')+' (أنت)</b>'+
   '<div class="ava"><button type="button" class="btn pri" data-av="pick">'+(av[me]?'غيّر صورتي':'أضف صورتي')+'</button>'+
   (av[me]?'<button type="button" class="btn" data-av="del">احذف الصورة</button>':'')+'</div></div>'+
   '<div class="avp">'+circle(o,1)+'<b>'+((a.WHO&&a.WHO[o])||'')+'</b>'+(av[o]?'':'<span class="small">لم يضف صورة بعد</span>')+'</div></div>'+
   '<input type="file" id="avf" accept="image/*" hidden>';
}
function openAv(){
  const a=A();if(!a||!a.me)return;
  a.open('<h2>الصور الشخصية</h2><p class="small" style="margin-top:0">اختر صورة لك، وستظهر لشريكك في المحادثة.</p><div id="avsh"></div>');
  const sh=document.getElementById('avsh');if(sh)fill(sh);
}
function shrink(file){
  return new Promise((res,rej)=>{
    const u=URL.createObjectURL(file),im=new Image();
    im.onload=()=>{const S=320,c=document.createElement('canvas');c.width=c.height=S;
      const s=Math.min(im.naturalWidth,im.naturalHeight),x=(im.naturalWidth-s)/2,y=(im.naturalHeight-s)/2;
      const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,S,S);g.drawImage(im,x,y,s,s,0,0,S,S);
      URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.82))};
    im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('img'))};
    im.src=u;
  });
}
async function save(patch){
  const a=A();const n=Object.assign({},av,patch);Object.keys(n).forEach(k=>{if(!n[k])delete n[k]});
  await a.db.doc('meta/avatars').set(n);
}
document.addEventListener('click',e=>{
  if(e.target.closest('#chav')||e.target.closest('.chtop .nm')){openAv();return}
  const b=e.target.closest('#avsh [data-av]');if(!b)return;
  const a=A();
  if(b.dataset.av==='pick'){const f=document.getElementById('avf');if(f){f.value='';f.click()}}
  if(b.dataset.av==='del'){save({[a.me]:null}).then(()=>a.toast('حُذفت صورتك')).catch(()=>a.toast('لم ينجح الحذف، حاول مرة أخرى'))}
});
document.addEventListener('change',async e=>{
  if(!e.target||e.target.id!=='avf')return;
  const f=e.target.files&&e.target.files[0];if(!f)return;
  const a=A();
  try{const d=await shrink(f);await save({[a.me]:d});a.toast('حُفظت صورتك ✅')}
  catch(x){a.toast('لم نتمكن من قراءة الصورة، جرّب صورة أخرى')}
});
})();
