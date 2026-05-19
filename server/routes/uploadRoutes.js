import express from "express";
import multer from "multer";
import { isAuthenticated, verifyAdminOrEmployee } from "../middleware/AuthMiddleware.js";
import {
  uploadProductImage,
  uploadProductGallery,
  uploadUserProfilePhoto,
  uploadEmployeeProfilePhoto,
  sendEmployeeInvite,
} from "../controller/uploadController.js";

const router = express.Router();

// Memory storage keeps file in buffer – no disk writes needed for Supabase uploads
const memStorage = multer.memoryStorage();

const uploadSingle = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB hard cap; per-bucket limits enforced in service
});

const uploadMulti = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

// ─── Admin: product image ─────────────────────────────────────────────────────────
router.post(
  "/admin/products/:productId/image",
  verifyAdminOrEmployee,
  uploadSingle.single("image"),
  uploadProductImage
);

// ─── Admin: product gallery ───────────────────────────────────────────────────────
router.post(
  "/admin/products/:productId/gallery",
  verifyAdminOrEmployee,
  uploadMulti.array("images", 10),
  uploadProductGallery
);

// ─── Admin: employee profile photo ───────────────────────────────────────────────
router.post(
  "/admin/employees/:employeeId/profile-photo",
  verifyAdminOrEmployee,
  uploadSingle.single("image"),
  uploadEmployeeProfilePhoto
);

// ─── Admin: send employee invite ──────────────────────────────────────────────────
router.post(
  "/admin/employees/:employeeId/send-invite",
  verifyAdminOrEmployee,
  sendEmployeeInvite
);

// ─── User: own profile photo ──────────────────────────────────────────────────────
router.post(
  "/users/me/profile-photo",
  isAuthenticated,
  uploadSingle.single("image"),
  uploadUserProfilePhoto
);

export default router;
