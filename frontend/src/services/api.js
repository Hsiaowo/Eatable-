const API_BASE_URL = "http://localhost:3000/api";

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
  const response = await fetch(`${API_BASE_URL}/receipt/test`, {
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

  const response = await fetch(`${API_BASE_URL}/receipt/upload`, {
    method: "POST",
    body: formData
  });

  await ensureOk(response, "Failed to process receipt image.");

  return response.json();
}

export async function exportCalendar(items) {
  const response = await fetch(`${API_BASE_URL}/reminders/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items })
  });

  await ensureOk(response, "Failed to export calendar.");

  return response.blob();
}
