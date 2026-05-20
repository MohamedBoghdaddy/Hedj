import mongoose from "mongoose";

export const SUPPORT_TYPES = [
  "Order Issue",
  "Delivery Question",
  "Product Inquiry",
  "Return / Exchange",
  "Account Help",
  "Trade Program",
  "Other",
];

export const INQUIRY_SOURCES = [
  "contact_page",
  "support_portal",
  "trade_program",
];

const SupportInquirySchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    type: {
      type: String,
      enum: SUPPORT_TYPES,
      required: true,
    },
    orderNumber: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    source: {
      type: String,
      enum: INQUIRY_SOURCES,
      default: "support_portal",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

SupportInquirySchema.index({ email: 1, createdAt: -1 });
SupportInquirySchema.index({ type: 1, status: 1 });

const SupportInquiry =
  mongoose.models.SupportInquiry ||
  mongoose.model("SupportInquiry", SupportInquirySchema);

export default SupportInquiry;
