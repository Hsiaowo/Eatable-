function UploadBox({ receiptText, setReceiptText, selectedFile, setSelectedFile, purchaseDate, setPurchaseDate, onFillSample }) {
  return (
    <div className="upload-box">
      <h2>Receipt Input</h2>
      <p>Paste receipt text or upload a receipt image. The current OCR flow uses a sample stub on the backend.</p>
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
        Receipt image
      </label>
      <input
        id="receipt-file"
        className="input"
        type="file"
        accept="image/*"
        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
      />
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
