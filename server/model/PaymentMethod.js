import mongoose from "mongoose";

// Stores payment method METADATA only — never raw card numbers or CVV.
// Raw card processing requires a PCI-compliant provider (Stripe, etc.).
const paymentMethodSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, trim: true, default: "manual" }, // stripe | manual | etc.
    providerCustomerId: { type: String, default: null },
    providerPaymentMethodId: { type: String, default: null },
    brand: { type: String, trim: true, default: "" },    // Visa, Mastercard, Amex…
    last4: { type: String, trim: true, default: "" },
    expMonth: { type: Number, default: null },
    expYear: { type: Number, default: null },
    isDefault: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "expired", "removed"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentMethod", paymentMethodSchema);
