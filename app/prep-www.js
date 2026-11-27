// Copies the public web app into www/ and injects the native bridge script.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),out=path.join(__dirname,'www');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const f of ['index.html','en.html','manifest.json','manifest-en.json','mb.js'])fs.copyFileSync(path.join(root,f),path.join(out,f));
fs.cpSync(path.join(root,'icons'),path.join(out,'icons'),{recursive:true});
const fcm=fs.existsSync(path.join(__dirname,'android','app','google-services.json'));
const nat=(fcm?'window.__FCM=true;\n':'')+fs.readFileSync(path.join(__dirname,'native.js'),'utf8');
for(const f of ['index.html','en.html']){
  const p=path.join(out,f);let s=fs.readFileSync(p,'utf8');
  s=s.replace('<head>','<head>\n<script>window.__NATIVE=true;</script>');
  const i=s.lastIndexOf('</body>');s=s.slice(0,i)+'<script>\n'+nat+'\n</script>\n'+s.slice(i);
  fs.writeFileSync(p,s);
}
console.log('www ready');
