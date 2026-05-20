/**
 * Frontend permission helper — mirrors server/model/usermodel.js ROLE_PERMISSIONS.
 *
 * Usage:
 *   import { can, canAny, getRole } from "../utils/permissions";
 *
 *   const show = can(user, "products.create");
 *   const showAny = canAny(user, ["products.create", "products.update"]);
 */

export const ROLE_PERMISSIONS = {
  super_admin: ["*"],  // wildcard = all permissions

  admin: ["*"],

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

/**
 * Returns the user's effective permissions based on role + extra + denied.
 * The user object comes from AuthContext (stored in localStorage after login).
 */
export const getEffectivePermissions = (user) => {
  if (!user) return new Set();

  const role = user.role || "customer";
  const rolePerms = ROLE_PERMISSIONS[role] || [];

  // Wildcard admin
  if (rolePerms.includes("*")) {
    return new Set(["*"]);
  }

  const perms = new Set(rolePerms);

  // Extra permissions granted to this specific user
  (user.permissions || []).forEach((p) => perms.add(p));

  // Permissions explicitly denied for this specific user
  (user.deniedPermissions || []).forEach((p) => perms.delete(p));

  return perms;
};

/**
 * Returns true if the user has the given permission.
 */
export const can = (user, permission) => {
  if (!user) return false;
  const perms = getEffectivePermissions(user);
  return perms.has("*") || perms.has(permission);
};

/**
 * Returns true if the user has ANY of the given permissions.
 */
export const canAny = (user, permissions = []) => {
  if (!user) return false;
  return permissions.some((p) => can(user, p));
};

/**
 * Returns true if the user has ALL of the given permissions.
 */
export const canAll = (user, permissions = []) => {
  if (!user) return false;
  return permissions.every((p) => can(user, p));
};

/**
 * Returns the user's role string (lowercased).
 */
export const getRole = (user) => (user?.role || "").toLowerCase();

/**
 * Returns true if the user is an admin or super_admin.
 */
export const isAdmin = (user) => ["admin", "super_admin"].includes(getRole(user));

/**
 * Returns true if the user is any staff role (not customer).
 */
export const isStaff = (user) => {
  return ["admin", "super_admin", "manager", "HR", "accountant", "operations", "designer", "employee"].includes(getRole(user));
};

/**
 * Returns true if the user is a customer.
 */
export const isCustomer = (user) => getRole(user) === "customer";

/**
 * Returns true if the user is a pure employee (self-service only, no admin access).
 * employee role → /employee/dashboard
 * All other staff (manager, HR, accountant, operations, designer) → /admin/dashboard
 */
export const isEmployee = (user) => getRole(user) === "employee";

/**
 * Returns the correct dashboard route for a user based on role.
 * Use this after login and in route guards — never hard-code "/dashboard".
 */
export const getDashboardRoute = (user) => {
  const role = getRole(user);
  if (role === "admin" || role === "super_admin") return "/admin/dashboard";
  if (role === "employee") return "/employee/dashboard";
  if (isStaff(user)) return "/admin/dashboard"; // manager, HR, accountant, operations, designer
  return "/dashboard";
};

/**
 * Navbar/sidebar filter helper.
 * Returns true if the given nav item should be visible for this user.
 *
 * navItem: { label, permission?, roles?, requireAdmin? }
 */
export const canSeeNavItem = (user, navItem) => {
  if (!navItem) return false;
  if (navItem.requireAdmin) return isAdmin(user);
  if (navItem.roles) return navItem.roles.includes(getRole(user));
  if (navItem.permission) return can(user, navItem.permission);
  return true;
};
