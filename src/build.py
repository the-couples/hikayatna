import json
import re,sys,json,os
D=os.path.dirname(os.path.abspath(__file__))
s=open(D+'/base.html',encoding='utf-8').read()
def rep(o,n,c=1):
    global s
    k=s.count(o)
    if k!=c: sys.exit(f'patch: expected {c} got {k}: {o[:70]}')
    s=s.replace(o,n)
HOME_IC='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/></svg>'
WISH_IC='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M3 7.5h18V10H3zM12 7.5V20M12 7.5S10.5 4 8.5 4 6 6.5 8 7.5M12 7.5S13.5 4 15.5 4 18 6.5 16 7.5"/></svg>'
# tabs + sections
rep('<button role="tab" data-t="plans"','<button role="tab" data-t="house" aria-selected="false"><span class="ic">'+HOME_IC+'</span>بيتنا</button>\n <button role="tab" data-t="wish" aria-selected="false"><span class="ic">'+WISH_IC+'</span>أمنياتنا</button>\n <button role="tab" data-t="plans"')
rep('<section id="v-plans" hidden>','<section id="v-house" hidden><div id="house"></div></section>\n <section id="v-wish" hidden><div id="wish"></div></section>\n <section id="v-plans" hidden>')
rep('<div class="days" id="days"></div>','<div class="days" id="days"></div>\n     <div class="moods" id="moods"></div>')
rep("['games','ألعابنا'],['plans','خططنا']","['games','ألعابنا'],['house','بيتنا'],['wish','أمنياتنا'],['plans','خططنا']",2)
rep("['home','moments','album','fit','cal','us','games','plans','stats'].forEach(v=>$('#v-'+v).hidden=v!==tab)","['home',...TABS.map(t=>t[0])].forEach(v=>{const el=$('#v-'+v);if(el)el.hidden=v!==tab})")
rep("$('#fab').onclick=()=>tab==='album'","$('#fab').onclick=()=>window.__extFab&&window.__extFab[tab]?window.__extFab[tab]():tab==='album'")
rep("function render(){renderHead();","function render(){try{window.__extRender&&window.__extRender()}catch(x){}renderHead();")
rep("window.__resizeLogo=resizeLogo;","window.__resizeLogo=resizeLogo;\nwindow.__app={open,close,toast,write,goTab,get db(){return db},get cid(){return db&&db.base&&db.base.startsWith('couples/')?db.base.split('/')[1]:''},coupleWatch:cb=>window.__coupleApi.watch(cb),coupleSet:d=>window.__coupleApi.set(d),get me(){return me},get COUPLE(){return COUPLE},get settings(){return settings},get WHO(){return WHO},get G(){return G}};")
rep("const app=initializeApp(firebaseConfig),auth=getAuth(app);","const app=initializeApp(firebaseConfig),auth=getAuth(app);window.__idToken=()=>auth.currentUser?auth.currentUser.getIdToken():Promise.reject(new Error('no user'));")
# home tiles / more menu for new sections, respect enabled sections
rep("const PG={moments:['لحظاتنا','💞'],album:['ألبومنا','📸'],fit:['رياضتنا','💪'],cal:['تقويمنا','📅'],us:['بيناتنا','💌'],games:['ألعابنا','🎮'],plans:['خططنا','🚩'],stats:['أرقامنا','📊']};\nconst MORE=['fit','cal','us','games','plans','stats'];",
    "const PG={moments:['لحظاتنا','💞'],album:['ألبومنا','📸'],house:['بيتنا','🏠'],wish:['أمنياتنا','🎁'],fit:['رياضتنا','💪'],cal:['تقويمنا','📅'],us:['بيناتنا','💌'],games:['ألعابنا','🎮'],plans:['خططنا','🚩'],stats:['أرقامنا','📊']};\nconst MORE_ALL=['house','wish','fit','cal','us','games','plans','stats'];\nconst secOn=t=>!(COUPLE&&Array.isArray(COUPLE.sections)&&COUPLE.sections.length)||COUPLE.sections.includes(t);\nconst MORE_L=()=>MORE_ALL.filter(secOn);let MORE=MORE_ALL;")
rep(" if(t==='stats')return 'حكايتنا بالأرقام';"," if(t==='stats')return 'حكايتنا بالأرقام';\n if(t==='house')return 'المشتريات والطعام والتذكيرات';\n if(t==='wish')return 'أفكار سهرات وأمنيات وهدايا';")
rep("$('#htiles').innerHTML=Object.keys(PG).map(","$('#htiles').innerHTML=Object.keys(PG).filter(secOn).map(")
rep("function openMore(){open(","function openMore(){MORE=MORE_L();open(")
rep("[an==null?'—':an,'لذكرى الخطوبة']","[an==null?'—':an,(COUPLE&&COUPLE.relation==='married'?'لذكرى الزواج':COUPLE&&COUPLE.relation==='dating'?'لذكرى التعارف':'لذكرى الخطوبة')]")
rep(" if(!on.includes(tab))setTimeout(()=>goTab(on[0]),0)}"," if(tab!=='home'&&!on.includes(tab))setTimeout(()=>goTab('home'),0);try{renderHome()}catch(x){}}")
rep(".g-moments{background:linear-gradient(145deg,#8a63f2,#4b3aa8)}",".g-moments{background:linear-gradient(145deg,#8a63f2,#4b3aa8)}.g-house{background:linear-gradient(145deg,#f2a35e,#c4672a)}.g-wish{background:linear-gradient(145deg,#e66fc9,#8f3aa8)}")
rep("'عم يتصل فيك'+(G[me]==='f'?'ي':'')","'عم يتصل فيك'")
css=open(D+'/features.css',encoding='utf-8').read()+'\n'+open(D+'/paywall.css',encoding='utf-8').read()+'\n'+open(D+'/couple.css',encoding='utf-8').read();js=open(D+'/features.js',encoding='utf-8').read()+'\n'+open(D+'/paywall.js',encoding='utf-8').read()+'\n'+open(D+'/couple.js',encoding='utf-8').read()
js+='\n'+re.sub(r'[\u0600-\u06FF]',lambda m:'\\u%04x'%ord(m.group(0)),open(D+'/pushtext.js',encoding='utf-8').read())
i=s.rfind('</style>',0,s.find('</head>'));s=s[:i]+css+s[i:]
i=s.find('<script type="module">');s=s[:i]+'<script>\n'+js+'\n</script>\n'+s[i:]
# ---- native shell (Capacitor) hooks: inert on the web
rep("const pushOK=()=>'serviceWorker' in navigator","const pushOK=()=>!window.__nativePush&&'serviceWorker' in navigator")
rep("function pushIsOn(){return ","function pushIsOn(){if(window.__nativePush)return !!window.__NATPUSH&&!pushOffLocal();return ")
rep("async function enablePush(){try{localStorage.removeItem('hl-push-off')}catch(x){}","async function enablePush(){try{localStorage.removeItem('hl-push-off')}catch(x){}\n if(window.__nativePush){let ok=false;try{ok=await window.__nativePush()}catch(x){}window.__NATPUSH=ok;if(!ok)toast((G[me]==='f'?'اسمحي':'اسمح')+' بالإشعارات من إعدادات الهاتف');pushUI();pushBanner();return}")
rep(" const need=pushOK()?"," const need=window.__nativePush?!window.__NATPUSH:pushOK()?")
rep("const o=other(me),ps=pushSubs[o];if(!ps||!ps.sub||!PUSH_URL","const o=other(me),ps=pushSubs[o];if(!ps||(!ps.sub&&!ps.fcm)||!PUSH_URL")
rep("body:JSON.stringify({subs:[ps.sub],title,body,","body:JSON.stringify({subs:ps.sub?[ps.sub]:[],fcm:ps.fcm?[ps.fcm]:[],open:target||'chat',title,body,")
s=s.replace("const db={uid:null,","window.__dbReady=1;const db={uid:null,",1) if False else s
# ---- account deletion: also wipe the couple's data when the last member leaves
import re as _re
_cols=sorted(set(_re.findall(r"db\.collection\('([A-Za-z]+)'\)",s))|set(_re.findall(r"db\.doc\('([A-Za-z]+)/",s)))
_old="if(db.base.startsWith('couples/')){const cid=db.base.split('/')[1];try{const s=await getDoc(doc(fs,'couples',cid));const m={...(s.data().members||{})};delete m[db.who];await updateDoc(doc(fs,'couples',cid),{members:m})}catch(x){}}"
assert _old in s
_new=("if(db.base.startsWith('couples/')){const cid=db.base.split('/')[1];try{const s=await getDoc(doc(fs,'couples',cid));const cd=s.data()||{},m={...(cd.members||{})};delete m[db.who];"
 "try{await deleteDoc(doc(fs,'couples',cid,'push',db.who))}catch(x){}try{await deleteDoc(doc(fs,'couples',cid,'profiles',db.who))}catch(x){}"
 "if(!Object.keys(m).length){const C="+json.dumps(_cols)+";for(const c of C){try{const r=await getDocs(collection(fs,'couples',cid,c));for(const d of r.docs){try{await deleteDoc(d.ref)}catch(x){}}}catch(x){}}"
 "if(cd.code){try{await deleteDoc(doc(fs,'invites',cd.code))}catch(x){}}try{await deleteDoc(doc(fs,'couples',cid))}catch(x){}}"
 "else await updateDoc(doc(fs,'couples',cid),{members:m})}catch(x){}}")
s=s.replace(_old,_new,1)
# ---- subscription support: couple doc access + plan for app-created couples
_q="const db={uid:null,base:'',collection:p=>mkCol(collection(fs,db.base+p)),doc:p=>mkDoc(doc(fs,db.base+p))};"
assert _q in s
s=s.replace(_q,_q+"\nwindow.__coupleApi={watch:cb=>onSnapshot(doc(fs,'couples',db.base.split('/')[1]),x=>cb(x.data()),()=>{}),set:d=>updateDoc(doc(fs,'couples',db.base.split('/')[1]),d)};",1)
rep("plan:'beta',founding:true","plan:window.__NATIVE?'store':'beta',founding:!window.__NATIVE")
# ---- relationship-aware onboarding: planned dates + sections by relationship
rep("<option value=\"dating\">مرتبطين</option></select>'+\n '<div class=\"row\"><div><label class=\"lb\">تاريخكن المميز</label>",
    "<option value=\"dating\">مرتبطين</option></select>'+\n '<div class=\"row\"><div><label class=\"lb\" id=\"o-dl\">تاريخكن المميز</label>")
rep("<div><label class=\"lb\">عيد ميلادك</label><input class=\"in\" id=\"o-bd\" type=\"date\"></div></div>'+",
    "<div><label class=\"lb\">عيد ميلادك</label><input class=\"in\" id=\"o-bd\" type=\"date\"></div></div><div id=\"o-xd\"></div>'+")
rep("document.getElementById('o-lu').onclick=",
    "{const rx=()=>{const r=document.getElementById('o-r').value,X=document.getElementById('o-xd');if(!X)return;const ke={pe:(document.getElementById('o-pe')||{}).value||'',pm:(document.getElementById('o-pm')||{}).value||''};"
    "X.innerHTML=(r==='dating'?'<label class=\"lb\">تاريخ الخطوبة المتوقّع (اختياري)</label><input class=\"in\" id=\"o-pe\" type=\"date\">':'')+(r!=='married'?'<label class=\"lb\">'+(r==='dating'?'تاريخ الزواج المتوقّع (اختياري)':'تاريخ الزواج المقرّر (اختياري)')+'</label><input class=\"in\" id=\"o-pm\" type=\"date\">':'');"
    "const pe=document.getElementById('o-pe'),pm=document.getElementById('o-pm');if(pe)pe.value=ke.pe;if(pm)pm.value=ke.pm;"
    "const dl=document.getElementById('o-dl');if(dl)dl.textContent=r==='married'?'تاريخ زواجكما':r==='dating'?'تاريخ تعارفكما':'تاريخ خطبتكما';"
    "const h=OX.querySelector('.cbx input[value=house]');if(h)h.checked=r!=='dating'};document.getElementById('o-r').onchange=rx;rx()}\n document.getElementById('o-lu').onclick=")
rep("if(d)await setDoc(doc(fs,base+'meta/settings'),{start:d});",
    "{const r=document.getElementById('o-r').value,pe=(document.getElementById('o-pe')||{}).value||'',pm=(document.getElementById('o-pm')||{}).value||'';const dates={dating:'',engaged:'',married:''};dates[r]=d;if(r==='dating'&&pe)dates.engaged=pe;if(r!=='married'&&pm)dates.married=pm;"
    "if(d||pe||pm)await setDoc(doc(fs,base+'meta/settings'),{start:d,dates})}")
rep("relation:$('#c-r').value,sections:sec,",
    "relation:$('#c-r').value,sections:(()=>{const r=$('#c-r').value,o=c.relation||'engaged';let x=sec.slice();if(r!==o){if(r==='dating')x=x.filter(t=>t!=='house');else if(o==='dating'&&!x.includes('house'))x.push('house')}return x.length?x:sec})(),")
# ---- feed ("ماذا حدث اليوم") always follows deletes
rep("db.collection('moments').onSnapshot(s=>{moments=s.docs.map(d=>({...d.data(),id:d.id}));done(s);render();",
    "db.collection('moments').onSnapshot(s=>{moments=s.docs.map(d=>({...d.data(),id:d.id}));queueFeed();done(s);try{render()}catch(x){console.error(x)}")
rep(" try{await fn();ok&&toast(ok)}"," try{await fn();ok&&toast(ok);try{queueFeed()}catch(x){}}")
rep("close();await write(()=>db.collection('moments').doc(m.id).delete());","close();moments=moments.filter(x=>x.id!==m.id);queueFeed();await write(()=>db.collection('moments').doc(m.id).delete());",2)
rep("const copy={...w};delete copy.id;await write(()=>db.collection('weights').doc(w.id).delete());","const copy={...w};delete copy.id;weights=weights.filter(v=>v.id!==w.id);queueFeed();await write(()=>db.collection('weights').doc(w.id).delete());")

# ---- feed: weight entries get their own scale icon (not the dumbbell used for workouts)
rep("weights.forEach(w=>push(w.createdAt,w.by||w.who,'fit',","weights.forEach(w=>push(w.createdAt,w.by||w.who,'scale',")
rep("const FIC={kiss:","const FIC={scale:'<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"4\"/><path d=\"M8.5 9.5a5 5 0 0 1 7 0M12 9.8l1.2-1.6\"/>',kiss:")

# ---- mood cards: neutral "(you)" in MSA
rep("(mine?' (إنت'+(f?'ي':'')+')':'')","(mine?' (إنت)':'')")
# chat info panel (v73): locale + simpler "not yet"
if 'function chWhen' in s:
    s=s.replace("d.toLocaleTimeString('ar',","d.toLocaleTimeString(L,").replace("d.toLocaleDateString('ar',{day:'numeric',month:'long'})","d.toLocaleDateString(L,{day:'numeric',month:'long'})")
    s=s.replace("'لسّا ما '+(f?'سمعتها':'سمعها')","'لسّا'")
    s=s.replace("(/لسّا/.test(r[1])?'no':'')","(r[1]===NOTYET?'no':'')")
    s=s.replace("function chWhen(t){","const NOTYET='لسّا';function chWhen(t){")

# ---- profile photos (hasan-leen v100) on top of Hikayatna's own avatar store (meta/avatars, couple.js):
# calls/feed/settings read the same photos; the chat-header tap keeps opening Hikayatna's photo sheet
rep("function avImg(w){const d=chMeta&&chMeta['av_'+w];return d&&typeof d.img==='string'&&d.img.startsWith('data:image/')?d.img:''}",
    "function avImg(w){let u='';try{u=window.__hkAv?window.__hkAv.get(w):''}catch(x){}return typeof u==='string'&&u.startsWith('data:image/')?u:''}")
rep("let avSig='';function avRender(){const sg=['hassan','leen'].map(w=>((chMeta||{})['av_'+w]||{}).t||0).join('|');",
    "let avSig='';function avRender(){const sg=['hassan','leen'].map(w=>avImg(w).length).join('|');")
rep("try{const img=await shrink(f,400,.85,90000,true);const d={img,t:Date.now(),by:me};chMeta['av_'+me]=d;avRender();await db.doc('chatmeta/av_'+me).set(d);",
    "try{const img=await window.__hkAv.shrink(f);await window.__hkAv.set(me,img);avRender();")
rep("async function avRemove(){if(!me||!db)return;const d={img:'',t:Date.now(),by:me};chMeta['av_'+me]=d;avRender();try{await db.doc('chatmeta/av_'+me).set(d);",
    "window.__avRender=()=>{try{avRender()}catch(x){}};\nasync function avRemove(){if(!me||!db||!window.__hkAv)return;try{await window.__hkAv.set(me,null);avRender();")
rep("document.addEventListener('click',e=>{if(e.target.closest('#chav')&&me&&!document.querySelector('.avov'))avView(other(me));else if(",
    "document.addEventListener('click',e=>{if(")
open(D+'/merged.html','w',encoding='utf-8').write(s)
print('merged',len(s))
