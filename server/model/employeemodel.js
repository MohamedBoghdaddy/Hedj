import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ROLE_PERMISSIONS } from "./usermodel.js";

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
    jobTitle: { type: String, trim: true },
    seniorityLevel: { type: String, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: [
        "readonly",
        "admin",
        "manager",
        "designer",
        "operations",
        "HR",
        "accountant",
        "super_admin",
      ],
      default: "readonly",
      required: true,
    },

    // Extra permissions granted on top of role defaults (or explicit overrides)
    permissions: {
      type: [String],
      default: [],
    },

    // Permissions explicitly denied
    deniedPermissions: {
      type: [String],
      default: [],
    },

    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    level: { type: Number, default: 0 },

    profilePhotoUrl: { type: String },
    profilePhotoAssetId: { type: String },

    status: {
      type: String,
      enum: ["active", "inactive", "invited", "suspended"],
      default: "active",
    },
    invitedAt: { type: Date },
    invitationEmailStatus: {
      type: String,
      enum: ["none", "pending", "queued", "sent", "failed", "provider_not_configured"],
      default: "none",
    },
    invitationEmailOutboxId: { type: String },
    supabaseAuthUserId: { type: String, default: null },
  },
  { timestamps: true }
);

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Map Employee roles to User-model ROLE_PERMISSIONS keys
const EMPLOYEE_ROLE_MAP = {
  admin: "admin",
  super_admin: "super_admin",
  manager: "manager",
  HR: "HR",
  accountant: "accountant",
  operations: "operations",
  designer: "designer",
  readonly: "employee",
};

employeeSchema.methods.getEffectivePermissions = function () {
  const mappedRole = EMPLOYEE_ROLE_MAP[this.role] || "employee";
  const base = new Set(ROLE_PERMISSIONS[mappedRole] || []);
  (this.permissions || []).forEach((p) => base.add(p));
  (this.deniedPermissions || []).forEach((p) => base.delete(p));
  return [...base];
};

employeeSchema.methods.can = function (permission) {
  return this.getEffectivePermissions().includes(permission);
};

export default mongoose.model("Employee", employeeSchema);
