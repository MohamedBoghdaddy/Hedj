import express from "express";
import multer from "multer";
import { isAuthenticated, verifyAdmin } from "../middleware/AuthMiddleware.js";
import {
  uploadProductImage,
  uploadProductGallery,
  uploadUserProfilePhoto,
  uploadEmployeeProfilePhoto,
  sendEmployeeInvite,
  createAndInviteEmployee,
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
  verifyAdmin,
  uploadSingle.single("image"),
  uploadProductImage
);

// ─── Admin: product gallery ───────────────────────────────────────────────────────
router.post(
  "/admin/products/:productId/gallery",
  verifyAdmin,
  uploadMulti.array("images", 10),
  uploadProductGallery
);

// ─── Admin: employee profile photo ───────────────────────────────────────────────
router.post(
  "/admin/employees/:employeeId/profile-photo",
  verifyAdmin,
  uploadSingle.single("image"),
  uploadEmployeeProfilePhoto
);

// ─── Admin: create employee + send invite (single step) ──────────────────────────
router.post(
  "/admin/employees/invite",
  verifyAdmin,
  createAndInviteEmployee
);

// ─── Admin: send invite to existing employee ──────────────────────────────────────
router.post(
  "/admin/employees/:employeeId/send-invite",
  verifyAdmin,
  sendEmployeeInvite
);

// ─── User: own profile photo ──────────────────────────────────────────────────────
router.post(
  "/users/me/profile-photo",
  isAuthenticated,
  uploadSingle.single("image"),
  uploadUserProfilePhoto
);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ success: false, message: "Uploaded file is too large." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  return next(err);
});

export default router;
