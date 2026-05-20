import express from "express";
import { isAuthenticated, requirePermission } from "../middleware/AuthMiddleware.js";
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

router.use(isAuthenticated);

router.get("/",             requirePermission("products.view"),       asyncRoute(getAdminProducts));
router.get("/:id",          requirePermission("products.view"),       asyncRoute(getAdminProduct));
router.post("/",            requirePermission("products.create"),     asyncRoute(createAdminProduct));
router.put("/:id",          requirePermission("products.update"),     asyncRoute(updateAdminProduct));
router.patch("/:id/stock",  requirePermission("products.update"),     asyncRoute(updateAdminProductStock));
router.patch("/:id/status", requirePermission("products.update"),     asyncRoute(updateAdminProductStatus));
router.patch("/:id",        requirePermission("products.update"),     asyncRoute(updateAdminProduct));
router.delete("/:id",       requirePermission("products.delete"),     asyncRoute(archiveAdminProduct));

export default router;
