const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

function normalizarTelefono(raw) {
  var d = raw.replace(/\D/g, '');
  if (d.startsWith('54')) { d = d.slice(2); if (d.startsWith('9')) d = d.slice(1); }
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) return { ok: true, numero: '549' + d };
  if (d.length === 12) {
    for (var a = 2; a <= 4; a++) {
      if (d.slice(a, a + 2) === '15') {
        var c = d.slice(0, a) + d.slice(a + 2);
        if (c.length === 10) return { ok: true, numero: '549' + c };
      }
    }
  }
  return { ok: false, error: 'telefono_invalido' };
}



module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo no permitido' });

  try {
    const { nombre, apellido, email, whatsapp, caja, empresa } = req.body;
    const ip = (req.headers['x-forwarded-for'] || '127.0.0.1').split(',')[0].trim();

    // CAPA 1: HONEYPOT
    if (empresa) {
      console.log('HONEYPOT. IP:', ip);
      return res.status(200).json({ success: true });
    }

    // Validacion
    if (!nombre || !apellido || !email || !whatsapp || !caja) {
      return res.status(400).json({ ok: false, error: 'faltan_datos' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email invalido' });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // CAPA 3: RATE LIMIT (max 3/hora por IP)
    try {
      const unaHoraAtras = new Date(Date.now() - 3600000).toISOString();
      const { count } = await supabase
        .from('rate_limits')
        .select('id', { count: 'exact', head: true })
        .eq('ip', ip)
        .gte('created_at', unaHoraAtras);
      if ((count || 0) >= 3) {
        console.log('RATE LIMIT. IP:', ip);
        return res.status(429).json({ error: 'Demasiadas solicitudes, intenta mas tarde.' });
      }
      supabase.from('rate_limits').insert({ ip }).then(() => {}).catch(() => {});
    } catch (e) {
      console.error('rate_limit error (ignorado):', e.message);
    }

    // Normalizar telefono
    const tel = normalizarTelefono(whatsapp);
    console.log('TEL original:', whatsapp, '| normalizado:', JSON.stringify(tel));

    // CAPA 4: DEDUPE por telefono normalizado
    if (tel.ok) {
      try {
        const { data: existe } = await supabase
          .from('reservas')
          .select('id')
          .eq('whatsapp_normalizado', tel.numero)
          .maybeSingle();
        if (existe) {
          console.log('DEDUPE: ya registrado:', tel.numero);
          return res.status(200).json({ success: true, duplicado: true });
        }
      } catch (e) {
        console.error('dedupe error (ignorado):', e.message);
      }
    }

    // INSERT principal
    const { data, error: dbError } = await supabase
      .from('reservas')
      .insert([{
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        whatsapp_normalizado: tel.ok ? tel.numero : null,
        tipo_caja: caja.trim()
      }])
      .select('id, created_at');

    if (dbError) {
      if (dbError.code === '23505') return res.status(200).json({ success: true, duplicado: true });
      console.error('DB INSERT error:', JSON.stringify(dbError));
      return res.status(500).json({ error: 'Error al guardar la reserva' });
    }

    const reservaId = data?.[0]?.id || '-';

    // CAPA 5: FRENO GLOBAL WA (max 100/dia)
    let enviarWA = true;
    try {
      const inicioHoy = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
      const { count: waCount } = await supabase
        .from('wa_send_log')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', inicioHoy);
      if ((waCount || 0) >= 100) {
        console.error('FRENO GLOBAL WA ACTIVADO. Envios hoy:', waCount);
        enviarWA = false;
      }
    } catch (e) {
      console.error('wa freno error (ignorado):', e.message);
    }

    // WhatsApp (best-effort)
    if (enviarWA && tel.ok && process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
      try {
        const waBody = (tplName, params) => JSON.stringify({
          messaging_product: 'whatsapp',
          to: tel.numero,
          type: 'template',
          template: {
            name: tplName,
            language: { code: 'es_AR' },
            components: [{ type: 'body', parameters: params }]
          }
        });
        const waHeaders = {
          'Authorization': 'Bearer ' + process.env.WHATSAPP_TOKEN,
          'Content-Type': 'application/json'
        };
        const waUrl = 'https://graph.facebook.com/v22.0/' + process.env.WHATSAPP_PHONE_ID + '/messages';

        // Intento 1: lista_espera_v2 (1 variable: nombre)
        let waRes = await fetch(waUrl, { method: 'POST', headers: waHeaders,
          body: waBody('lista_espera_v2', [{ type: 'text', text: nombre.trim() }])
        });
        let waData = await waRes.json().catch(() => ({}));

        // Fallback: si lista_espera_v2 falla, intentar bienvenida_preventa_v2
        if (!waRes.ok) {
          console.error('WA lista_espera_v2 falló:', waRes.status, JSON.stringify(waData), '— intentando fallback');
          waRes = await fetch(waUrl, { method: 'POST', headers: waHeaders,
            body: waBody('bienvenida_preventa_v2', [
              { type: 'text', text: nombre.trim() },
              { type: 'text', text: apellido.trim() }
            ])
          });
          waData = await waRes.json().catch(() => ({}));
        }

        if (waRes.ok) {
          console.log('WA OK:', JSON.stringify(waData));
          supabase.from('wa_send_log').insert({ reserva_id: String(reservaId) }).then(() => {}).catch(() => {});
        } else {
          console.error('WA ERROR (ambos templates fallaron):', waRes.status, JSON.stringify(waData));
        }
      } catch (e) {
        console.error('WA exception:', e.message);
      }
    }

    // WA interno (best-effort, independiente del envío al cliente)
    try {
      const notifyPhone = process.env.NOTIFY_PHONE;
      if (notifyPhone) {
        const waIntRes = await fetch(
          'https://graph.facebook.com/v22.0/' + process.env.WHATSAPP_PHONE_ID + '/messages',
          {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + process.env.WHATSAPP_TOKEN,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: notifyPhone,
              type: 'template',
              template: {
                name: 'aviso_reserva_interno',
                language: { code: 'es_AR' },
                components: [{ type: 'body', parameters: [
                  { type: 'text', text: nombre.trim() },
                  { type: 'text', text: apellido.trim() },
                  { type: 'text', text: tel.ok ? tel.numero : whatsapp.trim() },
                  { type: 'text', text: caja.trim() }
                ]}]
              }
            })
          }
        );
        const waIntData = await waIntRes.json().catch(() => ({}));
        console.log('AVISO INTERNO WA:', JSON.stringify(waIntData));
      }
    } catch (e) {
      console.error('AVISO INTERNO WA fallo:', e.message);
    }

    // Email (best-effort)
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const dest = process.env.NOTIFICATION_EMAIL || 'info@bankz.ar';
      await resend.emails.send({
        from: 'Bankz Preventa <avisos@notificaciones.bankz.ar>',
        to: [dest],
        reply_to: 'info@bankz.ar',
        subject: 'Nuevo registro #' + reservaId + ': ' + nombre.trim(),
        html: '<p><b>' + nombre.trim() + ' ' + apellido.trim() + '</b> | ' + email.trim() + ' | WA: ' + whatsapp.trim() + ' (' + (tel.ok ? tel.numero : 'invalido') + ') | Caja: ' + caja.trim() + ' | Reserva #' + reservaId + '</p>'
      });
      const cajaVal = caja.trim();
      const esCaja = cajaVal.startsWith('BKZ');
      const detailLabel = esCaja ? 'CAJA' : 'CONSULTA';
      const clientHtml = '<!DOCTYPE html><html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>Bankz</title><!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]--><style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}a{color:#F9F9F9}@media only screen and (max-width:600px){.bkz-container{width:100%!important}.bkz-pad{padding-left:26px!important;padding-right:26px!important}.bkz-h1{font-size:26px!important;line-height:1.25!important}}</style></head><body style="margin:0;padding:0;width:100%;background-color:#05090A;"><div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#05090A;opacity:0;">Quedaste en la lista de espera de Bankz – te contactamos pronto.&nbsp;&nbsp;&nbsp;</div><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#05090A;"><tr><td align="center" style="padding:32px 12px 48px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="bkz-container" style="width:600px;max-width:600px;background-color:#080D0F;border:1px solid rgba(249,249,249,0.10);border-radius:2px;"><tr><td class="bkz-pad" style="padding:30px 44px;border-bottom:1px solid rgba(249,249,249,0.08);"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;letter-spacing:-0.3px;color:#F9F9F9;line-height:1;">Bankz</td><td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:rgba(249,249,249,0.42);">Cajas de seguridad</td></tr></table></td></tr><tr><td class="bkz-pad" style="padding:52px 44px 12px;"><p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:rgba(249,249,249,0.40);">APERTURA OFICIAL</p><h1 class="bkz-h1" style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:32px;line-height:1.2;font-weight:bold;letter-spacing:-0.5px;color:#F9F9F9;">¡Quedaste en la lista de espera!</h1><p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#C6CACC;">Hola ' + nombre.trim() + ', gracias por sumarte a Bankz, la primera bóveda privada de Bahía Blanca.</p><p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#C6CACC;">Te vamos a contactar por WhatsApp desde nuestro número de atención para coordinar tu visita.</p></td></tr><tr><td class="bkz-pad" style="padding:8px 44px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid rgba(249,249,249,0.10);border-radius:2px;"><tr><td style="padding:16px 22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:rgba(249,249,249,0.42);">' + detailLabel + '</td><td align="right" style="padding:16px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#F9F9F9;">' + cajaVal + '</td></tr></table></td></tr><tr><td class="bkz-pad" style="padding:32px 44px 4px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#F9F9F9" style="border-radius:2px;"><a href="https://bankz.ar" target="_blank" style="display:inline-block;padding:15px 34px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.5px;color:#05090A;text-decoration:none;border-radius:2px;">CONOCÉ MÁS EN BANKZ.AR</a></td></tr></table></td></tr><tr><td class="bkz-pad" style="padding:32px 44px 48px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7;color:#C6CACC;">Nos vemos pronto,<br><span style="color:#F9F9F9;">Equipo Bankz</span></p></td></tr><tr><td class="bkz-pad" style="padding:30px 44px 34px;background-color:#05090A;border-top:1px solid rgba(249,249,249,0.10);"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;letter-spacing:-0.3px;color:#F9F9F9;padding-bottom:14px;">Bankz</td></tr><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.8;color:rgba(249,249,249,0.55);">San Martín 133, Bahía Blanca<br>Tel. 291 448-5665<br><a href="https://instagram.com/bankzarg" target="_blank" style="color:rgba(249,249,249,0.55);text-decoration:none;">@bankzarg</a>&nbsp;·&nbsp;<a href="https://bankz.ar" target="_blank" style="color:rgba(249,249,249,0.55);text-decoration:none;">bankz.ar</a></td></tr><tr><td style="padding-top:20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:rgba(249,249,249,0.32);">Recibís este mail porque te anotaste en la lista de espera de Bankz. <a href="https://bankz.ar/privacidad" target="_blank" style="color:rgba(249,249,249,0.5);text-decoration:underline;">Política de privacidad</a>.</td></tr></table></td></tr></table></td></tr></table></body></html>';
      const clientText = 'APERTURA OFICIAL\n\n¡Quedaste en la lista de espera!\n\nHola ' + nombre.trim() + ', gracias por sumarte a Bankz, la primera bóveda privada de Bahía Blanca.\n\n' + detailLabel + ': ' + cajaVal + '\n\nTe vamos a contactar por WhatsApp desde nuestro número de atención para coordinar tu visita.\n\nNos vemos pronto,\nEquipo Bankz\n\n---\nBankz · San Martín 133, Bahía Blanca · Tel. 291 448-5665 · @bankzarg · bankz.ar';
      await resend.emails.send({
        from: 'Bankz <preventa@notificaciones.bankz.ar>',
        to: [email.trim()],
        reply_to: 'info@bankz.ar',
        subject: '¡Quedaste en la lista de espera de Bankz!',
        html: clientHtml,
        text: clientText
      });
    } catch (e) {
      console.error('Email error (ignorado):', e.message);
    }

    return res.status(200).json({ success: true, id: reservaId });

  } catch (err) {
    console.error('UNHANDLED ERROR:', err.message, err.stack);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};