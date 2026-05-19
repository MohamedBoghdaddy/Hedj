import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: "" },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "ERPEmployee", default: null },
    parentDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
