function OcrDebugPanel({ rawReceiptText, parsedItems, normalizedItems }) {
  return (
    <div className="grid two-col">
      <div className="summary-box">
        <h2>Raw OCR Text</h2>
        <pre className="receipt-preview">{rawReceiptText || "No OCR text returned."}</pre>
      </div>
      <div className="summary-box">
        <h2>Parsed Item Lines</h2>
        {parsedItems.length ? (
          <ul className="debug-list">
            {parsedItems.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No parsed item lines.</p>
        )}
      </div>
      <div className="summary-box debug-span">
        <h2>Normalized Items</h2>
        {normalizedItems.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Raw</th>
                <th>Normalized</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {normalizedItems.map((item, index) => (
                <tr key={`${item.rawText}-${index}`}>
                  <td>{item.rawText}</td>
                  <td>{item.normalizedName}</td>
                  <td>{item.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No normalized items.</p>
        )}
      </div>
    </div>
  );
}

export default OcrDebugPanel;
