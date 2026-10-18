import "server-only";
import nodemailer from "nodemailer";
import { prisma } from "./db";
import { publish } from "./events";

let transport: nodemailer.Transporter | null | undefined;
function mailer() {
  if (transport !== undefined) return transport;
  transport = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      })
    : null;
  return transport;
}

/**
 * Create in-app notifications and (optionally) send email.
 * Emails only contain names/dates and a link, never plan contents or student information.
 */
export async function notify(
  users: Array<{ id: string; email: string }>,
  title: string,
  body: string,
  link?: string,
) {
  for (const u of users) {
    await prisma.notification.create({ data: { userId: u.id, title, body, link } });
    publish(`user:${u.id}`, { type: "notification" });
    const url = link ? `${process.env.APP_URL ?? "http://localhost:3000"}${link}` : undefined;
    const text = `${body}${url ? `\n\nOpen SubConnect: ${url}` : ""}`;
    const m = mailer();
    if (m) {
      m.sendMail({ from: process.env.SMTP_FROM, to: u.email, subject: `SubConnect: ${title}`, text }).catch((e) =>
        console.error("Email failed", e),
      );
    } else if (process.env.NODE_ENV !== "test") {
      console.log(`[email:dev] to=${u.email} subject="${title}"`);
    }
  }
}
