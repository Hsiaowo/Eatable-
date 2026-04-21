function ReminderEditor({ purchaseDate, itemCount }) {
  return (
    <div className="summary-box">
      <h2>Reminder Logic</h2>
      <p>
        Reminder dates are estimates based on a small shelf-life dataset. Users can adjust dates
        before export.
      </p>
      <p>Purchase date: {purchaseDate}</p>
      <p>Perishable reminders found: {itemCount}</p>
    </div>
  );
}

export default ReminderEditor;
