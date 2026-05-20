import express from "express";
import {
  isAuthenticated,
  verifyAdmin,
  requirePermission,
  requireRole,
} from "../middleware/AuthMiddleware.js";
import {
  getERPOverview,
  getERPApps, createERPApp, updateERPApp, deleteERPApp,
  getSchemaRelations, createSchemaRelation, updateSchemaRelation, deleteSchemaRelation,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getJobPositions, createJobPosition, updateJobPosition, deleteJobPosition,
  getERPEmployees, getERPHierarchy, createERPEmployee, updateERPEmployee, deleteERPEmployee,
  getApprovalRequests, getApprovalRequest, createApprovalRequest, updateApprovalRequest,
  updateApprovalStatus, approveApprovalRequest, rejectApprovalRequest,
  checkERPIntegrations,
  getERPSchema,
} from "../controller/erpController.js";

const router = express.Router();

// All ERP routes require at minimum an authenticated user
router.use(isAuthenticated);

// ── Overview & Hierarchy (visible to anyone with erp.view) ──────────────────
router.get("/overview",   requirePermission("erp.view"),     getERPOverview);
router.get("/hierarchy",  requirePermission("erp.view"),     getERPHierarchy);

// ── ERP Apps (admin-managed — create/update/delete require admin) ────────────
router.get("/apps",           requirePermission("erp.view"),   getERPApps);
router.post("/apps",          requirePermission("erp.manage"), createERPApp);
router.patch("/apps/:id",     requirePermission("erp.manage"), updateERPApp);
router.delete("/apps/:id",    requirePermission("erp.manage"), deleteERPApp);

// ── Schema (admin-managed) ────────────────────────────────────────────────────
router.get("/schema",                    requirePermission("erp.view"),   getERPSchema);
router.get("/schema-relations",          requirePermission("erp.view"),   getSchemaRelations);
router.post("/schema-relations",         requirePermission("erp.manage"), createSchemaRelation);
router.patch("/schema-relations/:id",    requirePermission("erp.manage"), updateSchemaRelation);
router.put("/schema-relations/:id",      requirePermission("erp.manage"), updateSchemaRelation);
router.delete("/schema-relations/:id",   requirePermission("erp.manage"), deleteSchemaRelation);

// ── Departments (admin-managed) ───────────────────────────────────────────────
router.get("/departments",       requirePermission("erp.view"),   getDepartments);
router.post("/departments",      requirePermission("erp.manage"), createDepartment);
router.patch("/departments/:id", requirePermission("erp.manage"), updateDepartment);
router.delete("/departments/:id",requirePermission("erp.manage"), deleteDepartment);

// ── Job Positions (admin-managed) ─────────────────────────────────────────────
router.get("/job-positions",       requirePermission("erp.view"),   getJobPositions);
router.post("/job-positions",      requirePermission("erp.manage"), createJobPosition);
router.patch("/job-positions/:id", requirePermission("erp.manage"), updateJobPosition);
router.delete("/job-positions/:id",requirePermission("erp.manage"), deleteJobPosition);

// ── ERP Employees ─────────────────────────────────────────────────────────────
router.get("/employees/hierarchy", requirePermission("erp.view"),     getERPHierarchy);
router.get("/employees",           requirePermission("erp.view"),     getERPEmployees);
router.post("/employees",          requirePermission("erp.manage"),   createERPEmployee);
router.patch("/employees/:id",     requirePermission("erp.manage"),   updateERPEmployee);
router.delete("/employees/:id",    requirePermission("erp.manage"),   deleteERPEmployee);

// ── Approval Requests (manager, HR, admin can view/approve) ─────────────────
// Legacy path kept for compatibility
router.get("/approval-requests",             requirePermission("approvals.view"),    getApprovalRequests);
router.post("/approval-requests",            requirePermission("erp.manage"),        createApprovalRequest);
router.patch("/approval-requests/:id/status",requirePermission("approvals.approve"), updateApprovalStatus);

// Primary approval paths
router.get("/approvals",           requirePermission("approvals.view"),     getApprovalRequests);
router.post("/approvals",          requirePermission("erp.manage"),         createApprovalRequest);
router.get("/approvals/:id",       requirePermission("approvals.view"),     getApprovalRequest);
router.patch("/approvals/:id",     requirePermission("approvals.approve"),  updateApprovalRequest);
router.put("/approvals/:id",       requirePermission("approvals.approve"),  updateApprovalRequest);
router.post("/approvals/:id/approve", requirePermission("approvals.approve"), approveApprovalRequest);
router.post("/approvals/:id/reject",  requirePermission("approvals.reject"),  rejectApprovalRequest);

// ── Integrations check (admin-manage) ────────────────────────────────────────
router.post("/integrations/check", requirePermission("erp.manage"), checkERPIntegrations);

export default router;
