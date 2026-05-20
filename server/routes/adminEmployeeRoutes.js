import express from "express";
import {
  isAuthenticated,
  requirePermission,
} from "../middleware/AuthMiddleware.js";
import {
  createEmployee,
  deactivateEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from "../controller/adminEmployeeController.js";
import {
  sendEmployeeInvite,
  createAndInviteEmployee,
} from "../controller/uploadController.js";

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

// All routes require authentication
router.use(isAuthenticated);

// List employees (manager, HR, admin)
router.get("/", requirePermission("employees.view"), asyncRoute(listEmployees));

// Create employee without invite (admin only)
router.post("/", requirePermission("employees.create"), asyncRoute(createEmployee));

// Create + invite in one step (HR or admin with employees.invite)
router.post("/invite", requirePermission("employees.invite"), asyncRoute(createAndInviteEmployee));

// Get / update / deactivate individual employee
router.get("/:id",    requirePermission("employees.view"),    asyncRoute(getEmployeeById));
router.put("/:id",    requirePermission("employees.update"),  asyncRoute(updateEmployee));
router.patch("/:id",  requirePermission("employees.update"),  asyncRoute(updateEmployee));
router.delete("/:id", requirePermission("employees.archive"), asyncRoute(deactivateEmployee));

// Resend invite (HR or admin)
router.post("/:employeeId/send-invite", requirePermission("employees.invite"), asyncRoute(sendEmployeeInvite));

export default router;
