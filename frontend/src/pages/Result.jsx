import { formatDate } from "../utils/formatDate";

function Result({ items, downloadName, onDownloadAgain, onRestart }) {
  return (
    <main className="page panel">
      <h1>Calendar Export Ready</h1>
      <p>The included reminders below were exported as an `.ics` calendar file.</p>
      <ul className="pill-list">
        {items.map((item) => (
          <li className="pill" key={`${item.normalizedName}-${item.reminderDate}`}>
            {item.normalizedName} - {formatDate(item.reminderDate)}
          </li>
        ))}
      </ul>
      <div className="actions">
        <button className="button secondary" onClick={onDownloadAgain}>
          Download {downloadName}
        </button>
        <button className="button" onClick={onRestart}>
          Start Again
        </button>
      </div>
    </main>
  );
}

export default Result;
