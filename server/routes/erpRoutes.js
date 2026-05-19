import express from "express";
import {
  getERPApps, createERPApp, updateERPApp, deleteERPApp,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getJobPositions, createJobPosition, updateJobPosition, deleteJobPosition,
  getERPEmployees, getERPHierarchy, createERPEmployee, updateERPEmployee, deleteERPEmployee,
  getApprovalRequests, createApprovalRequest, updateApprovalStatus,
  getERPSchema,
} from "../controller/erpController.js";

const router = express.Router();

// ERP Apps
router.get("/apps", getERPApps);
router.post("/apps", createERPApp);
router.patch("/apps/:id", updateERPApp);
router.delete("/apps/:id", deleteERPApp);

// Schema
router.get("/schema", getERPSchema);

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

export default router;
