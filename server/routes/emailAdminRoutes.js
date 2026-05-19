import express from "express";
import { verifyAdminOrEmployee } from "../middleware/AuthMiddleware.js";
import {
  listEmailOutbox,
  getEmailLogs,
} from "../services/emailOutboxService.js";
import { isSupabaseConfigured } from "../config/supabase.js";

const router = express.Router();

const supabaseMissing = (res) =>
  res.status(503).json({ success: false, message: "Supabase email outbox is not configured." });

// ─── GET /api/admin/emails/outbox ─────────────────────────────────────────────────
// Query params: status, toEmail, relatedEntityType, dateFrom, dateTo
router.get("/outbox", verifyAdminOrEmployee, async (req, res) => {
  if (!isSupabaseConfigured()) return supabaseMissing(res);

  try {
    const { status, toEmail, relatedEntityType, dateFrom, dateTo } = req.query;
    const rows = await listEmailOutbox({ status, toEmail, relatedEntityType, dateFrom, dateTo });
    return res.status(200).json({ success: true, count: rows.length, outbox: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/admin/emails/outbox/:id/logs ────────────────────────────────────────
router.get("/outbox/:id/logs", verifyAdminOrEmployee, async (req, res) => {
  if (!isSupabaseConfigured()) return supabaseMissing(res);

  try {
    const logs = await getEmailLogs(req.params.id);
    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
