function ReminderEditor({ purchaseDate, itemCount, classificationProvider, classificationWarning }) {
  return (
    <div className="summary-box">
      <h2>Reminder Logic</h2>
      <p>
        Reminder dates are estimates generated from parsed receipt items. Users can adjust dates
        before export.
      </p>
      <p>Purchase date: {purchaseDate}</p>
      <p>Perishable reminders found: {itemCount}</p>
      {classificationProvider && <p>Classification provider: {classificationProvider}</p>}
      {classificationWarning && <p className="error-text">{classificationWarning}</p>}
    </div>
  );
}

export default ReminderEditor;
