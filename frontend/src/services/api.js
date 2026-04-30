const API_BASE_URL = "http://127.0.0.1:3000/api";
const REQUEST_TIMEOUT_MS = 60000;

async function ensureOk(response, fallbackMessage) {
  if (response.ok) {
    return response;
  }

  let message = fallbackMessage;

  try {
    const data = await response.json();
    message = data.error || message;
  } catch {
    message = fallbackMessage;
  }

  throw new Error(message);
}

export async function processReceiptText(receiptText, purchaseDate) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/receipt/test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ receiptText, purchaseDate })
  });

  await ensureOk(response, "Failed to process receipt text.");

  return response.json();
}

export async function processReceiptUpload(file, purchaseDate) {
  const formData = new FormData();
  formData.append("receipt", file);
  formData.append("purchaseDate", purchaseDate);

  const response = await fetchWithTimeout(`${API_BASE_URL}/receipt/upload`, {
    method: "POST",
    body: formData
  });

  await ensureOk(response, "Failed to process receipt image.");

  return response.json();
}

export async function exportCalendar(items) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/reminders/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items })
  });

  await ensureOk(response, "Failed to export calendar.");

  return response.blob();
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request timed out. Try a smaller or clearer receipt image, or paste receipt text.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
