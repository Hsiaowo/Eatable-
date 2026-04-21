function Home({ onStart }) {
  return (
    <main className="page hero">
      <h1>Eatable</h1>
      <p>
        A receipt-based food reminder website that turns grocery purchases into editable calendar
        reminders.
      </p>
      <ul className="pill-list">
        <li className="pill">Upload receipt</li>
        <li className="pill">Parse food items</li>
        <li className="pill">Estimate reminder dates</li>
        <li className="pill">Export .ics</li>
      </ul>
      <div className="actions">
        <button className="button" onClick={onStart}>
          Try MVP Flow
        </button>
      </div>
    </main>
  );
}

export default Home;
