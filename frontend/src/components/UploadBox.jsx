function UploadBox({ receiptText, setReceiptText, selectedFile, setSelectedFile, purchaseDate, setPurchaseDate, onFillSample }) {
  return (
    <div className="upload-box">
      <h2>Receipt Input</h2>
      <p>Paste receipt text or upload a receipt image. Image OCR now uses Tesseract.js, so clearer receipts will work better.</p>
      <label className="field-label" htmlFor="purchase-date">
        Purchase date
      </label>
      <input
        id="purchase-date"
        className="input"
        type="date"
        value={purchaseDate}
        onChange={(event) => setPurchaseDate(event.target.value)}
      />
      <label className="field-label" htmlFor="receipt-file">
        Receipt file
      </label>
      <input
        id="receipt-file"
        className="input"
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.gif,.heic,.heif,.txt,.csv,.json,image/png,image/jpeg,image/webp,image/bmp,image/tiff,image/gif,image/heic,image/heif,text/plain,text/csv,application/json"
        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
      />
      <p className="hint">Supported formats: PNG, JPG, JPEG, WEBP, BMP, TIFF, GIF, HEIC, HEIF, TXT, CSV, JSON.</p>
      {selectedFile && <p className="hint">Selected file: {selectedFile.name}</p>}
      <div className="actions">
        <button className="button secondary" type="button" onClick={onFillSample}>
          Use Sample Receipt
        </button>
      </div>
      <label className="field-label" htmlFor="receipt-text">
        Receipt text fallback
      </label>
      <textarea
        id="receipt-text"
        className="textarea"
        value={receiptText}
        onChange={(event) => setReceiptText(event.target.value)}
        placeholder={"BANANA 1.99\nSPINACH 2.49\nMILK 2% 4.79"}
      />
    </div>
  );
}

export default UploadBox;
