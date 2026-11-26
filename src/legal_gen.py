# Generates the public store pages (privacy, terms, support, delete account) in Arabic + English.
# Usage: python3 legal_gen.py support@email
import os, sys, html
EMAIL = sys.argv[1] if len(sys.argv) > 1 else 'EMAIL'
UPDATED_AR = '26 نوفمبر 2026'
UPDATED_EN = 'November 26, 2026'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'legal')
os.makedirs(OUT, exist_ok=True)

CSS = '''
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,"SF Arabic","Segoe UI",Tahoma,sans-serif;background:#151a45;color:#f6f0ff;line-height:1.8}
.wrap{max-width:760px;margin:0 auto;padding:28px 20px 60px}
header{display:flex;align-items:center;gap:12px;margin-bottom:10px}
header img{width:52px;height:52px;border-radius:14px}
header b{font-size:22px}header span{display:block;font-size:13px;opacity:.7}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 22px}
nav a{color:#ffd88a;text-decoration:none;font-size:14px;padding:6px 12px;border:1px solid rgba(255,255,255,.18);border-radius:99px}
nav a.on{background:#ffd88a;color:#151a45}
.lang{display:flex;gap:8px;margin-bottom:6px}
.lang button{font:inherit;font-size:14px;border:0;border-radius:99px;padding:6px 14px;background:rgba(255,255,255,.12);color:#fff;cursor:pointer}
.lang button.on{background:#f06292}
section{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:18px 20px;margin:12px 0}
h1{font-size:24px;margin:6px 0 4px}h2{font-size:18px;margin:0 0 6px;color:#ffd88a}
p,li{font-size:15px}ul{padding-inline-start:20px;margin:6px 0}
a{color:#ffb3cf}.small{font-size:13px;opacity:.7}
.btn{display:inline-block;background:#f06292;color:#fff;text-decoration:none;padding:10px 18px;border-radius:12px;font-weight:700;margin-top:6px}
[data-l]{display:none}body.ar [data-l=ar],body.en [data-l=en]{display:block}
'''
JS = '''<script>(function(){var l=(location.hash==='#en'||/[?&]lang=en/.test(location.search)||(!/^ar/.test(navigator.language||'')&&!location.hash))?'en':'ar';
function set(x){document.body.className=x;document.documentElement.lang=x;document.documentElement.dir=x==='ar'?'rtl':'ltr';
document.querySelectorAll('.lang button').forEach(function(b){b.classList.toggle('on',b.dataset.set===x)})}
document.querySelectorAll('.lang button').forEach(function(b){b.onclick=function(){set(b.dataset.set);history.replaceState(null,'','#'+b.dataset.set)}});
if(location.hash==='#ar')l='ar';set(l)})();</script>'''

PAGES = [('privacy', 'سياسة الخصوصية', 'Privacy Policy'), ('terms', 'شروط الاستخدام', 'Terms of Use'),
         ('support', 'الدعم', 'Support'), ('delete-account', 'حذف الحساب', 'Delete account')]

def S(title, body):
    return '<section><h2>' + title + '</h2>' + body + '</section>'

M = f'<a href="mailto:{EMAIL}">{EMAIL}</a>'

CONTENT = {
'privacy': (
S('مقدمة', '<p>«حكايتنا» تطبيق خاص لشخصين في علاقة، يحفظان فيه ذكرياتهما ومحادثاتهما وخططهما. نحترم خصوصيتكما: لا نبيع بياناتكما، ولا نعرض إعلانات، ولا نستخدم أدوات تتبّع إعلانية.</p>') +
S('البيانات التي نجمعها', '<ul><li><b>بيانات الحساب:</b> البريد الإلكتروني وكلمة المرور (تُدار بأمان عبر Firebase Authentication من Google ولا نطّلع على كلمة المرور).</li><li><b>المحتوى الذي تضيفانه:</b> الأسماء، التواريخ والمناسبات، الذكريات، الصور، الرسائل النصية والصوتية، القوائم، الأمنيات، المزاج، والشعار إن أضفتماه.</li><li><b>بيانات الإشعارات:</b> رمز جهاز لإرسال الإشعارات إلى شريكك، ولغة التطبيق.</li><li><b>بيانات تقنية بسيطة:</b> إصدار التطبيق ووقت آخر ظهور داخل المحادثة لإظهار «متصل الآن» و«شوهدت».</li></ul><p>لا نجمع موقعك الجغرافي ولا جهات الاتصال ولا أي بيانات من خارج التطبيق.</p>') +
S('كيف نستخدمها', '<ul><li>لعرض المحتوى لك ولشريكك فقط داخل مساحتكما المشتركة.</li><li>لإرسال إشعارات الرسائل والتنبيهات إلى شريكك.</li><li>لتحويل الرسائل الصوتية إلى نص عند طلبك ذلك: يُرسَل المقطع إلى خدمة Cloudflare Workers AI لمعالجته فورًا ولا يُحفظ لديها.</li><li>المكالمات الصوتية تتم مباشرة بين جهازيكما (WebRTC) ولا نسجّلها.</li></ul>') +
S('مع من نشاركها', '<p>لا نشارك بياناتك مع أي طرف إلا مزوّدي الخدمة الذين يشغّلون التطبيق نيابةً عنا: <b>Google Firebase</b> (الحسابات وقاعدة البيانات)، و<b>Cloudflare</b> (الإشعارات وتحويل الصوت إلى نص)، و<b>Google Play / Apple</b> (الدفع والاشتراكات، ولا نرى بيانات بطاقتك). البيانات مشفّرة أثناء النقل، ولا يستطيع الوصول إلى مساحتكما إلا الشريكان.</p>') +
S('حذف بياناتك', '<p>يمكنك حذف حسابك في أي وقت من داخل التطبيق: <b>الإعدادات ← احذف حسابي</b>. عند الحذف يُحذف حسابك وملفك الشخصي فورًا. أما المحتوى المشترك فيبقى لشريكك ما دام حسابه قائمًا، وعندما يحذف الشريكان حسابيهما تُحذف المساحة المشتركة بالكامل. قد تبقى نسخ احتياطية تقنية لدى مزوّد الخدمة لفترة محدودة ثم تُمحى. يمكنك أيضًا طلب الحذف عبر صفحة <a href="delete-account.html#ar">حذف الحساب</a>.</p>') +
S('الأعمار', '<p>التطبيق موجّه لمن هم في سن 18 عامًا فأكثر.</p>') +
S('التواصل', '<p>لأي سؤال عن الخصوصية: ' + M + '</p><p class="small">آخر تحديث: ' + UPDATED_AR + '</p>'),
S('Introduction', '<p>Hikayatna is a private app for two people in a relationship to keep their memories, chats and plans together. We respect your privacy: we do not sell your data, show ads, or use advertising trackers.</p>') +
S('Data we collect', '<ul><li><b>Account data:</b> email and password (handled securely by Google Firebase Authentication; we never see your password).</li><li><b>Content you add:</b> names, dates and occasions, memories, photos, text and voice messages, lists, wishes, moods, and a logo if you add one.</li><li><b>Notification data:</b> a device token used to deliver notifications to your partner, and the app language.</li><li><b>Basic technical data:</b> app version and last-seen time inside the chat, to show “online” and “seen”.</li></ul><p>We do not collect your location, contacts, or any data from outside the app.</p>') +
S('How we use it', '<ul><li>To show your content only to you and your partner inside your shared space.</li><li>To send message and reminder notifications to your partner.</li><li>To convert a voice message to text when you ask: the clip is sent to Cloudflare Workers AI, processed immediately and not stored.</li><li>Voice calls run directly between your two devices (WebRTC) and are never recorded.</li></ul>') +
S('Who we share it with', '<p>We share data only with the service providers that run the app for us: <b>Google Firebase</b> (accounts and database), <b>Cloudflare</b> (notifications and speech-to-text) and <b>Google Play / Apple</b> (payments and subscriptions; we never see your card details). Data is encrypted in transit, and only the two partners can access their space.</p>') +
S('Deleting your data', '<p>You can delete your account at any time inside the app: <b>Settings → Delete my account</b>. Your account and personal profile are deleted immediately. Shared content stays available to your partner while their account exists; when both partners delete their accounts, the whole shared space is deleted. Technical backups at our provider may persist for a limited time and are then erased. You can also request deletion on the <a href="delete-account.html#en">Delete account</a> page.</p>') +
S('Age', '<p>The app is intended for people aged 18 and over.</p>') +
S('Contact', '<p>Privacy questions: ' + M + '</p><p class="small">Last updated: ' + UPDATED_EN + '</p>')),

'terms': (
S('الاستخدام', '<p>باستخدامك «حكايتنا» توافق على هذه الشروط. التطبيق للاستخدام الشخصي بين شريكين بالغين. أنت مسؤول عن المحتوى الذي تضيفه، ويُمنع استخدام التطبيق لأي محتوى غير قانوني أو مسيء.</p>') +
S('الاشتراك', '<ul><li>يمكن تجربة التطبيق مجانًا لمدة 14 يومًا، ثم يتطلب اشتراكًا شهريًا أو سنويًا. اشتراك واحد يكفي للشريكين.</li><li>تظهر الأسعار داخل التطبيق بعملة بلدك قبل الدفع.</li><li>يتجدد الاشتراك تلقائيًا ويُخصم من حسابك في Google Play أو App Store، إلا إذا ألغيته قبل نهاية الفترة الحالية بـ 24 ساعة على الأقل.</li><li>يمكنك إدارة الاشتراك أو إلغاؤه من إعدادات Google Play أو حساب Apple. تخضع المبالغ المستردة لسياسات المتجر.</li></ul>') +
S('الخدمة', '<p>نعمل على أن يبقى التطبيق متاحًا وآمنًا، لكنه يُقدَّم «كما هو» دون ضمانات. ننصح بأخذ نسخة احتياطية من الإعدادات. قد نحدّث هذه الشروط، وسننشر أي تغيير هنا.</p>') +
S('التواصل', '<p>' + M + '</p><p class="small">آخر تحديث: ' + UPDATED_AR + '</p>'),
S('Use', '<p>By using Hikayatna you agree to these terms. The app is for personal use between two adult partners. You are responsible for the content you add, and you may not use the app for illegal or abusive content.</p>') +
S('Subscription', '<ul><li>You can try the app free for 14 days; after that a monthly or yearly subscription is required. One subscription covers both partners.</li><li>Prices are shown in the app in your local currency before you pay.</li><li>Subscriptions renew automatically and are charged to your Google Play or App Store account unless cancelled at least 24 hours before the end of the current period.</li><li>Manage or cancel your subscription in Google Play or your Apple account settings. Refunds follow the store’s policies.</li></ul>') +
S('Service', '<p>We work to keep the app available and secure, but it is provided “as is” without warranties. We recommend making a backup from Settings. We may update these terms and will post any changes here.</p>') +
S('Contact', '<p>' + M + '</p><p class="small">Last updated: ' + UPDATED_EN + '</p>')),

'support': (
S('نحن هنا لمساعدتك', '<p>لأي مشكلة أو اقتراح راسلنا على ' + M + '، ونرد عادةً خلال يومين.</p>') +
S('أسئلة شائعة', '<p><b>كيف أربط شريكي؟</b><br>بعد إنشاء حسابك يظهر لك رمز دعوة؛ أرسله لشريكك ليدخله عند إنشاء حسابه.</p><p><b>لا تصلني الإشعارات؟</b><br>من داخل التطبيق: الإعدادات ← الإشعارات، وتأكد من السماح بها في إعدادات الهاتف.</p><p><b>كيف ألغي الاشتراك؟</b><br>من Google Play ← الدفعات والاشتراكات، أو من إعدادات حساب Apple.</p><p><b>كيف أحذف حسابي؟</b><br>الإعدادات ← احذف حسابي. التفاصيل في <a href="delete-account.html#ar">صفحة حذف الحساب</a>.</p>'),
S('We’re here to help', '<p>For any problem or suggestion, email ' + M + '. We usually reply within two days.</p>') +
S('FAQ', '<p><b>How do I connect my partner?</b><br>After you create your account you get an invite code; send it to your partner to enter when they sign up.</p><p><b>Not getting notifications?</b><br>In the app: Settings → Notifications, and make sure notifications are allowed in your phone settings.</p><p><b>How do I cancel my subscription?</b><br>Google Play → Payments & subscriptions, or your Apple account settings.</p><p><b>How do I delete my account?</b><br>Settings → Delete my account. Details on the <a href="delete-account.html#en">Delete account page</a>.</p>')),

'delete-account': (
S('حذف حسابك في «حكايتنا»', '<p><b>من داخل التطبيق (الأسرع):</b></p><ol><li>افتح التطبيق وسجّل الدخول.</li><li>اضغط ⚙️ <b>الإعدادات</b>.</li><li>اضغط <b>احذف حسابي</b> ثم أكّد.</li></ol><p><b>أو اطلب الحذف بالبريد:</b> أرسل من البريد المسجّل في حسابك رسالة إلى ' + M + ' بعنوان «حذف الحساب»، وسنحذفه خلال 7 أيام.</p>') +
S('ماذا يُحذف؟', '<ul><li>حسابك (البريد وكلمة المرور) وملفك الشخصي ورمز الإشعارات: تُحذف فورًا.</li><li>المحتوى المشترك (الذكريات، المحادثة، الصور…): يبقى لشريكك ما دام حسابه قائمًا، ويُحذف بالكامل عندما يحذف الشريكان حسابيهما.</li><li>قد تبقى نسخ احتياطية تقنية لدى مزوّد الخدمة حتى 30 يومًا ثم تُمحى.</li></ul>'),
S('Delete your Hikayatna account', '<p><b>Inside the app (fastest):</b></p><ol><li>Open the app and sign in.</li><li>Tap ⚙️ <b>Settings</b>.</li><li>Tap <b>Delete my account</b> and confirm.</li></ol><p><b>Or request deletion by email:</b> from the email registered on your account, write to ' + M + ' with the subject “Delete account”, and we will delete it within 7 days.</p>') +
S('What gets deleted?', '<ul><li>Your account (email and password), personal profile and notification token: deleted immediately.</li><li>Shared content (memories, chat, photos…): stays available to your partner while their account exists, and is fully deleted when both partners delete their accounts.</li><li>Technical backups at our provider may persist for up to 30 days and are then erased.</li></ul>')),
}

for slug, ar, en in PAGES:
    a, e = CONTENT[slug]
    nav = ''.join('<a href="%s.html" class="%s"><span data-l="ar" style="display:inline">%s</span></a>' % (s2, 'on' if s2 == slug else '', '') for s2, _, _ in [])
    navl = lambda l: ''.join('<a href="%s.html#%s"%s>%s</a>' % (s2, l, ' class="on"' if s2 == slug else '', t_ar if l == 'ar' else t_en) for s2, t_ar, t_en in PAGES)
    doc = f'''<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{ar} · حكايتنا — {en} · Hikayatna</title><link rel="icon" href="../icons/icon-192.png"><style>{CSS}</style></head><body class="ar"><div class="wrap">
<header><img src="../icons/icon-192.png" alt=""><div><b>حكايتنا · Hikayatna</b><span>تطبيق للأزواج · An app for couples</span></div></header>
<div class="lang"><button data-set="ar">العربية</button><button data-set="en">English</button></div>
<div data-l="ar"><nav>{navl('ar')}</nav><h1>{ar}</h1>{a}</div>
<div data-l="en"><nav>{navl('en')}</nav><h1>{en}</h1>{e}</div>
</div>{JS}</body></html>'''
    open(os.path.join(OUT, slug + '.html'), 'w', encoding='utf-8').write(doc)
print('ok', OUT)
