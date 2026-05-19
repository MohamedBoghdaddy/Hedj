import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Lead from "../model/Lead.js";
import Quote from "../model/Quote.js";
import { isSupabaseConfigured } from "../config/supabase.js";
import { deliverEmail } from "../services/emailDeliveryService.js";
import { queueEmail } from "../services/emailOutboxService.js";

const leadStatuses = ["new", "contacted", "qualified", "proposal", "won", "lost", "archived"];
const priorities = ["low", "medium", "high", "urgent"];
const quoteStatuses = ["draft", "pending", "sent", "accepted", "rejected", "expired", "converted", "cancelled"];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const clean = (value) => (typeof value === "string" ? value.trim() : value);
const parseAmount = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const leadPayload = (body) => {
  const payload = {};
  [
    "name",
    "email",
    "phone",
    "company",
    "projectType",
    "source",
    "status",
    "priority",
    "notes",
  ].forEach((field) => {
    if (body[field] !== undefined) payload[field] = clean(body[field]);
  });

  if (payload.email) payload.email = payload.email.toLowerCase();
  if (body.estimatedValue !== undefined || body.budget !== undefined) {
    payload.estimatedValue = parseAmount(body.estimatedValue ?? body.budget);
  }
  if (Array.isArray(body.tags)) payload.tags = body.tags.map(clean).filter(Boolean);
  else if (typeof body.tags === "string") {
    payload.tags = body.tags.split(",").map(clean).filter(Boolean);
  }
  if (body.assignedTo && isValidId(body.assignedTo)) payload.assignedTo = body.assignedTo;
  if (body.convertedCustomerId && isValidId(body.convertedCustomerId)) {
    payload.convertedCustomerId = body.convertedCustomerId;
  }

  return payload;
};

const validateLead = (payload, { partial = false } = {}) => {
  if (!partial) {
    const missing = ["name", "email"].filter((field) => !payload[field]);
    if (missing.length) return `${missing.join(", ")} required.`;
  }
  if (payload.email && !isValidEmail(payload.email)) return "A valid lead email is required.";
  if (payload.status && !leadStatuses.includes(payload.status)) return "Invalid lead status.";
  if (payload.priority && !priorities.includes(payload.priority)) return "Invalid lead priority.";
  if (
    payload.estimatedValue !== undefined &&
    (!Number.isFinite(payload.estimatedValue) || payload.estimatedValue < 0)
  ) {
    return "Estimated value must be a non-negative number.";
  }
  return null;
};

const quotePayload = (body) => {
  const payload = {};
  ["customerName", "customerEmail", "project", "status", "notes"].forEach((field) => {
    if (body[field] !== undefined) payload[field] = clean(body[field]);
  });
  if (payload.customerEmail) payload.customerEmail = payload.customerEmail.toLowerCase();
  if (body.leadId && isValidId(body.leadId)) payload.leadId = body.leadId;
  if (body.customerId && isValidId(body.customerId)) payload.customerId = body.customerId;
  if (body.validUntil) payload.validUntil = new Date(body.validUntil);
  if (body.discount !== undefined) payload.discount = parseAmount(body.discount, 0);
  if (body.tax !== undefined) payload.tax = parseAmount(body.tax, 0);
  if (body.items !== undefined || body.amount !== undefined) {
    payload.items = normalizeItems(body.items, body.amount);
  }
  return payload;
};

const normalizeItems = (items, fallbackAmount = 0) => {
  if (!Array.isArray(items) || items.length === 0) {
    const amount = Math.max(0, parseAmount(fallbackAmount, 0));
    return [
      {
        name: "Custom Hedj scope",
        description: "",
        quantity: 1,
        unitPrice: amount,
        total: amount,
      },
    ];
  }

  return items
    .map((item) => {
      if (typeof item === "string") {
        return { name: item.trim(), description: "", quantity: 1, unitPrice: 0, total: 0 };
      }
      const quantity = Math.max(1, parseAmount(item.quantity, 1));
      const unitPrice = Math.max(0, parseAmount(item.unitPrice ?? item.price, 0));
      return {
        name: clean(item.name) || "Custom item",
        description: clean(item.description) || "",
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      };
    })
    .filter((item) => item.name);
};

const calculateQuoteTotals = (payload) => {
  const items = normalizeItems(payload.items);
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = Math.max(0, parseAmount(payload.discount, 0));
  const tax = Math.max(0, parseAmount(payload.tax, 0));
  const total = Math.max(0, subtotal - discount + tax);
  return { ...payload, items, subtotal, discount, tax, total };
};

const validateQuote = (payload, { partial = false } = {}) => {
  if (!partial && !payload.customerName && !payload.customerEmail && !payload.leadId) {
    return "A customer name, customer email, or lead is required.";
  }
  if (payload.customerEmail && !isValidEmail(payload.customerEmail)) return "A valid quote email is required.";
  if (payload.status && !quoteStatuses.includes(payload.status)) return "Invalid quote status.";
  if (!Array.isArray(payload.items) || payload.items.length === 0) return "At least one quote item is required.";
  if (payload.items.some((item) => !item.name || item.quantity < 1 || item.unitPrice < 0)) {
    return "Quote items must include a name, positive quantity, and non-negative unit price.";
  }
  return null;
};

const nextQuoteNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `HJ-Q-${year}-`;
  const count = await Quote.countDocuments({
    quoteNumber: new RegExp(`^${prefix}`),
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

const resolveQuoteRecipient = async (quote) => {
  if (quote.customerEmail) return { email: quote.customerEmail, name: quote.customerName };
  if (quote.leadId) {
    const lead = await Lead.findById(quote.leadId);
    if (lead?.email) return { email: lead.email, name: lead.name };
  }
  return null;
};

export const listLeads = async (req, res) => {
  const { status, q, page = 1, limit = 100 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (q) {
    filter.$or = [
      { name: new RegExp(String(q), "i") },
      { email: new RegExp(String(q), "i") },
      { company: new RegExp(String(q), "i") },
      { projectType: new RegExp(String(q), "i") },
    ];
  }
  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(200, Math.max(1, Number(limit) || 100));
  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Lead.countDocuments(filter),
  ]);
  return res.json({ success: true, count: leads.length, total, leads });
};

export const getLead = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid lead id." });
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
  return res.json({ success: true, lead });
};

export const createLead = async (req, res) => {
  const payload = leadPayload(req.body);
  const validationError = validateLead(payload);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  if (req.user?._id) payload.createdBy = req.user._id;
  const lead = await Lead.create(payload);
  return res.status(201).json({ success: true, lead });
};

export const updateLead = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid lead id." });
  const payload = leadPayload(req.body);
  const validationError = validateLead(payload, { partial: true });
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  const lead = await Lead.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
  return res.json({ success: true, lead });
};

export const updateLeadStatus = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid lead id." });
  const { status } = req.body;
  if (!leadStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid lead status." });
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
  return res.json({ success: true, lead });
};

export const deleteLead = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid lead id." });
  const lead = await Lead.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true });
  if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
  return res.json({ success: true, lead, message: "Lead archived." });
};

export const listQuotes = async (req, res) => {
  const { status, page = 1, limit = 100 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(200, Math.max(1, Number(limit) || 100));
  const [quotes, total] = await Promise.all([
    Quote.find(filter)
      .populate("leadId", "name email company projectType")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Quote.countDocuments(filter),
  ]);
  return res.json({ success: true, count: quotes.length, total, quotes });
};

export const getQuote = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid quote id." });
  const quote = await Quote.findById(req.params.id).populate("leadId", "name email company projectType");
  if (!quote) return res.status(404).json({ success: false, message: "Quote not found." });
  return res.json({ success: true, quote });
};

export const createQuote = async (req, res) => {
  const rawPayload = quotePayload(req.body);
  const payload = calculateQuoteTotals({
    ...rawPayload,
    items: rawPayload.items || normalizeItems(req.body.items, req.body.amount),
  });
  const validationError = validateQuote(payload);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  if (req.user?._id) payload.createdBy = req.user._id;
  payload.quoteNumber = await nextQuoteNumber();
  const quote = await Quote.create(payload);
  return res.status(201).json({ success: true, quote });
};

export const updateQuote = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid quote id." });
  const existing = await Quote.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: "Quote not found." });

  const incoming = quotePayload(req.body);
  const payload = calculateQuoteTotals({ ...existing.toObject(), ...incoming });
  delete payload._id;
  delete payload.createdAt;
  delete payload.updatedAt;
  delete payload.__v;

  const validationError = validateQuote(payload, { partial: true });
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  const quote = await Quote.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  return res.json({ success: true, quote });
};

export const updateQuoteStatus = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid quote id." });
  const { status } = req.body;
  if (!quoteStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid quote status." });
  const quote = await Quote.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!quote) return res.status(404).json({ success: false, message: "Quote not found." });
  return res.json({ success: true, quote });
};

export const sendQuote = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid quote id." });
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      success: false,
      status: "supabase_not_configured",
      message: "Supabase email outbox is not configured.",
    });
  }

  const quote = await Quote.findById(req.params.id);
  if (!quote) return res.status(404).json({ success: false, message: "Quote not found." });
  const recipient = await resolveQuoteRecipient(quote);
  if (!recipient?.email) {
    return res.status(400).json({ success: false, message: "Quote recipient email is missing." });
  }

  const subject = `Hedj Commerce Quote ${quote.quoteNumber}`;
  const bodyText = [
    `Hello ${recipient.name || "there"},`,
    `Your quote ${quote.quoteNumber} is ready.`,
    `Total: ${money(quote.total)}`,
    quote.validUntil ? `Valid until: ${quote.validUntil.toDateString()}` : "",
    quote.notes || "",
  ].filter(Boolean).join("\n\n");
  const bodyHtml = `
    <h2>Quote ${quote.quoteNumber}</h2>
    <p>Hello ${recipient.name || "there"},</p>
    <p>Your Hedj Commerce quote is ready.</p>
    <p><strong>Total:</strong> ${money(quote.total)}</p>
    ${quote.validUntil ? `<p><strong>Valid until:</strong> ${quote.validUntil.toDateString()}</p>` : ""}
    ${quote.notes ? `<p>${quote.notes}</p>` : ""}
  `;

  const outboxRow = await queueEmail({
    toEmail: recipient.email,
    toName: recipient.name,
    subject,
    bodyHtml,
    bodyText,
    templateKey: "quote_send",
    templateVariables: { quoteNumber: quote.quoteNumber, total: quote.total },
    relatedEntityType: "quote",
    relatedEntityId: quote._id.toString(),
    mongoUserId: quote.customerId?.toString(),
  });

  const deliveryResult = await deliverEmail(outboxRow);
  const lastEmailStatus = deliveryResult.status === "sent" ? "sent" : deliveryResult.status === "failed" ? "failed" : "provider_not_configured";
  quote.emailOutboxId = outboxRow.id;
  quote.lastEmailStatus = lastEmailStatus;
  if (deliveryResult.status === "sent") quote.status = "sent";
  await quote.save();

  return res.status(200).json({
    success: true,
    status: lastEmailStatus,
    outboxId: outboxRow.id,
    quote,
    message: deliveryResult.message || `Quote email ${deliveryResult.status}.`,
  });
};

export const downloadQuotePdf = async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid quote id." });
  const quote = await Quote.findById(req.params.id).populate("leadId", "name email company projectType");
  if (!quote) return res.status(404).json({ success: false, message: "Quote not found." });

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const filename = `${quote.quoteNumber || "quote"}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  doc.pipe(res);

  doc.fontSize(22).text("Hedj Commerce", { align: "left" });
  doc.moveDown(0.4);
  doc.fontSize(16).text(`Quote ${quote.quoteNumber}`);
  doc.moveDown();
  doc.fontSize(10).text(`Customer: ${quote.customerName || quote.leadId?.name || "Not provided"}`);
  doc.text(`Email: ${quote.customerEmail || quote.leadId?.email || "Not provided"}`);
  doc.text(`Project: ${quote.project || quote.leadId?.projectType || "Custom Hedj project"}`);
  if (quote.validUntil) doc.text(`Valid until: ${quote.validUntil.toDateString()}`);
  doc.moveDown();

  doc.fontSize(12).text("Items", { underline: true });
  doc.moveDown(0.5);
  quote.items.forEach((item) => {
    doc.fontSize(10).text(`${item.quantity} x ${item.name} @ ${money(item.unitPrice)} = ${money(item.total)}`);
    if (item.description) doc.fontSize(9).fillColor("#555555").text(item.description).fillColor("#000000");
  });

  doc.moveDown();
  doc.fontSize(11).text(`Subtotal: ${money(quote.subtotal)}`, { align: "right" });
  doc.text(`Discount: ${money(quote.discount)}`, { align: "right" });
  doc.text(`Tax: ${money(quote.tax)}`, { align: "right" });
  doc.fontSize(14).text(`Total: ${money(quote.total)}`, { align: "right" });
  if (quote.notes) {
    doc.moveDown();
    doc.fontSize(11).text("Notes", { underline: true });
    doc.fontSize(10).text(quote.notes);
  }

  doc.end();
};
