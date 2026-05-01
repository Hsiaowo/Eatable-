import { createWorker } from "tesseract.js";
import sharp from "sharp";
import { parseReceiptText } from "./parseReceiptService.js";
import { normalizeItems } from "./normalizeItemService.js";

let workerPromise = null;
const OCR_TIMEOUT_MS = 15000;
const TARGET_RECEIPT_WIDTH = 1400;
const supportedImageMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/gif",
  "image/heic",
  "image/heif"
]);
const supportedImageExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".bmp",
  ".tif",
  ".tiff",
  ".gif",
  ".heic",
  ".heif"
];
const supportedTextMimeTypes = new Set(["application/json", "application/csv"]);
const supportedTextExtensions = [".txt", ".csv", ".json"];

export async function runOcr(file) {
  if (!file) {
    return "";
  }

  if (isTextLikeUpload(file)) {
    return file.buffer.toString("utf8");
  }

  try {
    const worker = await getWorker();
    const variants = await buildRecognitionVariants(file.buffer);
    let bestAttempt = null;

    for (const variant of variants) {
      const result = await withTimeout(
        worker.recognize(variant.buffer),
        OCR_TIMEOUT_MS,
        `OCR timed out while processing the ${variant.label} image.`
      );

      const text = result.data.text || "";
      const attempt = {
        label: variant.label,
        text,
        score: scoreRecognizedText(text),
        confidence: result.data.confidence || 0
      };

      if (isBetterAttempt(attempt, bestAttempt)) {
        bestAttempt = attempt;
      }

      if (bestAttempt && bestAttempt.score >= 16) {
        break;
      }
    }

    if (bestAttempt?.text?.trim()) {
      console.log("[ocr] selected variant:", bestAttempt.label, {
        score: bestAttempt.score,
        confidence: bestAttempt.confidence
      });
      return bestAttempt.text;
    }

    return "";
  } catch (error) {
    const wrappedError = new Error(buildOcrErrorMessage(error));
    wrappedError.code = "OCR_FAILED";
    wrappedError.cause = error;
    throw wrappedError;
  }
}

function isTextLikeUpload(file) {
  const mimetype = (file.mimetype || "").toLowerCase();
  const filename = (file.originalname || "").toLowerCase();

  return (
    mimetype.startsWith("text/") ||
    supportedTextMimeTypes.has(mimetype) ||
    supportedTextExtensions.some((extension) => filename.endsWith(extension))
  );
}

export function isSupportedReceiptUpload(file) {
  if (!file) {
    return false;
  }

  const mimetype = (file.mimetype || "").toLowerCase();
  const filename = (file.originalname || "").toLowerCase();

  return (
    isTextLikeUpload(file) ||
    supportedImageMimeTypes.has(mimetype) ||
    supportedImageExtensions.some((extension) => filename.endsWith(extension))
  );
}

export function getSupportedReceiptFormatsLabel() {
  return "png, jpg, jpeg, webp, bmp, tif, tiff, gif, heic, heif, txt, csv, json";
}

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker(process.env.OCR_LANGUAGE || "eng", undefined, {
      logger: (message) => {
        if (message.status) {
          console.log(`[ocr] ${message.status}`, message.progress ?? "");
        }
      }
    });
  }

  return workerPromise;
}

async function buildRecognitionVariants(inputBuffer) {
  const image = sharp(inputBuffer, { failOn: "none" });
  const metadata = await image.metadata();
  const targetWidth = Math.max(TARGET_RECEIPT_WIDTH, metadata.width || 0);
  const base = image.rotate().resize({
    width: targetWidth,
    withoutEnlargement: false,
    fit: "inside"
  });

  const variants = await Promise.all([
    base
      .clone()
      .png()
      .toBuffer()
      .then((buffer) => ({ label: "original-resized", buffer })),
    base
      .clone()
      .grayscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer()
      .then((buffer) => ({ label: "grayscale-normalized", buffer })),
    base
      .clone()
      .grayscale()
      .normalize()
      .sharpen()
      .threshold(170)
      .png()
      .toBuffer()
      .then((buffer) => ({ label: "threshold-170", buffer }))
  ]);

  return variants;
}

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        const error = new Error(message);
        error.code = "OCR_TIMEOUT";
        reject(error);
      }, timeoutMs);
    })
  ]);
}

function buildOcrErrorMessage(error) {
  if (error?.code === "OCR_TIMEOUT") {
    return "Receipt OCR timed out. Try a clearer PNG/JPG image with higher contrast, or paste receipt text instead.";
  }

  const causeMessage = error?.message || error?.cause?.message || "";
  const lowerCause = causeMessage.toLowerCase();

  if (lowerCause.includes("fetch") || lowerCause.includes("network") || lowerCause.includes("load language")) {
    return "Receipt OCR could not load language data. Check internet access, then retry the image upload.";
  }

  if (lowerCause.includes("input buffer") || lowerCause.includes("unsupported image")) {
    return "Receipt image could not be decoded. Try PNG or JPG, or re-save the image and upload again.";
  }

  return "Image OCR failed. Try a clearer PNG/JPG receipt image, or paste receipt text instead.";
}

function scoreRecognizedText(text) {
  const parsedItems = parseReceiptText(text);
  const normalizedItems = normalizeItems(parsedItems);
  const supportedItems = normalizedItems.filter((item) => item.category !== "other");
  const lines = text.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  const itemLikeLines = lines.filter((line) => /[a-z]/iu.test(line) && /\d/.test(line));

  return supportedItems.length * 10 + parsedItems.length * 4 + itemLikeLines.length;
}

function isBetterAttempt(nextAttempt, currentAttempt) {
  if (!currentAttempt) {
    return true;
  }

  if (nextAttempt.score !== currentAttempt.score) {
    return nextAttempt.score > currentAttempt.score;
  }

  return nextAttempt.confidence > currentAttempt.confidence;
}
