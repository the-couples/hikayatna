/* Hikayatna native bridge (Android/iOS shell only; not used on the web build) */
(function(){
  var C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
  var P=C.Plugins||{},App=P.App,Push=P.PushNotifications;
  var css=document.createElement('style');
  css.textContent='#inst,.inst{display:none!important}';
  document.head.appendChild(css);
  document.documentElement.classList.add('native');

  function q(s){return document.querySelector(s)}
  function isOpen(el){return el&&el.offsetParent!==null}

  /* Android back button: close whatever is on top, else go home, else minimize */
  if(App&&App.addListener){
    App.addListener('backButton',function(){
      try{
        var menu=q('.chmenu');if(menu){menu.click();return}
        var scrim=q('.scrim.on');if(scrim){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return}
        if(document.body.classList.contains('chat-open')){var x=q('#chx');if(x){x.click();return}}
        var cur=q('.tabs [aria-selected="true"]');
        if(cur&&cur.dataset.t&&cur.dataset.t!=='home'&&window.__app){window.__app.goTab('home');return}
      }catch(e){}
      App.minimizeApp&&App.minimizeApp();
    });
  }

  /* Native push (FCM). Only active when the build includes Firebase config. */
  if(Push&&window.__FCM){
    var lang=document.documentElement.lang==='en'?'en':'ar';
    function save(tok){
      var t0=Date.now(),iv=setInterval(function(){
        var a=window.__app,me=a&&a.me,db=a&&a.db;
        var off=false;try{off=localStorage.getItem('hl-push-off')==='1'}catch(e){}
        if(off){clearInterval(iv);return}
        if(me&&db&&db.base){clearInterval(iv);
          db.doc('push/'+me).set({fcm:tok,t:Date.now(),lang:lang,platform:C.getPlatform()}).catch(function(){});
        }else if(Date.now()-t0>60000)clearInterval(iv);
      },1000);
    }
    Push.addListener('registration',function(r){if(r&&r.value)save(r.value)});
    Push.addListener('pushNotificationActionPerformed',function(a){
      try{var d=(a.notification&&a.notification.data)||{},o=d.open||'chat';
        location.href=(lang==='en'?'en.html':'index.html')+'?open='+encodeURIComponent(o);}catch(e){}
    });
    window.__nativePush=function(){
      return Push.checkPermissions().then(function(p){
        if(p.receive==='granted')return p;return Push.requestPermissions();
      }).then(function(p){if(p.receive==='granted'){Push.register();return true}return false});
    };
    // register silently if already allowed
    Push.checkPermissions().then(function(p){if(p.receive==='granted'){window.__NATPUSH=true;Push.register()}});
  }
})();
