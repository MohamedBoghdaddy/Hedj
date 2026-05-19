import express from "express";
import { verifyAdmin } from "../middleware/AuthMiddleware.js";
import {
  archiveAdminProduct,
  createAdminProduct,
  getAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  updateAdminProductStatus,
  updateAdminProductStock,
} from "../controller/adminProductController.js";

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.use(verifyAdmin);

router.get("/", asyncRoute(getAdminProducts));
router.get("/:id", asyncRoute(getAdminProduct));
router.post("/", asyncRoute(createAdminProduct));
router.put("/:id", asyncRoute(updateAdminProduct));
router.patch("/:id/stock", asyncRoute(updateAdminProductStock));
router.patch("/:id/status", asyncRoute(updateAdminProductStatus));
router.patch("/:id", asyncRoute(updateAdminProduct));
router.delete("/:id", asyncRoute(archiveAdminProduct));

export default router;
