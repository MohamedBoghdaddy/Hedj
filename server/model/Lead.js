import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    projectType: { type: String, trim: true },
    source: { type: String, trim: true, default: "admin" },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "proposal", "won", "lost", "archived"],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    estimatedValue: { type: Number, default: 0, min: 0 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    convertedCustomerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Lead", leadSchema);
