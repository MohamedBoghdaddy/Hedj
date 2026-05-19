import express from "express";
import { verifyAdmin } from "../middleware/AuthMiddleware.js";
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

router.use(verifyAdmin);

router.get("/overview", getERPOverview);

// ERP Apps
router.get("/apps", getERPApps);
router.post("/apps", createERPApp);
router.patch("/apps/:id", updateERPApp);
router.delete("/apps/:id", deleteERPApp);

// Schema
router.get("/schema", getERPSchema);
router.get("/schema-relations", getSchemaRelations);
router.post("/schema-relations", createSchemaRelation);
router.patch("/schema-relations/:id", updateSchemaRelation);
router.put("/schema-relations/:id", updateSchemaRelation);
router.delete("/schema-relations/:id", deleteSchemaRelation);

// Departments
router.get("/departments", getDepartments);
router.post("/departments", createDepartment);
router.patch("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// Job Positions
router.get("/job-positions", getJobPositions);
router.post("/job-positions", createJobPosition);
router.patch("/job-positions/:id", updateJobPosition);
router.delete("/job-positions/:id", deleteJobPosition);

// ERP Employees
router.get("/employees/hierarchy", getERPHierarchy);
router.get("/employees", getERPEmployees);
router.post("/employees", createERPEmployee);
router.patch("/employees/:id", updateERPEmployee);
router.delete("/employees/:id", deleteERPEmployee);

// Approval Requests
router.get("/approval-requests", getApprovalRequests);
router.post("/approval-requests", createApprovalRequest);
router.patch("/approval-requests/:id/status", updateApprovalStatus);

router.get("/approvals", getApprovalRequests);
router.post("/approvals", createApprovalRequest);
router.get("/approvals/:id", getApprovalRequest);
router.patch("/approvals/:id", updateApprovalRequest);
router.put("/approvals/:id", updateApprovalRequest);
router.post("/approvals/:id/approve", approveApprovalRequest);
router.post("/approvals/:id/reject", rejectApprovalRequest);

router.post("/integrations/check", checkERPIntegrations);

export default router;
