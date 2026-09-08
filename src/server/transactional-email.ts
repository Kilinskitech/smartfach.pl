import "server-only";
import nodemailer from "nodemailer";

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASSWORD && [465, 587].includes(Number(process.env.SMTP_PORT || 465)));
}

export async function sendContractEmail(input: { recipient: string; body: string; sessionId: string; replyTo: string; subject?: string }) {
  if (!smtpConfigured()) throw new Error("Brak SMTP do wysyłki potwierdzenia umowy.");
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(), port, secure: port === 465, requireTLS: true,
    auth: { user: process.env.SMTP_USER!.trim(), pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
    disableFileAccess: true, disableUrlAccess: true,
  });
  const escape = (text: string) => text.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
  const heading = input.subject ?? "Twoje zamówienie i warunki korzystania — SmartFach";
  const intro = input.body.split("Twoje oświadczenia:")[0] ?? input.body;
  const result = await transport.sendMail({
    from: { name: "SmartFach", address: process.env.SMTP_USER!.trim() },
    to: input.recipient, replyTo: input.replyTo,
    messageId: `<contract-${input.sessionId}@smartfach.pl>`,
    subject: heading,
    text: input.body,
    html: `<html lang="pl"><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#172b3a"><table role="presentation" width="100%" cellspacing="0" cellpadding="24"><tr><td align="center"><table role="presentation" width="100%" style="max-width:620px;background:white;border-radius:20px" cellspacing="0" cellpadding="28"><tr><td style="background:#172b3a;color:white;font-size:24px;font-weight:bold">Smart<span style="color:#ffab70">Fach</span></td></tr><tr><td><h1 style="font-size:24px;line-height:1.3">${escape(heading)}</h1><div style="font-size:15px;line-height:1.7">${escape(intro).replace(/\n/g, "<br>")}</div><p style="font-size:14px;line-height:1.6">Pełną, niezmienną kopię potwierdzenia znajdziesz w załączniku do tej wiadomości. Zachowaj ją dla siebie.</p><p style="font-size:13px;color:#53666d">W razie pytań odpowiedz na tę wiadomość.</p></td></tr></table></td></tr></table></body></html>`,
    attachments: [{ filename: `smartfach-potwierdzenie-${input.sessionId.slice(-12)}.txt`, content: input.body, contentType: "text/plain; charset=utf-8" }],
  });
  if (!result.accepted.length) throw new Error("Serwer poczty nie przyjął potwierdzenia umowy.");
}
