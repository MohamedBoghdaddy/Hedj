import express from "express";
import {
  getMyLeaveRequests,
  submitLeaveRequest,
  cancelLeaveRequest,
  listLeaveRequests,
  getLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  escalateLeaveRequest,
  exportLeaveRequests,
} from "../controller/leaveController.js";
import { isAuthenticated, requirePermission } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// ── Employee self-service ──────────────────────────────────────────────────
router.get("/my",        isAuthenticated, requirePermission("leave.viewOwn"),    getMyLeaveRequests);
router.post("/request",  isAuthenticated, requirePermission("leave.request"),    submitLeaveRequest);
router.patch("/:id/cancel", isAuthenticated, requirePermission("leave.request"), cancelLeaveRequest);

// ── Admin / HR / Manager ───────────────────────────────────────────────────
router.get("/export",        isAuthenticated, requirePermission("leave.exportExcel"), exportLeaveRequests);
router.get("/",              isAuthenticated, requirePermission("leave.viewAll"),     listLeaveRequests);
router.get("/:id",           isAuthenticated, requirePermission("leave.viewAll"),     getLeaveRequest);
router.patch("/:id/approve", isAuthenticated, requirePermission("leave.approve"),     approveLeaveRequest);
router.patch("/:id/reject",  isAuthenticated, requirePermission("leave.reject"),      rejectLeaveRequest);
router.patch("/:id/escalate",isAuthenticated, requirePermission("leave.escalate"),    escalateLeaveRequest);

export default router;
