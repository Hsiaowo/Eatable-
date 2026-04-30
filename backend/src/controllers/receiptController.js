import { runOcr } from "../services/ocrService.js";
import { parseReceiptText } from "../services/parseReceiptService.js";
import { normalizeItems } from "../services/normalizeItemService.js";
import { buildPerishableReminders } from "../services/perishableClassifierService.js";

export async function processReceiptText(request, response) {
  try {
    const { receiptText = "", purchaseDate = "2026-04-19" } = request.body;
    if (!receiptText.trim()) {
      return response.status(400).json({ error: "Receipt text is required." });
    }

    const parsedItems = parseReceiptText(receiptText);
    const normalizedItems = normalizeItems(parsedItems);
    const reminderResult = await buildPerishableReminders({
      parsedItems,
      normalizedItems,
      purchaseDate
    });

    return response.json({
      purchaseDate,
      rawReceiptText: receiptText,
      parsedItems,
      normalizedItems,
      items: reminderResult.items,
      htmlSummary: reminderResult.htmlSummary,
      classificationProvider: reminderResult.classificationProvider,
      classificationWarning: reminderResult.classificationWarning
    });
  } catch (error) {
    console.error("Receipt text processing failed:", error);
    return response.status(500).json({
      error: error.message || "Failed to process receipt text."
    });
  }
}

export async function processReceiptUpload(request, response) {
  if (!request.file) {
    return response.status(400).json({ error: "Receipt image is required." });
  }

  try {
    const purchaseDate = request.body.purchaseDate || "2026-04-19";
    const rawReceiptText = await runOcr(request.file);
    const parsedItems = parseReceiptText(rawReceiptText);
    const normalizedItems = normalizeItems(parsedItems);
    const reminderResult = await buildPerishableReminders({
      parsedItems,
      normalizedItems,
      purchaseDate
    });

    return response.json({
      purchaseDate,
      rawReceiptText,
      parsedItems,
      normalizedItems,
      items: reminderResult.items,
      htmlSummary: reminderResult.htmlSummary,
      classificationProvider: reminderResult.classificationProvider,
      classificationWarning: reminderResult.classificationWarning
    });
  } catch (error) {
    const statusCode = error.code === "OCR_FAILED" ? 400 : 500;
    console.error("Receipt upload OCR failed:", error);
    return response.status(statusCode).json({
      error: error.message || "Failed to process receipt upload."
    });
  }
}
