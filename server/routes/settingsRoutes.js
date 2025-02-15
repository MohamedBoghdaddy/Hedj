import express from "express";
import {
  settings,
  updateSettings,
} from "../controller/settingsController.js";

const router = express.Router();

router.get("/", settings);
router.put("/update", updateSettings);

export default router;
