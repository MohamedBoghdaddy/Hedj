import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, default: "" },
    sku: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, trim: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    customerName: { type: String, trim: true, default: "" },
    customerEmail: { type: String, lowercase: true, trim: true, default: "" },

    items: { type: [orderItemSchema], default: [] },

    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    installationFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["new", "confirmed", "in_production", "ready", "delivered", "cancelled"],
      default: "new",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    assignedEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    assignedEmployeeName: { type: String, default: "" },

    deliveryAddress: {
      line1: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    installationPreference: {
      type: String,
      enum: ["full", "delivery_only", "self_install"],
      default: "full",
    },
    estimatedDays: { type: Number, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
