import { markEmailSending, markEmailSent, markEmailFailed } from "./emailOutboxService.js";

// ─── Provider detection ───────────────────────────────────────────────────────────

const detectProvider = () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  )
    return "smtp";
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SENDGRID_API_KEY) return "sendgrid";
  return null;
};

// ─── SMTP via nodemailer ──────────────────────────────────────────────────────────

const sendViaSMTP = async (outboxRow) => {
  const nodemailer = (await import("nodemailer")).default;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: outboxRow.from_email,
    to: outboxRow.to_name
      ? `${outboxRow.to_name} <${outboxRow.to_email}>`
      : outboxRow.to_email,
    subject: outboxRow.subject,
    html: outboxRow.body_html || undefined,
    text: outboxRow.body_text || undefined,
  });

  return info.messageId;
};

// ─── Resend ───────────────────────────────────────────────────────────────────────

const sendViaResend = async (outboxRow) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: outboxRow.from_email,
      to: [outboxRow.to_email],
      subject: outboxRow.subject,
      html: outboxRow.body_html || undefined,
      text: outboxRow.body_text || undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error ${response.status}: ${body}`);
  }

  const json = await response.json();
  return json.id;
};

// ─── SendGrid ────────────────────────────────────────────────────────────────────

const sendViaSendGrid = async (outboxRow) => {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: outboxRow.to_email, name: outboxRow.to_name || "" }] }],
      from: { email: process.env.EMAIL_FROM_ADDRESS || "noreply@hedjcommerce.com" },
      subject: outboxRow.subject,
      content: [
        ...(outboxRow.body_html
          ? [{ type: "text/html", value: outboxRow.body_html }]
          : []),
        ...(outboxRow.body_text
          ? [{ type: "text/plain", value: outboxRow.body_text }]
          : []),
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SendGrid API error ${response.status}: ${body}`);
  }

  return response.headers.get("X-Message-Id") || "sendgrid-no-id";
};

// ─── Main delivery entry point ────────────────────────────────────────────────────

/**
 * Attempt to deliver an outbox row.
 *
 * Returns:
 *  { status: "sent", providerMessageId }
 *  { status: "failed", error }
 *  { status: "queued", message }   ← when no provider is configured
 */
export const deliverEmail = async (outboxRow) => {
  const provider = detectProvider();

  if (!provider) {
    return {
      status: "queued",
      message:
        "Email queued. Delivery provider is not configured. " +
        "Set SMTP_*, RESEND_API_KEY, or SENDGRID_API_KEY to enable sending.",
    };
  }

  const outboxId = outboxRow.id;

  try {
    await markEmailSending(outboxId);

    let providerMessageId;

    switch (provider) {
      case "smtp":
        providerMessageId = await sendViaSMTP(outboxRow);
        break;
      case "resend":
        providerMessageId = await sendViaResend(outboxRow);
        break;
      case "sendgrid":
        providerMessageId = await sendViaSendGrid(outboxRow);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    await markEmailSent(outboxId, providerMessageId);
    return { status: "sent", providerMessageId, provider };
  } catch (err) {
    await markEmailFailed(outboxId, err.message);
    return { status: "failed", error: err.message, provider };
  }
};
