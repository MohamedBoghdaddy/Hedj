import express from "express";
import multer from "multer";
import {
  exportEmployees,
  exportAttendanceXlsx,
  exportLeaveXlsx,
  importExcel,
  downloadTemplate,
} from "../controller/importExportController.js";
import { isAuthenticated, requirePermission } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// Memory storage — buffer is passed directly to xlsx.read()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Templates ──────────────────────────────────────────────────────────────
router.get("/template/:type", isAuthenticated, downloadTemplate);

// ── Exports ────────────────────────────────────────────────────────────────
router.get("/employees.xlsx",  isAuthenticated, requirePermission("employees.exportExcel"),  exportEmployees);
router.get("/attendance.xlsx", isAuthenticated, requirePermission("attendance.exportExcel"), exportAttendanceXlsx);
router.get("/leave.xlsx",      isAuthenticated, requirePermission("leave.exportExcel"),      exportLeaveXlsx);

// ── Universal import (auto-detects sheet type) ─────────────────────────────
// Mounted at /api/admin/import — this route handles POST /api/admin/import/
router.post("/", isAuthenticated, upload.single("file"), importExcel);

export default router;
