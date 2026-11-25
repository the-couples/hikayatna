import re,json,sys
AR=re.compile(r'[؀-ۿ]')
def units(s):
    """yield (start,end,text) for translatable units: JS string literals with Arabic inside <script>, and HTML text/attr outside."""
    out=[]
    pos=0
    for m in re.finditer(r'(<script[^>]*>)(.*?)(</script>)',s,re.S):
        out+=html_units(s,pos,m.start(2))
        out+=js_units(s,m.start(2),m.end(2))
        pos=m.end(2)
    out+=html_units(s,pos,len(s))
    return out
def html_units(s,a,b):
    res=[]
    seg=s[a:b]
    # skip style blocks
    for m in re.finditer(r'>([^<>]+)<|="([^"]*)"',seg):
        g=1 if m.group(1) is not None else 2
        t=m.group(g)
        if t and AR.search(t) and 'base64' not in t:
            st=a+m.start(g);res.append((st,st+len(t),t))
    return res
def js_units(s,a,b):
    res=[];i=a
    while i<b:
        c=s[i]
        if c in '\'"`':
            q=c;j=i+1
            while j<b and s[j]!=q:
                if s[j]=='\\': j+=1
                if q!='`' and s[j]=='\n': break
                j+=1
            t=s[i+1:j]
            if AR.search(t): res.append((i+1,j,t))
            i=j+1
        elif c=='/' and i+1<b and s[i+1]=='/':
            j=s.find('\n',i);i=b if j<0 else j
        elif c=='/' and i+1<b and s[i+1]=='*':
            j=s.find('*/',i+2);i=b if j<0 else j+2
        elif c=='/' :
            # regex literal heuristic: previous non-space char
            k=i-1
            while k>a and s[k] in ' \t': k-=1
            if s[k] in '(,=:[!&|?;{}+' or s[k:k+1]=='\n':
                j=i+1
                while j<b and s[j]!='/' :
                    if s[j]=='\\': j+=1
                    elif s[j]=='[':
                        while j<b and s[j]!=']':
                            if s[j]=='\\': j+=1
                            j+=1
                    if s[j]=='\n': break
                    j+=1
                i=j+1
            else: i+=1
        else: i+=1
    return res
if __name__=='__main__':
    s=open(sys.argv[1],encoding='utf-8').read()
    u=units(s)
    uniq=[]
    seen=set()
    for _,_,t in u:
        if t not in seen: seen.add(t);uniq.append(t)
    json.dump(uniq,open(sys.argv[2],'w',encoding='utf-8'),ensure_ascii=False,indent=0)
    print(len(u),len(uniq),sum(len(x) for x in uniq))

CH=re.compile(r'<[^>]*>|"')
def chunks_of(t):
    """split a unit into (start,end) chunks with Arabic, outside tags; inside tags take attribute values"""
    out=[];pos=0
    for m in re.finditer(r'<[^>]*>',t):
        out+=_plain(t,pos,m.start())
        # attr values inside tag
        for a in re.finditer(r'="([^"]*)"',m.group(0)):
            v=a.group(1)
            if AR.search(v): out.append((m.start()+a.start(1),m.start()+a.end(1)))
        pos=m.end()
    out+=_plain(t,pos,len(t))
    return out
def _plain(t,a,b):
    seg=t[a:b]
    if not AR.search(seg): return []
    # trim surrounding whitespace for key stability
    l=len(seg)-len(seg.lstrip());r=len(seg.rstrip())
    return [(a+l,a+r)]
