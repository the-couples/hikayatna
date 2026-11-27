/* ---------- دعوة الشريك + معلوماتنا (قابلة للتعديل دائمًا) ---------- */
(function(){
const A=()=>window.__app;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cdoc=null,dismissed=false;
const partnerJoined=()=>!!(cdoc&&cdoc.members&&cdoc.members.leen);
const code=()=>(cdoc&&cdoc.code)||(A()&&A().COUPLE&&A().COUPLE.code)||'';
const needInvite=()=>!!(cdoc&&!partnerJoined()&&code());
const en=()=>document.documentElement.lang==='en';

function inviteText(){
  const link=location.origin+location.pathname.replace(/[^/]*$/,'')+(en()?'en.html':'');
  return 'انضمّ إليّ في حكايتنا 💞\nكود الدعوة: '+code()+'\n'+link;
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
    '<label class="l">تاريخ التعارف</label><input class="in" type="date" id="inf-d-dating" value="'+esc(d.dating||'')+'">'+
    '<label class="l">تاريخ الخطبة</label><input class="in" type="date" id="inf-d-engaged" value="'+esc(d.engaged||'')+'">'+
    '<label class="l">تاريخ الزواج</label><input class="in" type="date" id="inf-d-married" value="'+esc(d.married||'')+'">'+
    '<p class="small">يعتمد عدّاد الأيام على تاريخ علاقتكما الحالية.</p>'+
    '<div class="acts"><button class="btn pri" type="submit">احفظ</button></div></form>');
  document.getElementById('inf').addEventListener('submit',async e=>{e.preventDefault();
    const $=id=>document.getElementById(id);
    const n1=$('inf-n1').value.trim(),n2=$('inf-n2').value.trim();if(!n1||!n2)return;
    const r=$('inf-r').value;
    const dates={dating:$('inf-d-dating').value||'',engaged:$('inf-d-engaged').value||'',married:$('inf-d-married').value||''};
    const nc={...(a.COUPLE||{}),names:{hassan:n1,leen:n2},gender:{hassan:$('inf-g1').value,leen:$('inf-g2').value},relation:r};delete nc.legacy;
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
