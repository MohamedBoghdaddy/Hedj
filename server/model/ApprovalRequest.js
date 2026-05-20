import mongoose from "mongoose";

const approvalRequestSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    requestType: { type: String, required: true, trim: true },

    // ObjectId refs — prefer Employee (admin panel employees), fall back to string fields
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    currentApproverId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },

    // String fallbacks used when ObjectId refs are not available
    employeeName: { type: String, trim: true, default: "" },
    currentApproverName: { type: String, trim: true, default: "" },

    // Legacy string fields from earlier seed format
    requestedBy: { type: String, trim: true, default: "" },
    department: { type: String, trim: true, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "escalated"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    description: { type: String, default: "" },
    amount: { type: Number, default: null },
    steps: [
      {
        stepName: { type: String },
        assignee: { type: String },
        status: { type: String },
        assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
      },
    ],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("ApprovalRequest", approvalRequestSchema);
