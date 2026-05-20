import express from "express";
import { isAuthenticated, requirePermission } from "../middleware/AuthMiddleware.js";
import {
  createLead,
  createQuote,
  deleteLead,
  downloadQuotePdf,
  getLead,
  getQuote,
  listLeads,
  listQuotes,
  sendQuote,
  updateLead,
  updateLeadStatus,
  updateQuote,
  updateQuoteStatus,
} from "../controller/adminLeadController.js";

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.use(isAuthenticated);

// ── Leads ──────────────────────────────────────────────────────────────────────
router.get("/leads",             requirePermission("leads.view"),   asyncRoute(listLeads));
router.post("/leads",            requirePermission("leads.create"), asyncRoute(createLead));
router.get("/leads/:id",         requirePermission("leads.view"),   asyncRoute(getLead));
router.put("/leads/:id",         requirePermission("leads.update"), asyncRoute(updateLead));
router.patch("/leads/:id/status",requirePermission("leads.update"), asyncRoute(updateLeadStatus));
router.delete("/leads/:id",      requirePermission("leads.view"),   asyncRoute(deleteLead));

// ── Quotes ─────────────────────────────────────────────────────────────────────
router.get("/quotes",            requirePermission("quotes.view"),      asyncRoute(listQuotes));
router.post("/quotes",           requirePermission("quotes.create"),    asyncRoute(createQuote));
router.get("/quotes/:id",        requirePermission("quotes.view"),      asyncRoute(getQuote));
router.put("/quotes/:id",        requirePermission("quotes.update"),    asyncRoute(updateQuote));
router.patch("/quotes/:id/status",requirePermission("quotes.update"),   asyncRoute(updateQuoteStatus));
router.post("/quotes/:id/send",  requirePermission("quotes.sendEmail"), asyncRoute(sendQuote));
router.get("/quotes/:id/pdf",    requirePermission("quotes.view"),      asyncRoute(downloadQuotePdf));

export default router;
