import { runOcr } from "../services/ocrService.js";
import { parseReceiptText } from "../services/parseReceiptService.js";
import { normalizeItems } from "../services/normalizeItemService.js";
import { estimateReminders } from "../services/expiryService.js";

export function processReceiptText(request, response) {
  const { receiptText = "", purchaseDate = "2026-04-19" } = request.body;
  if (!receiptText.trim()) {
    return response.status(400).json({ error: "Receipt text is required." });
  }

  const parsedItems = parseReceiptText(receiptText);
  const normalizedItems = normalizeItems(parsedItems);
  const reminders = estimateReminders(normalizedItems, purchaseDate);

  return response.json({
    purchaseDate,
    rawReceiptText: receiptText,
    items: reminders
  });
}

export async function processReceiptUpload(request, response) {
  if (!request.file) {
    return response.status(400).json({ error: "Receipt image is required." });
  }

  const purchaseDate = request.body.purchaseDate || "2026-04-19";
  const rawReceiptText = await runOcr(request.file);
  const parsedItems = parseReceiptText(rawReceiptText);
  const normalizedItems = normalizeItems(parsedItems);
  const reminders = estimateReminders(normalizedItems, purchaseDate);

  return response.json({
    purchaseDate,
    rawReceiptText,
    items: reminders
  });
}
