const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { nombre, email, telefono, mensaje } = req.body;

    // ── Validación ──
    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // ── Insertar en Supabase ──
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error: dbError } = await supabase
      .from('consultas')
      .insert([{
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: (telefono || '').trim() || null,
        mensaje: (mensaje || '').trim() || null
      }])
      .select('id, created_at');

    if (dbError) {
      console.error('Supabase error:', dbError);
      return res.status(500).json({ error: 'Error al guardar la consulta' });
    }

    const consultaId = data?.[0]?.id || '—';
    const fechaHora = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

    // ── Emails via Resend ──
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const notificationEmail = process.env.NOTIFICATION_EMAIL || 'info@bankz.ar';

      // 1. Notificación interna a Bankz
      await resend.emails.send({
        from: 'Bankz Web <web@bankz.ar>',
        to: [notificationEmail],
        subject: `💬 Nueva consulta #${consultaId}: ${nombre.trim()}`,
        html: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0a0a0c;color:#f4f4f2;border-radius:16px;">
            <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#fff;">Nueva consulta desde la web</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);color:#8a8a90;font-size:13px;width:120px;">Nombre</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);color:#f4f4f2;font-size:15px;font-weight:600;">${nombre.trim()}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);color:#8a8a90;font-size:13px;">Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);color:#f4f4f2;font-size:15px;">${email.trim()}</td></tr>
              ${telefono ? `<tr><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);color:#8a8a90;font-size:13px;">Teléfono</td><td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,.1);color:#f4f4f2;font-size:15px;">${telefono.trim()}</td></tr>` : ''}
              ${mensaje ? `<tr><td style="padding:12px 0;color:#8a8a90;font-size:13px;vertical-align:top;">Mensaje</td><td style="padding:12px 0;color:#f4f4f2;font-size:15px;line-height:1.5;">${mensaje.trim().replace(/\n/g, '<br>')}</td></tr>` : ''}
            </table>
            <p style="margin:24px 0 0;font-size:12px;color:#6d6d73;">Consulta #${consultaId} · ${fechaHora}</p>
          </div>`
      });

      // 2. Confirmación al usuario
      await resend.emails.send({
        from: 'Bankz <web@bankz.ar>',
        to: [email.trim()],
        subject: 'Recibimos tu consulta · Bankz',
        html: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;">
            <div style="padding:40px 32px;background:#0a0a0c;color:#f4f4f2;border-radius:16px 16px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-.02em;">Recibimos tu consulta</h1>
              <p style="margin:16px 0 0;font-size:15px;color:#a6a6ac;line-height:1.5;">Hola <strong style="color:#f4f4f2;">${nombre.trim()}</strong>, te respondemos a la brevedad.</p>
            </div>
            <div style="padding:24px 32px;background:#111114;border-radius:0 0 16px 16px;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
              <p style="margin:0 0 16px;font-size:14px;color:#a6a6ac;line-height:1.5;">Si preferís, también podés escribirnos directo por WhatsApp:</p>
              <a href="https://wa.me/5492914137584?text=${encodeURIComponent('Hola Bankz, acabo de enviar una consulta desde la web. Mi nombre es ' + nombre.trim() + '.')}" style="display:inline-block;padding:14px 28px;background:#25D366;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:15px;">Escribinos por WhatsApp →</a>
            </div>
            <p style="margin:24px 0 0;text-align:center;font-size:12px;color:#6d6d73;">Bankz · Resguardo Patrimonial Privado · Bahía Blanca</p>
          </div>`
      });

    } catch (emailErr) {
      console.error('Resend error:', emailErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Consulta registrada correctamente',
      id: consultaId
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
