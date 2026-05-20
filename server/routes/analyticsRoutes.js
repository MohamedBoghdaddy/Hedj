import express from "express";
import { Analytics, getDashboardSummary, getAnalyticsOverview, exportAnalyticsCSV } from "../controller/analyticsController.js";
import { isAuthenticated, requirePermission } from "../middleware/AuthMiddleware.js";

const router = express.Router();
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Public aggregate stats (no auth required)
router.get("/", asyncRoute(Analytics));
// Protected: require analytics.view
router.get("/summary", isAuthenticated, requirePermission("analytics.view"), asyncRoute(getDashboardSummary));
router.get("/overview", isAuthenticated, requirePermission("analytics.view"), asyncRoute(getAnalyticsOverview));
// Export: require analytics.export
router.get("/export.csv", isAuthenticated, requirePermission("analytics.export"), asyncRoute(exportAnalyticsCSV));

export default router;
