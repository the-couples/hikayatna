/* نص الإشعار بلغة الشريك المستقبِل */
window.__pushText=(kind,en,nm,fem)=>{
 if(kind==='kiss')return en?['💋 '+nm,nm+' sent you a big kiss 😘']:['💋 '+nm,(fem?'أرسلت':'أرسل')+' لك قبلة قوية 😘'];
 if(kind&&kind.chat){const m=kind.chat;
  const b=m.stk?(en?'🌟 Sticker':'🌟 ملصق'):m.aud?(en?'🎤 Voice message':'🎤 رسالة صوتية'):m.img?(m.text?'📷 '+m.text:(en?'📷 Photo':'📷 صورة')):String(m.text||'').slice(0,160);
  return ['💬 '+nm,b]}
 return null};
