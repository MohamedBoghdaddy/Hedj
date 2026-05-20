import express from "express";
import { isAuthenticated, requirePermission } from "../middleware/AuthMiddleware.js";
import {
  listAdminOrders,
  getAdminOrder,
  createAdminOrder,
  updateAdminOrder,
  updateAdminOrderStatus,
  cancelAdminOrder,
} from "../controller/adminOrderController.js";

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.use(isAuthenticated);

router.get("/",           requirePermission("orders.viewAll"),      asyncRoute(listAdminOrders));
router.post("/",          requirePermission("orders.create"),        asyncRoute(createAdminOrder));
router.get("/:id",        requirePermission("orders.viewAll"),      asyncRoute(getAdminOrder));
router.put("/:id",        requirePermission("orders.updateStatus"), asyncRoute(updateAdminOrder));
router.patch("/:id",      requirePermission("orders.updateStatus"), asyncRoute(updateAdminOrder));
router.patch("/:id/status",requirePermission("orders.updateStatus"),asyncRoute(updateAdminOrderStatus));
router.delete("/:id",     requirePermission("orders.cancel"),        asyncRoute(cancelAdminOrder));

export default router;
