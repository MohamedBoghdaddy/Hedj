import mongoose from "mongoose";

const erpAppSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    layer: { type: String, enum: ["primary", "secondary", "optional"], required: true },
    icon: { type: String, default: "apps" },
    purpose: { type: String, default: "" },
    dependsOn: [{ type: String }],
    usedBy: [{ type: String }],
    mainTables: [{ type: String }],
    connectedTables: [{ type: String }],
    workflowSummary: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "planned", "static", "api-connected"],
      default: "planned",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ERPApp", erpAppSchema);
