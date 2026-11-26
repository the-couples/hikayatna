/* نص الإشعار بلغة الشريك المستقبِل (fem: المرسل أنثى، ofem: المستقبِل أنثى) */
window.__pushText=(kind,en,nm,fem,ofem)=>{
 if(kind==='kiss')return en?['💋 '+nm,nm+' sent you a big kiss 😘']:['💋 '+nm,(fem?'أرسلت':'أرسل')+' لك قبلة قوية 😘'];
 if(!kind)return null;
 if(kind.chat){const m=kind.chat;
  const b=m.stk?(en?'🌟 Sticker':'🌟 ملصق'):m.aud?(en?'🎤 Voice message':'🎤 رسالة صوتية'):m.img?(m.text?'📷 '+m.text:(en?'📷 Photo':'📷 صورة')):String(m.text||'').slice(0,160);
  return ['💬 '+nm,b]}
 if(kind.game){const G={wyr:['ماذا تفضّل؟','Would you rather'],draw:['نرسم معًا 🎨','Let us draw 🎨'],touch:['لمسة عن بُعد 🤍','Remote touch 🤍']}[kind.game]||['لعبة','a game'];
  return en?['🎮 '+nm,nm+' opened «'+G[1]+'», come play together']:['🎮 '+nm,(fem?'دخلت':'دخل')+' إلى لعبة «'+G[0]+'»، '+(ofem?'تعالي والعبي':'تعال والعب')+' '+(fem?'معها':'معه')]}
 if(kind.points!==undefined){const p=kind.points,k=Math.abs(p);
  if(en)return [(p>0?'⭐ ':'🔻 ')+nm,nm+(p>0?' gave you ':' took ')+k+(k===1?' point':' points')+(p>0?'':' from you')+' · '+(kind.reason||'')];
  const u=k===1?'نقطة':k===2?'نقطتين':k+' نقاط';
  return [(p>0?'⭐ ':'🔻 ')+nm,(p>0?(fem?'أعطتك ':'أعطاك ')+u:(fem?'خصمت منك ':'خصم منك ')+u)+' · '+(kind.reason||'')]}
 if(kind.note){const th=kind.note==='thanks',t=String(kind.text||'').slice(0,120);
  if(en)return [(th?'💐 ':'📝 ')+nm,(th?nm+' sent you a thank-you: ':nm+' wrote you a note: ')+t];
  return [(th?'💐 ':'📝 ')+nm,(th?(fem?'أرسلت لك شكرًا: ':'أرسل لك شكرًا: '):(fem?'كتبت لك ملاحظة: ':'كتب لك ملاحظة: '))+t]}
 return null};
