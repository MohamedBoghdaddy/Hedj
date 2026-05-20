import express from "express";
import SupportInquiry, {
  INQUIRY_SOURCES,
  SUPPORT_TYPES,
} from "../model/SupportInquiry.js";
import { verifyAdmin } from "../middleware/AuthMiddleware.js";

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanString = (value, maxLength = 5000) =>
  String(value || "")
    .trim()
    .slice(0, maxLength);

const createTicketNumber = () =>
  `HJ-SUP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const toPublicInquiry = (inquiry) => ({
  _id: inquiry._id,
  id: inquiry._id,
  ticketNumber: inquiry.ticketNumber,
  name: inquiry.name,
  email: inquiry.email,
  phone: inquiry.phone || "",
  type: inquiry.type,
  orderNumber: inquiry.orderNumber || "",
  message: inquiry.message,
  status: inquiry.status,
  source: inquiry.source,
  metadata: inquiry.metadata || {},
  createdAt: inquiry.createdAt,
  updatedAt: inquiry.updatedAt,
});

router.post("/", async (req, res, next) => {
  try {
    const name = cleanString(req.body.name, 160);
    const email = cleanString(req.body.email, 254).toLowerCase();
    const phone = cleanString(req.body.phone, 80);
    const type = cleanString(req.body.type, 80);
    const orderNumber = cleanString(req.body.orderNumber, 80);
    const message = cleanString(req.body.message, 5000);
    const source = cleanString(req.body.source, 80) || "support_portal";
    const metadata =
      req.body.metadata && typeof req.body.metadata === "object"
        ? req.body.metadata
        : {};

    const errors = {};
    if (!name) errors.name = "Full name is required.";
    if (!email) errors.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
    if (!type) errors.type = "Support type is required.";
    else if (!SUPPORT_TYPES.includes(type)) errors.type = "Choose a valid support type.";
    if (!message) errors.message = "Message is required.";
    if (!INQUIRY_SOURCES.includes(source)) errors.source = "Choose a valid inquiry source.";

    if (Object.keys(errors).length) {
      return res.status(400).json({
        success: false,
        message: "Please correct the highlighted fields.",
        errors,
      });
    }

    const inquiry = await SupportInquiry.create({
      ticketNumber: createTicketNumber(),
      name,
      email,
      phone,
      type,
      orderNumber,
      message,
      source,
      metadata,
    });

    return res.status(201).json({
      success: true,
      message: "Support request received.",
      inquiry: toPublicInquiry(inquiry),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/admin", verifyAdmin, async (req, res, next) => {
  try {
    const { status, type, source, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (source) filter.source = source;

    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);

    const [inquiries, total] = await Promise.all([
      SupportInquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      SupportInquiry.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      inquiries: inquiries.map(toPublicInquiry),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
