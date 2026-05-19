import mongoose from "mongoose";

const erpEmployeeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    employeeCode: { type: String, required: true, unique: true, trim: true },
    level: {
      type: String,
      enum: ["executive", "manager", "team_lead", "senior", "junior", "intern"],
      required: true,
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    jobPositionId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPosition", default: null },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "ERPEmployee", default: null },
    status: { type: String, enum: ["active", "inactive", "invited"], default: "active" },
    assignedModules: [{ type: String }],
    hireDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("ERPEmployee", erpEmployeeSchema);
