/* نص الإشعار بلغة الشريك المستقبِل (fem: المرسل أنثى، ofem: المستقبِل أنثى) */
window.__pushText=(kind,en,nm,fem,ofem)=>{
 if(kind==='kiss')return en?['💋 '+nm,nm+' sent you a big kiss 😘']:['💋 '+nm,(fem?'أرسلت':'أرسل')+' لك قبلة قوية 😘'];
 if(!kind)return null;
 if(kind.chat){const m=kind.chat;
  const b=m.stk?(en?'🌟 Sticker':'🌟 ملصق'):m.aud?(en?'🎤 Voice message':'🎤 رسالة صوتية'):m.img?(m.text?'📷 '+m.text:(en?'📷 Photo':'📷 صورة')):String(m.text||'').slice(0,160);
  return ['💬 '+nm,b]}
 if(kind.game){const G={wyr:['ماذا تفضّل؟','Would you rather'],draw:['نرسم معًا 🎨','Let us draw 🎨'],touch:['لمسة عن بُعد 🤍','Remote touch 🤍'],tod:['صراحة أم جرأة 🎲','Truth or dare 🎲']}[kind.game]||['لعبة','a game'];
  return en?['🎮 '+nm,nm+' opened «'+G[1]+'», come play together']:['🎮 '+nm,(fem?'دخلت':'دخل')+' إلى لعبة «'+G[0]+'»، '+(ofem?'تعالي والعبي':'تعال والعب')+' '+(fem?'معها':'معه')]}
 if(kind.points!==undefined){const p=kind.points,k=Math.abs(p);
  if(en)return [(p>0?'⭐ ':'🔻 ')+nm,nm+(p>0?' gave you ':' took ')+k+(k===1?' point':' points')+(p>0?'':' from you')+' · '+(kind.reason||'')];
  const u=k===1?'نقطة':k===2?'نقطتين':k+' نقاط';
  return [(p>0?'⭐ ':'🔻 ')+nm,(p>0?(fem?'أعطتك ':'أعطاك ')+u:(fem?'خصمت منك ':'خصم منك ')+u)+' · '+(kind.reason||'')]}
 if(kind.note){const th=kind.note==='thanks',t=String(kind.text||'').slice(0,120);
  if(en)return [(th?'💐 ':'📝 ')+nm,(th?nm+' sent you a thank-you: ':nm+' wrote you a note: ')+t];
  return [(th?'💐 ':'📝 ')+nm,(th?(fem?'أرسلت لك شكرًا: ':'أرسل لك شكرًا: '):(fem?'كتبت لك ملاحظة: ':'كتب لك ملاحظة: '))+t]}
 if(kind.call){const v=!!kind.video,ic=v?'📹 ':'📞 ';return en?[ic+nm,nm+(v?' is video calling you, tap to answer':' is calling you, tap to answer')]:[ic+nm,(v?'مكالمة فيديو · ':'')+(fem?'تتصل':'يتصل')+' بك، '+(ofem?'اضغطي':'اضغط')+' للرد']}
 if(kind.plike){const r=kind.reason?' · '+kind.reason:'';return en?['❤️ '+nm,nm+' loved the points you gave'+r]:['❤️ '+nm,(fem?'أعجبتها':'أعجبته')+' النقاط التي منحتها'+r]}
 if(kind.missed)return en?['📞 '+nm,'Missed call']:['📞 '+nm,'مكالمة فائتة'];
 return null};
