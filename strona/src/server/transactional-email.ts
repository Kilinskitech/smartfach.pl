import "server-only";
import nodemailer from "nodemailer";

export function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASSWORD && [465, 587].includes(Number(process.env.SMTP_PORT || 465)));
}

function createSmtpTransport() {
  if (!smtpConfigured()) throw new Error("Brak SMTP do wysyłki potwierdzenia umowy.");
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(), port, secure: port === 465, requireTLS: true,
    auth: { user: process.env.SMTP_USER!.trim(), pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
    disableFileAccess: true, disableUrlAccess: true,
  });
}

async function sendWithDeadline(transport: ReturnType<typeof createSmtpTransport>, message: Parameters<ReturnType<typeof createSmtpTransport>["sendMail"]>[0]) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      transport.sendMail(message),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("SMTP delivery timed out")), 45_000);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
    transport.close();
  }
}

export async function sendContractEmail(input: { recipient: string; body: string; sessionId: string; replyTo: string; subject?: string }) {
  const transport = createSmtpTransport();
  const escape = (text: string) => text.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
  const heading = input.subject ?? "Twoje zamówienie i warunki korzystania — SmartFach";
  const intro = input.body.split("Twoje oświadczenia:")[0] ?? input.body;
  const result = await sendWithDeadline(transport, {
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

export async function sendSmtpTest(input: {
  recipient: string;
  replyTo?: string;
}) {
  const transport = createSmtpTransport();
  const result = await sendWithDeadline(transport, {
    from: { name: "SmartFach", address: process.env.SMTP_USER!.trim() },
    to: input.recipient,
    replyTo: input.replyTo,
    messageId: `<smtp-test-${Date.now()}@smartfach.pl>`,
    subject: "Test poczty transakcyjnej — SmartFach",
    text: [
      "Poczta transakcyjna SmartFach działa.",
      "",
      "Ta wiadomość została wysłana ręcznie z panelu administratora.",
      "Potwierdzenia zamówień są wysyłane osobno po ukończeniu Stripe Checkout i poprawnym przetworzeniu webhooka.",
    ].join("\n"),
    html: `<html lang="pl"><body style="margin:0;background:#f5f5f0;font-family:Arial,sans-serif;color:#172b3a"><table role="presentation" width="100%" cellspacing="0" cellpadding="24"><tr><td align="center"><table role="presentation" width="100%" style="max-width:620px;background:white;border-radius:20px" cellspacing="0" cellpadding="28"><tr><td style="background:#172b3a;color:white;font-size:24px;font-weight:bold">Smart<span style="color:#ffab70">Fach</span></td></tr><tr><td><h1 style="font-size:24px;line-height:1.3">Poczta transakcyjna działa</h1><p style="font-size:15px;line-height:1.7">Ta wiadomość została wysłana ręcznie z panelu administratora SmartFach.</p><p style="font-size:14px;line-height:1.6;color:#53666d">Potwierdzenia zamówień są wysyłane osobno po ukończeniu Stripe Checkout i poprawnym przetworzeniu webhooka.</p></td></tr></table></td></tr></table></body></html>`,
  });
  if (!result.accepted.length)
    throw new Error("Serwer poczty nie przyjął wiadomości testowej.");
}
