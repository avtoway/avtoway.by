import nodemailer from "nodemailer";
import { ImapFlow } from "imapflow";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { decryptSecret } from "@/shared/lib/encryption";

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const db = getPrismaClient();
  const rows = await db.setting.findMany({
    where: {
      key: { in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from_name", "smtp_from_email"] },
    },
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  if (!map.smtp_host || !map.smtp_user || !map.smtp_pass || !map.smtp_from_email) return null;
  return {
    host: map.smtp_host,
    port: parseInt(map.smtp_port ?? "587"),
    user: map.smtp_user,
    pass: decryptSecret(map.smtp_pass),
    fromName: map.smtp_from_name ?? "АВТОWAY",
    fromEmail: map.smtp_from_email,
  };
}

async function getImapConfig(): Promise<{ host: string; port: number; user: string; pass: string } | null> {
  const db = getPrismaClient();
  const rows = await db.setting.findMany({
    where: { key: { in: ["imap_host", "imap_port", "imap_user", "imap_pass"] } },
  });
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  if (!map.imap_host || !map.imap_user || !map.imap_pass) return null;
  return {
    host: map.imap_host,
    port: parseInt(map.imap_port ?? "993"),
    user: map.imap_user,
    pass: decryptSecret(map.imap_pass),
  };
}

export async function sendEmail(to: string, subject: string, body: string, inReplyTo?: string): Promise<{ id: string; status: string; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) {
    const db = getPrismaClient();
    const entry = await db.sentEmail.create({
      data: { to, subject, body, inReplyTo: inReplyTo ?? null, status: "failed", error: "SMTP не настроен" },
    });
    return { id: entry.id, status: "failed", error: "SMTP не настроен" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
    });

    const mailOpts: any = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject,
      html: body,
    };
    if (inReplyTo) {
      mailOpts.inReplyTo = inReplyTo;
      mailOpts.references = inReplyTo;
    }

    await transporter.sendMail(mailOpts);

    const db = getPrismaClient();
    const entry = await db.sentEmail.create({
      data: { to, subject, body, inReplyTo: inReplyTo ?? null, status: "sent" },
    });
    return { id: entry.id, status: "sent" };
  } catch (err) {
    const errorMsg = (err as Error).message;
    const db = getPrismaClient();
    const entry = await db.sentEmail.create({
      data: { to, subject, body, inReplyTo: inReplyTo ?? null, status: "failed", error: errorMsg },
    });
    return { id: entry.id, status: "failed", error: errorMsg };
  }
}

export async function fetchInboxEmails(): Promise<{ count: number; error?: string }> {
  const config = await getImapConfig();
  if (!config) return { count: 0, error: "IMAP не настроен" };

  const db = getPrismaClient();

  try {
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: true,
      auth: { user: config.user, pass: config.pass },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    let inserted = 0;
    try {
      const existingIds = new Set(
        (await db.inboxEmail.findMany({ select: { messageId: true }, where: { messageId: { not: null } } }))
          .map(e => e.messageId!)
      );

      for await (const msg of client.fetch("1:*", { envelope: true, source: true })) {
        const envelope = msg.envelope;
        if (!envelope) continue;
        const messageId = (envelope as any).messageId as string | undefined;
        if (messageId && existingIds.has(messageId)) continue;

        const from = envelope.from?.[0];
        const to = envelope.to?.[0];
        const fromAddr = from ? `${from.name ?? ""} <${from.address}>`.trim() : "";
        const toAddr = to ? `${to.name ?? ""} <${to.address}>`.trim() : "";
        const subject = envelope.subject ?? "";
        const rawSource = msg.source ? Buffer.from(msg.source).toString("utf-8") : "";
        const date = envelope.date ? new Date(envelope.date) : new Date();

        let htmlBody = "";
        let textBody = "";

        if (rawSource) {
          const htmlMatch = /Content-Type:\s*text\/html[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n--|$)/i.exec(rawSource);
          if (htmlMatch?.[1]) {
            htmlBody = htmlMatch[1].trim();
          } else {
            htmlBody = rawSource;
          }
          const textMatch = /Content-Type:\s*text\/plain[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n--|$)/i.exec(rawSource);
          if (textMatch?.[1]) {
            textBody = textMatch[1].trim();
          }
        }

        if (!fromAddr) continue;

        await db.inboxEmail.create({
          data: {
            messageId: messageId ?? null,
            from: fromAddr,
            to: toAddr,
            subject,
            body: htmlBody || textBody || rawSource || "",
            textBody: textBody || null,
            receivedAt: date,
          },
        });
        inserted++;
      }
    } finally {
      lock.release();
      await client.logout();
    }
    return { count: inserted };
  } catch (err) {
    return { count: 0, error: (err as Error).message };
  }
}
