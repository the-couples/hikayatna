// حكايتنا — خادم إرسال الإشعارات (Cloudflare Worker)
// يستقبل طلبًا من التطبيق مع رمز Firebase للمستخدم، ويرسل إشعار Web Push لاشتراكات الشريك.
// الأسرار المطلوبة (Settings → Variables and Secrets):
//   VAPID_PUBLIC  : المفتاح العام (base64url)
//   VAPID_PRIVATE : المفتاح الخاص (base64url)
//   VAPID_SUBJECT : mailto:you@example.com
//   FIREBASE_PROJECT : hikayatna-app

const ORIGINS = ['https://the-couples.github.io', 'capacitor://localhost', 'http://localhost', 'https://localhost'];
const te = new TextEncoder();

const b64u = {
  enc(buf) { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const s = atob(str); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; },
};
const concat = (...a) => { const n = a.reduce((s, x) => s + x.length, 0); const o = new Uint8Array(n); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };

function cors(req) {
  const o = req.headers.get('Origin') || '';
  const ok = ORIGINS.includes(o);
  return { 'Access-Control-Allow-Origin': ok ? o : ORIGINS[0], 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Vary': 'Origin' };
}
const json = (req, body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(req) } });

/* ---------- التحقق من رمز Firebase ---------- */
let JWKS = null, JWKS_T = 0;
async function verifyFirebase(token, project) {
  const [h, p, s] = String(token || '').split('.');
  if (!s) throw new Error('bad token');
  const head = JSON.parse(new TextDecoder().decode(b64u.dec(h)));
  const pl = JSON.parse(new TextDecoder().decode(b64u.dec(p)));
  const now = Math.floor(Date.now() / 1000);
  if (pl.aud !== project || pl.iss !== 'https://securetoken.google.com/' + project || !pl.sub || pl.exp < now || pl.iat > now + 300) throw new Error('claims');
  if (!JWKS || Date.now() - JWKS_T > 3600e3) {
    const r = await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
    JWKS = (await r.json()).keys; JWKS_T = Date.now();
  }
  const jwk = JWKS.find(k => k.kid === head.kid);
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u.dec(s), te.encode(h + '.' + p));
  if (!ok) throw new Error('sig');
  return pl.sub;
}

/* ---------- VAPID ---------- */
async function vapidAuth(endpoint, env) {
  const aud = new URL(endpoint).origin;
  const pub = b64u.dec(env.VAPID_PUBLIC);
  const jwk = { kty: 'EC', crv: 'P-256', x: b64u.enc(pub.slice(1, 33)), y: b64u.enc(pub.slice(33, 65)), d: env.VAPID_PRIVATE, ext: true };
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const h = b64u.enc(te.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const p = b64u.enc(te.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: env.VAPID_SUBJECT || 'mailto:admin@example.com' })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, te.encode(h + '.' + p));
  return 'vapid t=' + h + '.' + p + '.' + b64u.enc(sig) + ', k=' + env.VAPID_PUBLIC;
}

/* ---------- تشفير الرسالة (RFC 8291 / aes128gcm) ---------- */
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8));
}
async function encrypt(sub, payload) {
  const uaPub = b64u.dec(sub.keys.p256dh), auth = b64u.dec(sub.keys.auth);
  const local = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', local.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, local.privateKey, 256));
  const ikm = await hkdf(auth, shared, concat(te.encode('WebPush: info\0'), uaPub, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, te.encode('Content-Encoding: nonce\0'), 12);
  const plain = concat(te.encode(payload), new Uint8Array([2]));
  const k = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, k, plain));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return concat(salt, rs, new Uint8Array([asPub.length]), asPub, ct);
}
async function sendPush(sub, payload, env) {
  const body = await encrypt(sub, payload);
  const r = await fetch(sub.endpoint, {
    method: 'POST',
    headers: { 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', 'TTL': '86400', 'Urgency': 'high', 'Authorization': await vapidAuth(sub.endpoint, env) },
    body,
  });
  return r.status;
}

/* ---------- حدّ بسيط لمنع الإساءة ---------- */
const hits = new Map();
function limited(uid) { const now = Date.now(); const a = (hits.get(uid) || []).filter(t => now - t < 60e3); a.push(now); hits.set(uid, a); return a.length > 40; }

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });
    const url = new URL(req.url);
    if (req.method === 'GET') return json(req, { ok: true, service: 'hikayatna-push', vapid: env.VAPID_PUBLIC || null });
    if (req.method !== 'POST' || url.pathname !== '/notify') return json(req, { error: 'not found' }, 404);
    let uid;
    try { uid = await verifyFirebase((req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, ''), env.FIREBASE_PROJECT || 'hikayatna-app'); }
    catch (e) { return json(req, { error: 'unauthorized' }, 401); }
    if (limited(uid)) return json(req, { error: 'slow down' }, 429);
    let d; try { d = await req.json(); } catch (e) { return json(req, { error: 'bad json' }, 400); }
    const subs = Array.isArray(d.subs) ? d.subs.slice(0, 6) : [];
    const msg = { title: String(d.title || '').slice(0, 80), body: String(d.body || '').slice(0, 200), tag: String(d.tag || 'hk').slice(0, 30), url: String(d.url || './').slice(0, 200) };
    const payload = JSON.stringify(msg);
    const gone = [];
    await Promise.all(subs.map(async s => {
      try {
        if (!s || !s.endpoint || !s.keys || !/^https:\/\//.test(s.endpoint)) return;
        const st = await sendPush(s, payload, env);
        if (st === 404 || st === 410) gone.push(s.endpoint);
      } catch (e) { }
    }));
    return json(req, { ok: true, sent: subs.length - gone.length, gone });
  },
};
