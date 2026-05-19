import mongoose from "mongoose";

const approvalStepSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ApprovalRequest", required: true },
    stepOrder: { type: Number, required: true },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: "ERPEmployee", required: true },
    approverRole: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "skipped"],
      default: "pending",
    },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ApprovalStep", approvalStepSchema);
