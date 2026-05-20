import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    // The employee this record belongs to
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    // Denormalized for fast display
    employeeName: { type: String },
    employeeEmail: { type: String },
    department: { type: String },

    date: { type: Date, required: true, index: true },

    clockIn: { type: Date },
    clockOut: { type: Date },
    breakMinutes: { type: Number, default: 0, min: 0 },
    totalWorkedMinutes: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day", "leave", "holiday", "remote"],
      default: "present",
      index: true,
    },

    source: {
      type: String,
      enum: ["manual", "import", "device", "system"],
      default: "manual",
    },

    notes: { type: String, trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

// Compound index: one record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Auto-compute totalWorkedMinutes before save
attendanceSchema.pre("save", function (next) {
  if (this.clockIn && this.clockOut) {
    const worked = (this.clockOut - this.clockIn) / 60000; // ms → minutes
    this.totalWorkedMinutes = Math.max(0, worked - (this.breakMinutes || 0));
  }
  next();
});

export default mongoose.model("AttendanceRecord", attendanceSchema);
