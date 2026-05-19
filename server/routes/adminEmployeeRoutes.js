import express from "express";
import { verifyAdmin } from "../middleware/AuthMiddleware.js";
import {
  createEmployee,
  deactivateEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from "../controller/adminEmployeeController.js";
import { sendEmployeeInvite } from "../controller/uploadController.js";

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.use(verifyAdmin);

router.get("/", asyncRoute(listEmployees));
router.post("/", asyncRoute(createEmployee));
router.get("/:id", asyncRoute(getEmployeeById));
router.put("/:id", asyncRoute(updateEmployee));
router.delete("/:id", asyncRoute(deactivateEmployee));
router.post("/:employeeId/send-invite", asyncRoute(sendEmployeeInvite));

export default router;
