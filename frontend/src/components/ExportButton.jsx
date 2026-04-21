function ExportButton({ onExport, isExporting }) {
  return (
    <button className="button" onClick={onExport} disabled={isExporting}>
      {isExporting ? "Exporting..." : "Export Calendar Reminder"}
    </button>
  );
}

export default ExportButton;
