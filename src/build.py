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
rep('<button role="tab" data-t="plans"','<button role="tab" data-t="home" aria-selected="false"><span class="ic">'+HOME_IC+'</span>بيتنا</button>\n <button role="tab" data-t="wish" aria-selected="false"><span class="ic">'+WISH_IC+'</span>أمنياتنا</button>\n <button role="tab" data-t="plans"')
rep('<section id="v-plans" hidden>','<section id="v-home" hidden><div id="home"></div></section>\n <section id="v-wish" hidden><div id="wish"></div></section>\n <section id="v-plans" hidden>')
rep('<div class="days" id="days"></div>','<div class="days" id="days"></div>\n     <div class="moods" id="moods"></div>')
rep("['games','ألعابنا'],['plans','خططنا']","['games','ألعابنا'],['home','بيتنا'],['wish','أمنياتنا'],['plans','خططنا']",2)
rep("['moments','album','fit','cal','us','games','plans','stats'].forEach(v=>$('#v-'+v).hidden=v!==tab);$('#fab').classList.toggle('hide',tab==='stats'||tab==='games')",
    "TABS.map(t=>t[0]).forEach(v=>{const el=$('#v-'+v);if(el)el.hidden=v!==tab});$('#fab').classList.toggle('hide',tab==='stats'||tab==='games')")
rep("$('#fab').onclick=()=>tab==='album'","$('#fab').onclick=()=>window.__extFab&&window.__extFab[tab]?window.__extFab[tab]():tab==='album'")
rep("function render(){renderHead();","function render(){try{window.__extRender&&window.__extRender()}catch(x){}renderHead();")
rep("window.__resizeLogo=resizeLogo;","window.__resizeLogo=resizeLogo;\nwindow.__app={open,close,toast,write,goTab,get me(){return me},get WHO(){return WHO},get G(){return G}};")
rep('<div class="moods" id="moods"></div>','<div class="moods" id="moods"></div>\n     <div id="pushbar"></div>')
rep("try{await db.collection('chat').add(m);","try{await db.collection('chat').add(m);try{window.__notify&&window.__notify('chat',m)}catch(x){}")
rep("try{await db.collection('kisses').add({from:me,to:other(me),createdAt:Date.now(),seenAt:0})}","try{await db.collection('kisses').add({from:me,to:other(me),createdAt:Date.now(),seenAt:0});try{window.__notify&&window.__notify('kiss',{})}catch(x){}}")
rep("open('<h2>إعداداتنا</h2>","open('<h2>إعداداتنا</h2>'+(window.__pushBtn?window.__pushBtn():'')+'")
rep("const app=initializeApp(firebaseConfig),auth=getAuth(app);","const app=initializeApp(firebaseConfig),auth=getAuth(app);window.__idToken=()=>auth.currentUser?auth.currentUser.getIdToken():Promise.reject(new Error('no user'));")
css=open(D+'/features.css',encoding='utf-8').read();js=open(D+'/features.js',encoding='utf-8').read()
cfg=json.load(open(D+'/push.config.json'))
js+='\n'+open(D+'/push.js',encoding='utf-8').read().replace('__VAPID_PUBLIC__',cfg['vapid_public']).replace('__PUSH_URL__',cfg['push_url'])
i=s.rfind('</style>');s=s[:i]+css+s[i:]
i=s.find('<script type="module">');s=s[:i]+'<script>\n'+js+'\n</script>\n'+s[i:]
open(D+'/merged.html','w',encoding='utf-8').write(s)
print('merged',len(s))
