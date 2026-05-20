import express from "express";
import {
  listAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getMyAttendance,
  clockIn,
  clockOut,
  exportAttendance,
} from "../controller/attendanceController.js";
import {
  isAuthenticated,
  verifyAdmin,
  requirePermission,
} from "../middleware/AuthMiddleware.js";

const router = express.Router();

// ── Employee self-service ──────────────────────────────────────────────────
router.get("/my",       isAuthenticated, requirePermission("attendance.viewOwn"),    getMyAttendance);
router.post("/clock-in",  isAuthenticated, requirePermission("attendance.clockInOut"), clockIn);
router.post("/clock-out", isAuthenticated, requirePermission("attendance.clockInOut"), clockOut);

// ── Admin / HR ─────────────────────────────────────────────────────────────
router.get("/export", isAuthenticated, requirePermission("attendance.exportExcel"), exportAttendance);
router.get("/",     isAuthenticated, requirePermission("attendance.viewAll"),    listAttendance);
router.post("/",    isAuthenticated, requirePermission("attendance.create"),     createAttendance);
router.patch("/:id",isAuthenticated, requirePermission("attendance.update"),     updateAttendance);
router.delete("/:id",isAuthenticated,requirePermission("attendance.delete"),     deleteAttendance);

export default router;
