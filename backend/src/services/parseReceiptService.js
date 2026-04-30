const ignoredTokens = [
  "subtotal",
  "sub total",
  "tax",
  "hst",
  "gst",
  "pst",
  "qst",
  "total",
  "balance",
  "change",
  "cashier",
  "payment",
  "points",
  "visa",
  "mastercard",
  "debit",
  "credit",
  "approval",
  "auth",
  "terminal",
  "invoice",
  "transaction",
  "thank you",
  "welcome",
  "store",
  "address",
  "tel",
  "phone",
  "www",
  "item count"
];

const blockedWholeLinePatterns = [
  /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/u,
  /^\d{2}:\d{2}(:\d{2})?$/u,
  /^[#*=\-.\s]+$/u,
  /^\d+$/u
];

export function parseReceiptText(receiptText) {
  return receiptText
    .split(/\r?\n/u)
    .map((line) => cleanLine(line))
    .filter(Boolean)
    .filter((line) => isLikelyItemLine(line))
    .map((line) => stripReceiptNoise(line))
    .filter(Boolean)
    .filter((line) => hasUsefulLetters(line))
    .filter((line) => !isIgnoredLine(line));
}

function cleanLine(line) {
  return line
    .replace(/\t+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function isLikelyItemLine(line) {
  if (blockedWholeLinePatterns.some((pattern) => pattern.test(line))) {
    return false;
  }

  return hasUsefulLetters(line) && !isIgnoredLine(line);
}

function stripReceiptNoise(line) {
  return line
    .replace(/^\d+\s+/u, "")
    .replace(/\b[a-z]?\d{4,}\b/giu, " ")
    .replace(/\b\d+\s*@\s*\d+([.,]\d{2})?\b/giu, " ")
    .replace(/\b\d+(\.\d+)?\s?(kg|g|lb|lbs|oz|l|ml|pk|ct)\b/giu, " ")
    .replace(/\b[x*]\s?\d+\b/giu, " ")
    .replace(/\b\d+\s?[x*]\b/giu, " ")
    .replace(/\s+\$?\d+([.,]\d{2})?$/u, "")
    .replace(/^\$?\d+([.,]\d{2})?\s+/u, "")
    .replace(/[^\p{L}\p{N}%&/\-.\s]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function hasUsefulLetters(line) {
  return /[a-z]/iu.test(line);
}

function isIgnoredLine(line) {
  const lower = line.toLowerCase();
  return ignoredTokens.some((token) => lower.includes(token));
}
