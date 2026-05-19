import mongoose from "mongoose";

const approvalRequestSchema = new mongoose.Schema(
  {
    requestType: { type: String, required: true, trim: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "ERPEmployee", required: true },
    currentApproverId: { type: mongoose.Schema.Types.ObjectId, ref: "ERPEmployee", default: null },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    description: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("ApprovalRequest", approvalRequestSchema);
