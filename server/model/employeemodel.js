import mongoose from "mongoose";
import bcrypt from "bcrypt";

const employeeSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true, trim: true },
    lname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["readonly", "admin"],
      default: "readonly",
      required: true,
    },
    // Supabase Storage + email outbox references
    profilePhotoUrl: { type: String },
    profilePhotoAssetId: { type: String },
    invitationEmailStatus: {
      type: String,
      enum: ["none", "queued", "sent", "failed", "provider_not_configured"],
      default: "none",
    },
    invitationEmailOutboxId: { type: String },
  },
  { timestamps: true }
);

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("Employee", employeeSchema);
