import express from "express";
import multer from "multer";
import { processReceiptText, processReceiptUpload } from "../controllers/receiptController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/test", processReceiptText);
router.post("/upload", upload.single("receipt"), processReceiptUpload);

export default router;
