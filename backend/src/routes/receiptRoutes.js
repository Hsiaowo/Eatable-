import express from "express";
import multer from "multer";
import { processReceiptText, processReceiptUpload } from "../controllers/receiptController.js";
import { getSupportedReceiptFormatsLabel, isSupportedReceiptUpload } from "../services/ocrService.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_request, file, callback) => {
    if (isSupportedReceiptUpload(file)) {
      callback(null, true);
      return;
    }

    const error = new Error(
      `Unsupported receipt file type. Supported formats: ${getSupportedReceiptFormatsLabel()}`
    );
    error.code = "UNSUPPORTED_RECEIPT_TYPE";
    callback(error);
  }
});

router.post("/test", processReceiptText);
router.post("/upload", (request, response, next) => {
  upload.single("receipt")(request, response, (error) => {
    if (!error) {
      next();
      return;
    }

    const message =
      error.message && error.code !== "LIMIT_UNEXPECTED_FILE"
        ? error.message
        : `Unsupported receipt file type. Supported formats: ${getSupportedReceiptFormatsLabel()}`;

    response.status(400).json({ error: message });
  });
}, processReceiptUpload);

export default router;
