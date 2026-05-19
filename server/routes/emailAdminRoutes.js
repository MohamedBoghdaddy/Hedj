import express from "express";
import { verifyAdmin } from "../middleware/AuthMiddleware.js";
import {
  getEmailOutboxById,
  listEmailOutbox,
  getEmailLogs,
} from "../services/emailOutboxService.js";
import { isSupabaseConfigured } from "../config/supabase.js";
import { deliverEmail, isEmailProviderConfigured } from "../services/emailDeliveryService.js";

const router = express.Router();

const supabaseMissing = (res) =>
  res.status(503).json({ success: false, message: "Supabase email outbox is not configured." });

// ─── GET /api/admin/emails/outbox ─────────────────────────────────────────────────
// Query params: status, toEmail, relatedEntityType, dateFrom, dateTo
router.get("/outbox", verifyAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return supabaseMissing(res);

  try {
    const { status, toEmail, relatedEntityType, dateFrom, dateTo, page, limit } = req.query;
    const result = await listEmailOutbox({
      status,
      toEmail,
      relatedEntityType,
      dateFrom,
      dateTo,
      page,
      limit,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/emails/outbox/:id/logs ────────────────────────────────────────
router.get("/outbox/:id/logs", verifyAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return supabaseMissing(res);

  try {
    const logs = await getEmailLogs(req.params.id);
    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/outbox/:id/send", verifyAdmin, async (req, res) => {
  if (!isSupabaseConfigured()) return supabaseMissing(res);
  if (!isEmailProviderConfigured()) {
    return res.status(503).json({
      success: false,
      status: "provider_not_configured",
      message: "Email delivery provider is not configured.",
    });
  }

  try {
    const outboxRow = await getEmailOutboxById(req.params.id);
    if (!outboxRow) {
      return res.status(404).json({ success: false, message: "Outbox email not found." });
    }
    if (!["pending", "failed"].includes(outboxRow.status)) {
      return res.status(409).json({
        success: false,
        message: "Only pending or failed emails can be sent.",
      });
    }

    const result = await deliverEmail(outboxRow);
    return res.status(result.status === "sent" ? 200 : 502).json({ success: result.status === "sent", ...result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;
