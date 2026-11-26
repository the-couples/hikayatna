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
rep("window.__resizeLogo=resizeLogo;","window.__resizeLogo=resizeLogo;\nwindow.__app={open,close,toast,write,goTab,get db(){return db},get me(){return me},get WHO(){return WHO},get G(){return G}};")
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
css=open(D+'/features.css',encoding='utf-8').read();js=open(D+'/features.js',encoding='utf-8').read()
js+='\n'+re.sub(r'[\u0600-\u06FF]',lambda m:'\\u%04x'%ord(m.group(0)),open(D+'/pushtext.js',encoding='utf-8').read())
i=s.rfind('</style>');s=s[:i]+css+s[i:]
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
# chat info panel (v73): locale + simpler "not yet"
if 'function chWhen' in s:
    s=s.replace("d.toLocaleTimeString('ar',","d.toLocaleTimeString(L,").replace("d.toLocaleDateString('ar',{day:'numeric',month:'long'})","d.toLocaleDateString(L,{day:'numeric',month:'long'})")
    s=s.replace("'لسّا ما '+(f?'سمعتها':'سمعها')","'لسّا'")
    s=s.replace("(/لسّا/.test(r[1])?'no':'')","(r[1]===NOTYET?'no':'')")
    s=s.replace("function chWhen(t){","const NOTYET='لسّا';function chWhen(t){")
open(D+'/merged.html','w',encoding='utf-8').write(s)
print('merged',len(s))
