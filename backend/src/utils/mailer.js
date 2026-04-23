import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } =
    process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'smtp.gmail.com',
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn('[mailer] SMTP not configured — logging email instead');
    console.log({ to, subject, text: text || html?.slice?.(0, 200) });
    return { skipped: true };
  }
  await t.sendMail({
    from: process.env.EMAIL_FROM || 'MediSync <noreply@medisync.local>',
    to,
    subject,
    text,
    html,
  });
  return { sent: true };
}
