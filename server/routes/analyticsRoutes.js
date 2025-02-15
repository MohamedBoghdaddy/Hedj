import express from "express";
import { Analytics } from "../controller/analyticsController.js";

const router = express.Router();

router.get("/", Analytics);

export default router;
