import ExportButton from "../components/ExportButton";
import ItemTable from "../components/ItemTable";
import LlmSummaryPanel from "../components/LlmSummaryPanel";
import OcrDebugPanel from "../components/OcrDebugPanel";
import ReminderEditor from "../components/ReminderEditor";

function Review({
  items,
  setItems,
  purchaseDate,
  rawReceiptText,
  parsedItems,
  normalizedItems,
  htmlSummary,
  classificationProvider,
  classificationWarning,
  onBack,
  onContinue,
  isExporting,
  error
}) {
  return (
    <main className="page panel">
      <h1>Review Estimated Reminders</h1>
      <p>Users can keep, remove, or edit reminder dates before exporting to calendar.</p>
      {error && <p className="error-text">{error}</p>}
      <ReminderEditor
        purchaseDate={purchaseDate}
        itemCount={items.length}
        classificationProvider={classificationProvider}
        classificationWarning={classificationWarning}
      />
      <LlmSummaryPanel
        htmlSummary={htmlSummary}
        classificationProvider={classificationProvider}
      />
      <OcrDebugPanel
        rawReceiptText={rawReceiptText}
        parsedItems={parsedItems}
        normalizedItems={normalizedItems}
      />
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
