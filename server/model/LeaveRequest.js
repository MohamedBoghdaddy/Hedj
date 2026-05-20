import mongoose from "mongoose";

const approvalStepSchema = new mongoose.Schema(
  {
    stepName: { type: String },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    assigneeName: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "skipped"],
      default: "pending",
    },
    decidedAt: { type: Date },
    comment: { type: String },
  },
  { _id: false }
);

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    employeeName: { type: String },
    employeeEmail: { type: String },
    department: { type: String },

    type: {
      type: String,
      enum: [
        "vacation",
        "sick_leave",
        "time_off",
        "leave_early",
        "unpaid_leave",
        "remote_day",
        "maternity_leave",
        "paternity_leave",
        "bereavement",
      ],
      required: true,
      index: true,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Only used when type = "leave_early"
    leaveEarlyTime: { type: String },

    // Only used when type = "time_off"
    hoursRequested: { type: Number, min: 0 },

    reason: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "escalated"],
      default: "pending",
      index: true,
    },

    currentApproverId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    approvalSteps: { type: [approvalStepSchema], default: [] },

    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    decidedAt: { type: Date },
    rejectionReason: { type: String },

    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("LeaveRequest", leaveRequestSchema);
