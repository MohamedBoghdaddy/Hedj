import mongoose from "mongoose";

// Granular permissions list — backend enforces, frontend uses to hide/show UI
export const ALL_PERMISSIONS = [
  // Products
  "products.view", "products.create", "products.update", "products.delete",
  "products.uploadImage", "products.importExcel", "products.exportExcel",
  // Orders
  "orders.viewAll", "orders.viewOwn", "orders.updateStatus", "orders.create",
  "orders.cancel", "orders.exportExcel",
  // Employees
  "employees.view", "employees.create", "employees.update", "employees.archive",
  "employees.invite", "employees.importExcel", "employees.exportExcel",
  // Customers
  "customers.view", "customers.exportExcel",
  // Attendance
  "attendance.viewAll", "attendance.viewOwn", "attendance.create",
  "attendance.update", "attendance.delete", "attendance.importExcel",
  "attendance.exportExcel", "attendance.clockInOut",
  // Leave requests
  "leave.viewAll", "leave.viewOwn", "leave.request", "leave.approve",
  "leave.reject", "leave.escalate", "leave.exportExcel",
  // Leads & Quotes
  "leads.view", "leads.create", "leads.update",
  "quotes.view", "quotes.create", "quotes.update", "quotes.sendEmail",
  // Analytics & Reports
  "analytics.view", "analytics.export",
  "reports.view", "reports.export",
  // ERP
  "erp.view", "erp.manage",
  // Approvals
  "approvals.view", "approvals.approve", "approvals.reject", "approvals.escalate",
  // Email outbox
  "emails.view", "emails.retry",
  // Settings
  "settings.view", "settings.manage",
];

// Default permissions per role
export const ROLE_PERMISSIONS = {
  super_admin: ALL_PERMISSIONS,

  admin: ALL_PERMISSIONS,

  manager: [
    "products.view",
    "orders.viewAll", "orders.updateStatus", "orders.exportExcel",
    "employees.view",
    "attendance.viewAll", "attendance.create", "attendance.update", "attendance.exportExcel",
    "leave.viewAll", "leave.approve", "leave.reject", "leave.escalate", "leave.exportExcel",
    "leads.view", "leads.update",
    "quotes.view",
    "analytics.view",
    "reports.view",
    "erp.view",
    "approvals.view", "approvals.approve", "approvals.reject",
  ],

  HR: [
    "employees.view", "employees.create", "employees.update", "employees.archive",
    "employees.invite", "employees.importExcel", "employees.exportExcel",
    "attendance.viewAll", "attendance.create", "attendance.update", "attendance.delete",
    "attendance.importExcel", "attendance.exportExcel",
    "leave.viewAll", "leave.approve", "leave.reject", "leave.escalate", "leave.exportExcel",
    "approvals.view", "approvals.approve", "approvals.reject", "approvals.escalate",
    "reports.view",
  ],

  accountant: [
    "orders.viewAll", "orders.exportExcel",
    "quotes.view", "quotes.create", "quotes.update",
    "analytics.view", "analytics.export",
    "reports.view", "reports.export",
    "leads.view",
  ],

  operations: [
    "products.view", "products.update", "products.exportExcel",
    "orders.viewAll", "orders.updateStatus", "orders.exportExcel",
    "attendance.viewOwn", "attendance.clockInOut",
    "leave.viewOwn", "leave.request",
    "leads.view",
  ],

  designer: [
    "products.view",
    "attendance.viewOwn", "attendance.clockInOut",
    "leave.viewOwn", "leave.request",
  ],

  employee: [
    "attendance.viewOwn", "attendance.clockInOut",
    "leave.viewOwn", "leave.request",
  ],

  customer: [
    "orders.viewOwn",
  ],
};

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    role: {
      type: String,
      enum: [
        "customer",
        "employee",
        "manager",
        "designer",
        "operations",
        "HR",
        "accountant",
        "admin",
        "super_admin",
      ],
      default: "customer",
    },

    // Extra permissions granted on top of role defaults (or explicit overrides)
    permissions: {
      type: [String],
      default: [],
    },

    // Permissions explicitly denied (overrides role defaults)
    deniedPermissions: {
      type: [String],
      default: [],
    },

    department: {
      type: String,
      required: function () {
        return ["employee", "manager", "designer", "operations", "HR", "accountant"].includes(this.role);
      },
    },

    managerId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null },
    level: { type: Number, default: 0 },

    receiveNotifications: {
      type: Boolean,
      default: true,
    },

    profilePhoto: { type: String },
    profilePhotoUrl: { type: String },
    profilePhotoAssetId: { type: String },
    jobTitle: { type: String },
    seniorityLevel: { type: String },
    phone: { type: String },

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
  },
  { timestamps: true }
);

// Virtual: effective permissions = role defaults + extra - denied
UserSchema.methods.getEffectivePermissions = function () {
  const base = new Set(ROLE_PERMISSIONS[this.role] || []);
  (this.permissions || []).forEach((p) => base.add(p));
  (this.deniedPermissions || []).forEach((p) => base.delete(p));
  return [...base];
};

UserSchema.methods.can = function (permission) {
  return this.getEffectivePermissions().includes(permission);
};

const User = mongoose.model("User", UserSchema);

export default User;
