import mongoose from "mongoose";

const jobPositionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    level: {
      type: String,
      enum: ["executive", "manager", "team_lead", "senior", "junior", "intern"],
      required: true,
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    description: { type: String, default: "" },
    permissionsRole: { type: String, default: "viewer" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("JobPosition", jobPositionSchema);
