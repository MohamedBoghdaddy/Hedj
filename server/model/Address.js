import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, trim: true, default: "Home" },
    fullName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    line1: { type: String, trim: true, default: "" },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    isDefaultShipping: { type: Boolean, default: false },
    isDefaultBilling: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
