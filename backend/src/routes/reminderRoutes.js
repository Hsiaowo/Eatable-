import express from "express";
import { exportCalendar } from "../controllers/reminderController.js";

const router = express.Router();

router.post("/export", exportCalendar);

export default router;
