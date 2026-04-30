import { useState } from "react";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Review from "./pages/Review";
import Result from "./pages/Result";
import { exportCalendar, processReceiptText, processReceiptUpload } from "./services/api";

const sampleReceiptText = `BANANA           1.99
SPINACH          2.49
MILK 2%          4.79
STRAWBERRY 1LB   5.49
TOTAL           14.76`;

function App() {
  const [page, setPage] = useState("home");
  const [receiptText, setReceiptText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState("2026-04-19");
  const [rawReceiptText, setRawReceiptText] = useState("");
  const [parsedItems, setParsedItems] = useState([]);
  const [normalizedItems, setNormalizedItems] = useState([]);
  const [items, setItems] = useState([]);
  const [htmlSummary, setHtmlSummary] = useState("");
  const [classificationProvider, setClassificationProvider] = useState("");
  const [classificationWarning, setClassificationWarning] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const handleFillSample = () => {
    setSelectedFile(null);
    setReceiptText(sampleReceiptText);
  };

  const handleProcessReceipt = async () => {
    setError("");
    setIsProcessing(true);

    try {
      const data = selectedFile
        ? await processReceiptUpload(selectedFile, purchaseDate)
        : await processReceiptText(receiptText, purchaseDate);

      setRawReceiptText(data.rawReceiptText || receiptText);
      setParsedItems(data.parsedItems || []);
      setNormalizedItems(data.normalizedItems || []);
      setItems(data.items || []);
      setHtmlSummary(data.htmlSummary || "");
      setClassificationProvider(data.classificationProvider || "");
      setClassificationWarning(data.classificationWarning || "");
      if (!data.items?.length) {
        setError(
          "No supported perishable items were found yet. Review the OCR text below and try a clearer crop, or paste receipt text."
        );
      }
      setPage("review");
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = (blob) => {
    const nextUrl = URL.createObjectURL(blob);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(nextUrl);

    const link = document.createElement("a");
    link.href = nextUrl;
    link.download = "eatable-reminders.ics";
    link.click();
  };

  const handleExport = async () => {
    setError("");
    setIsExporting(true);

    try {
      const includedItems = items.filter((item) => item.included);
      if (!includedItems.length) {
        throw new Error("Select at least one reminder before exporting.");
      }

      const blob = await exportCalendar(includedItems);
      triggerDownload(blob);
      setPage("result");
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestart = () => {
    setReceiptText("");
    setSelectedFile(null);
    setRawReceiptText("");
    setParsedItems([]);
    setNormalizedItems([]);
    setItems([]);
    setHtmlSummary("");
    setClassificationProvider("");
    setClassificationWarning("");
    setError("");
    setPage("home");
  };

  const handleDownloadAgain = async () => {
    const includedItems = items.filter((item) => item.included);
    const blob = await exportCalendar(includedItems);
    triggerDownload(blob);
  };

  return (
    <div className="app-shell">
      {page === "home" && <Home onStart={() => setPage("upload")} />}
      {page === "upload" && (
        <Upload
          receiptText={receiptText}
          setReceiptText={setReceiptText}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          purchaseDate={purchaseDate}
          setPurchaseDate={setPurchaseDate}
          onFillSample={handleFillSample}
          onBack={() => setPage("home")}
          onProcess={handleProcessReceipt}
          isProcessing={isProcessing}
          error={error}
        />
      )}
      {page === "review" && (
        <Review
          items={items}
          setItems={setItems}
          purchaseDate={purchaseDate}
          rawReceiptText={rawReceiptText}
          parsedItems={parsedItems}
          normalizedItems={normalizedItems}
          htmlSummary={htmlSummary}
          classificationProvider={classificationProvider}
          classificationWarning={classificationWarning}
          onBack={() => setPage("upload")}
          onContinue={handleExport}
          isExporting={isExporting}
          error={error}
        />
      )}
      {page === "result" && (
        <Result
          items={items.filter((item) => item.included)}
          htmlSummary={htmlSummary}
          downloadName="eatable-reminders.ics"
          onDownloadAgain={handleDownloadAgain}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
