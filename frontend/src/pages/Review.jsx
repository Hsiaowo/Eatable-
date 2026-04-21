import ExportButton from "../components/ExportButton";
import ItemTable from "../components/ItemTable";
import ReminderEditor from "../components/ReminderEditor";

function Review({ items, setItems, purchaseDate, rawReceiptText, onBack, onContinue, isExporting, error }) {
  return (
    <main className="page panel">
      <h1>Review Estimated Reminders</h1>
      <p>Users can keep, remove, or edit reminder dates before exporting to calendar.</p>
      {error && <p className="error-text">{error}</p>}
      <ReminderEditor purchaseDate={purchaseDate} itemCount={items.length} />
      {rawReceiptText && (
        <div className="summary-box">
          <h2>Extracted Receipt Text</h2>
          <pre className="receipt-preview">{rawReceiptText}</pre>
        </div>
      )}
      <ItemTable items={items} setItems={setItems} />
      <div className="actions">
        <button className="button secondary" onClick={onBack}>
          Back
        </button>
        <ExportButton onExport={onContinue} isExporting={isExporting} />
      </div>
    </main>
  );
}

export default Review;
