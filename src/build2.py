import json,re,sys,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from extract import units,chunks_of
D=os.path.dirname(os.path.abspath(__file__))
keys=json.load(open(D+'/keys.json',encoding='utf-8'))
tr={}
for f in ['tr1.tsv','tr2.tsv','tr3.tsv','tr4.tsv','tr5.tsv','tr6.tsv','tr7.tsv','tr8.tsv','tr9.tsv','tr10.tsv','tr11.tsv','tr12.tsv','tr13.tsv','tr14.tsv','tr15.tsv','tr16.tsv','tr17.tsv','tr18.tsv','tr19.tsv','tr20.tsv','tr21.tsv']:
    for line in open(D+'/'+f,encoding='utf-8').read().split('\n'):
        if not line.strip(): continue
        p=line.split('\t')
        i=int(p[0]);ar=p[1] if len(p)>1 else '=';en=p[2] if len(p)>2 else ''
        k=keys[i]
        tr[k]=(k if ar=='=' else ar, k if en=='=' else en)
missing=[k for k in keys if k not in tr]
if missing: print('MISSING',len(missing),missing[:5]);sys.exit(1)
src=open(D+'/merged.html',encoding='utf-8').read()
def localize(s,li):
    out=[];pos=0
    for a,b,t in units(s):
        q=s[a-1] if a>0 else ''
        out.append(s[pos:a])
        new=[];p=0
        for x,y in chunks_of(t):
            k=t[x:y];v=tr.get(k,(k,k))[li]
            if li==1: v=v.replace("'",'’')
            if q in "'`" and q in v: v=v.replace(q,'’')
            new.append(t[p:x]);new.append(v);p=y
        new.append(t[p:]);out.append(''.join(new));pos=b
    out.append(s[pos:]);return ''.join(out)
LANGSW='''<script>(function(){try{var w=localStorage.getItem('hk-lang'),here=document.documentElement.lang;if(w&&w!==here&&!/[?&]stay/.test(location.search)){location.replace(w==='en'?'en.html':'./');}}catch(e){}})();window.__setLang=function(l){try{localStorage.setItem('hk-lang',l)}catch(e){}location.href=l==='en'?'en.html':'./'};</script>'''
def common(s,lang):
    s=s.replace('<meta charset="utf-8">','<meta charset="utf-8">\n'+LANGSW,1)
    return s
ar=common(localize(src,0),'ar')
en=localize(src,1)
en=en.replace('<html lang="ar" dir="rtl">','<html lang="en" dir="ltr">',1)
assert "const L='ar-u-nu-latn'" in en
en=en.replace("const L='ar-u-nu-latn'","const L='en-GB'")
en=en.replace('href="manifest.json"','href="manifest-en.json"')
for o,n in [("(e.years===1?' first':' the'+e.years)","(' ('+e.years+')')"),
             ("relLbl().replace('Date','Anniversary')","relLbl().replace(' date',' anniversary').replace('Date we met','Anniversary of meeting')"),
             ("' &'+","' & '+"),
             ("'<!DOCTYPE html><html lang=\"ar\" dir=\"rtl\">","'<!DOCTYPE html><html lang=\"en\" dir=\"ltr\">"),
             (".fvi{display:block;text-align:right",".fvi{display:block;text-align:start"),
             (".cb.tx .tm{position:absolute;left:10px;",".cb.tx .tm{position:absolute;right:10px;"),
             (".favrm{position:absolute;top:9px;left:10px;",".favrm{position:absolute;top:9px;right:10px;"),
             (".fvi .fh{padding-left:78px}",".fvi .fh{padding-right:78px}")]:
    c=en.count(o)
    assert c>=1,o
    en=en.replace(o,n)
en=common(en,'en')
# language switch buttons
for name,s,lbl,to in [('ar',ar,'English','en'),('en',en,'العربية','ar')]:
    o='<button type="button" class="lsw" id="l-fg" style="opacity:.7">'
    assert o in s, 'no l-fg in '+name
    s=s.replace('</form></div><div class="onb"','<br><button type="button" class="lsw" onclick="__setLang(\''+to+'\')" style="text-decoration:none;opacity:.85">🌐 '+lbl+'</button></form></div><div class="onb"',1)
    s=s.replace('<p class="small" style="opacity:.6">','<p class="small"><button type="button" class="chip" onclick="__setLang(\\\''+to+'\\\')">🌐 '+lbl+'</button></p><p class="small" style="opacity:.6">',1)
    if name=='ar': ar=s
    else: en=s
open(D+'/../index.html','w',encoding='utf-8').write(ar)
open(D+'/../en.html','w',encoding='utf-8').write(en)
print('ok',len(ar),len(en))
