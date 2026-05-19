import mongoose from "mongoose";

const quoteItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    customerName: { type: String, trim: true },
    customerEmail: { type: String, lowercase: true, trim: true },
    project: { type: String, trim: true },
    quoteNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "pending", "sent", "accepted", "rejected", "expired", "converted", "cancelled"],
      default: "draft",
      index: true,
    },
    items: { type: [quoteItemSchema], default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    validUntil: { type: Date },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    emailOutboxId: { type: String },
    lastEmailStatus: {
      type: String,
      enum: ["none", "queued", "sent", "failed", "provider_not_configured"],
      default: "none",
    },
  },
  { timestamps: true }
);

quoteSchema.index({ quoteNumber: 1 }, { unique: true });
quoteSchema.index({ leadId: 1 });
quoteSchema.index({ customerId: 1 });

export default mongoose.model("Quote", quoteSchema);
