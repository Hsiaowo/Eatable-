function LlmSummaryPanel({ htmlSummary, classificationProvider }) {
  return (
    <div className="summary-box">
      <h2>LLM Classification Output</h2>
      <p>This HTML summary is generated from the receipt parsing result and used alongside the structured reminder items.</p>
      <div
        className="llm-html"
        data-provider={classificationProvider || "unknown"}
        dangerouslySetInnerHTML={{ __html: htmlSummary || "<p>No LLM HTML summary available.</p>" }}
      />
    </div>
  );
}

export default LlmSummaryPanel;
