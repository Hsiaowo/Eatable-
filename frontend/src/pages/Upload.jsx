import UploadBox from "../components/UploadBox";

function Upload({
  receiptText,
  setReceiptText,
  selectedFile,
  setSelectedFile,
  purchaseDate,
  setPurchaseDate,
  onFillSample,
  onBack,
  onProcess,
  isProcessing,
  error
}) {
  return (
    <main className="page panel">
      <h1>Upload Receipt</h1>
      <div className="grid two-col">
        <UploadBox
          receiptText={receiptText}
          setReceiptText={setReceiptText}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          purchaseDate={purchaseDate}
          setPurchaseDate={setPurchaseDate}
          onFillSample={onFillSample}
        />
        <div className="summary-box">
          <h2>MVP Scope</h2>
          <p>This version supports text paste and image upload. Receipt images are routed through the backend upload endpoint.</p>
          <p>Expected output is a parsed list of perishable items with estimated reminder dates.</p>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
      <div className="actions">
        <button className="button secondary" onClick={onBack}>
          Back
        </button>
        <button className="button" onClick={onProcess} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Process Receipt"}
        </button>
      </div>
    </main>
  );
}

export default Upload;
