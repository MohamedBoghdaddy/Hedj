import { supabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";

const requireSupabase = () => {
  if (!isSupabaseConfigured()) {
    throw Object.assign(
      new Error("Supabase email outbox is not configured."),
      { statusCode: 503 }
    );
  }
};

// ─── Log helper ──────────────────────────────────────────────────────────────────

const redactPayload = (payload = {}) => {
  const text = JSON.stringify(payload);
  if (/token|password|secret|authorization|api[_-]?key/i.test(text)) {
    return { redacted: true };
  }
  return payload;
};

const logEvent = async (outboxId, eventType, payload = {}) => {
  if (!isSupabaseConfigured() || !outboxId) return;
  await supabaseAdmin.from("email_logs").insert({
    outbox_id: outboxId,
    event_type: eventType,
    payload: redactPayload(payload),
  });
};

// ─── Public API ───────────────────────────────────────────────────────────────────

/**
 * Queue a new email in Supabase email_outbox.
 * Returns the created outbox row.
 */
export const queueEmail = async ({
  toEmail,
  toName,
  subject,
  bodyHtml,
  bodyText,
  templateKey,
  templateVariables = {},
  relatedEntityType,
  relatedEntityId,
  mongoUserId,
}) => {
  requireSupabase();

  const fromEmail =
    process.env.EMAIL_FROM_ADDRESS || "noreply@hedjcommerce.com";
  const fromName = process.env.EMAIL_FROM_NAME || "Hedj Commerce";
  const displayFrom = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

  const { data, error } = await supabaseAdmin
    .from("email_outbox")
    .insert({
      mongo_user_id: mongoUserId || null,
      related_entity_type: relatedEntityType || null,
      related_entity_id: relatedEntityId || null,
      to_email: toEmail,
      to_name: toName || null,
      from_email: displayFrom,
      subject,
      body_html: bodyHtml || null,
      body_text: bodyText || null,
      template_key: templateKey || null,
      template_variables: templateVariables,
      status: "pending",
      scheduled_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw Object.assign(
      new Error(`Failed to queue email: ${error.message}`),
      { statusCode: 502 }
    );
  }

  await logEvent(data.id, "created", { toEmail, subject });
  return data;
};

/**
 * Mark an outbox entry as "sending" and increment attempts counter.
 */
export const markEmailSending = async (outboxId) => {
  requireSupabase();
  if (!outboxId) return null;

  // Read current attempts count first so we can increment it safely.
  const { data: current } = await supabaseAdmin
    .from("email_outbox")
    .select("attempts")
    .eq("id", outboxId)
    .single();

  const nextAttempts = (current?.attempts ?? 0) + 1;

  const { data } = await supabaseAdmin
    .from("email_outbox")
    .update({ status: "sending", attempts: nextAttempts })
    .eq("id", outboxId)
    .in("status", ["pending", "failed"])
    .select()
    .single();

  if (!data) {
    throw Object.assign(new Error("Email is already being sent or is not retryable."), {
      statusCode: 409,
    });
  }

  await logEvent(outboxId, "sending", { attempt: nextAttempts });
  return data;
};

/**
 * Mark an outbox entry as successfully sent.
 */
export const markEmailSent = async (outboxId, providerMessageId) => {
  requireSupabase();
  if (!outboxId) return null;
  const { data } = await supabaseAdmin
    .from("email_outbox")
    .update({
      status: "sent",
      provider_message_id: providerMessageId || null,
      sent_at: new Date().toISOString(),
    })
    .eq("id", outboxId)
    .select()
    .single();

  await logEvent(outboxId, "sent", { providerMessageId });
  return data;
};

/**
 * Mark an outbox entry as failed.
 */
export const markEmailFailed = async (outboxId, errorMessage) => {
  requireSupabase();
  if (!outboxId) return null;
  const { data } = await supabaseAdmin
    .from("email_outbox")
    .update({ status: "failed", error_message: errorMessage || "Unknown error" })
    .eq("id", outboxId)
    .select()
    .single();

  await logEvent(outboxId, "failed", {
    errorMessage: String(errorMessage || "Unknown error").slice(0, 1000),
  });
  return data;
};

/**
 * List outbox records with optional filters.
 * Supported filters: status, toEmail, relatedEntityType, dateFrom, dateTo
 */
export const listEmailOutbox = async (filters = {}) => {
  requireSupabase();
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 50));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from("email_outbox")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.toEmail) query = query.ilike("to_email", `%${filters.toEmail}%`);
  if (filters.relatedEntityType)
    query = query.eq("related_entity_type", filters.relatedEntityType);
  if (filters.dateFrom)
    query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo)
    query = query.lte("created_at", filters.dateTo);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to list email outbox: ${error.message}`);
  return { count: data.length, total: count || 0, page, limit, outbox: data };
};

export const getEmailOutboxById = async (outboxId) => {
  requireSupabase();

  const { data, error } = await supabaseAdmin
    .from("email_outbox")
    .select("*")
    .eq("id", outboxId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to get email outbox row: ${error.message}`);
  }
  return data;
};

/**
 * Get email_logs for a specific outbox entry.
 */
export const getEmailLogs = async (outboxId) => {
  requireSupabase();

  const { data, error } = await supabaseAdmin
    .from("email_logs")
    .select("*")
    .eq("outbox_id", outboxId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to get email logs: ${error.message}`);
  return data;
};

export const writeEmailLog = async ({ outboxId, eventType, payload }) => {
  requireSupabase();
  await logEvent(outboxId, eventType, payload);
};
