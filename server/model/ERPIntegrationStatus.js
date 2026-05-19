import mongoose from "mongoose";

const erpIntegrationStatusSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["active", "not_configured", "degraded", "error"],
      default: "not_configured",
    },
    message: { type: String, default: "" },
    checkedAt: { type: Date },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("ERPIntegrationStatus", erpIntegrationStatusSchema);
