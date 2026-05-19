import express from "express";
import { verifyAdmin } from "../middleware/AuthMiddleware.js";
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

router.use(verifyAdmin);

router.get("/leads", asyncRoute(listLeads));
router.post("/leads", asyncRoute(createLead));
router.get("/leads/:id", asyncRoute(getLead));
router.put("/leads/:id", asyncRoute(updateLead));
router.patch("/leads/:id/status", asyncRoute(updateLeadStatus));
router.delete("/leads/:id", asyncRoute(deleteLead));

router.get("/quotes", asyncRoute(listQuotes));
router.post("/quotes", asyncRoute(createQuote));
router.get("/quotes/:id", asyncRoute(getQuote));
router.put("/quotes/:id", asyncRoute(updateQuote));
router.patch("/quotes/:id/status", asyncRoute(updateQuoteStatus));
router.post("/quotes/:id/send", asyncRoute(sendQuote));
router.get("/quotes/:id/pdf", asyncRoute(downloadQuotePdf));

export default router;
