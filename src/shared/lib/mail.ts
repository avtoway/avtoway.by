import nodemailer, { type SendMailOptions } from "nodemailer";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
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

    const mailOpts: SendMailOptions = {
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

/** Сколько последних писем просматривать за одно обновление. */
const MAX_SCAN = 100;

export async function fetchInboxEmails(): Promise<{ count: number; error?: string }> {
  const config = await getImapConfig();
  if (!config) return { count: 0, error: "IMAP не настроен" };

  const db = getPrismaClient();

  try {
    const client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.port === 993,
      auth: { user: config.user, pass: config.pass },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    let inserted = 0;
    try {
      const total = client.mailbox && typeof client.mailbox === "object" ? client.mailbox.exists : 0;
      if (total <= 0) return { count: 0 };

      // Смотрим только последние письма, а не весь ящик: экономит память и время.
      const start = Math.max(1, total - MAX_SCAN + 1);
      const existingIds = new Set(
        (await db.inboxEmail.findMany({ select: { messageId: true }, where: { messageId: { not: null } } }))
          .map(e => e.messageId!),
      );

      for await (const msg of client.fetch(`${start}:*`, { envelope: true, source: true })) {
        const envelope = msg.envelope;
        if (!envelope || !msg.source) continue;

        const messageId = envelope.messageId ?? undefined;
        if (messageId && existingIds.has(messageId)) continue;

        // Полноценный MIME-парсер: base64, quoted-printable, кодировки, multipart.
        const parsed = await simpleParser(Buffer.from(msg.source));

        const from = parsed.from?.text
          ?? (envelope.from?.[0]
            ? `${envelope.from[0].name ?? ""} <${envelope.from[0].address}>`.trim()
            : "");
        if (!from) continue;

        const to = Array.isArray(parsed.to)
          ? parsed.to.map(item => item.text).join(", ")
          : parsed.to?.text ?? (envelope.to?.[0]
            ? `${envelope.to[0].name ?? ""} <${envelope.to[0].address}>`.trim()
            : "");

        const html = typeof parsed.html === "string" ? parsed.html : "";
        const text = parsed.text ?? "";
        const receivedAt = parsed.date
          ?? (envelope.date ? new Date(envelope.date) : new Date());

        await db.inboxEmail.create({
          data: {
            messageId: messageId ?? null,
            from,
            to,
            subject: parsed.subject ?? envelope.subject ?? "",
            body: html || text || "",
            textBody: text || null,
            receivedAt,
          },
        });
        if (messageId) existingIds.add(messageId);
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
