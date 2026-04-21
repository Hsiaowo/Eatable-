const ignoredTokens = ["subtotal", "tax", "total", "cashier", "payment", "points", "visa"];

export function parseReceiptText(receiptText) {
  return receiptText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !ignoredTokens.some((token) => line.toLowerCase().includes(token)))
    .map((line) => line.replace(/\s+\d+([.,]\d{2})?$/u, "").trim())
    .filter(Boolean);
}
