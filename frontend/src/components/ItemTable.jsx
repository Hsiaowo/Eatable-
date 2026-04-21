function ItemTable({ items, setItems }) {
  const toggleIncluded = (index) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, included: !item.included } : item
      )
    );
  };

  const updateDate = (index, nextDate) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, reminderDate: nextDate } : item
      )
    );
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Include</th>
          <th>Raw Item</th>
          <th>Normalized</th>
          <th>Category</th>
          <th>Reminder Date</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={`${item.rawText}-${index}`}>
            <td>
              <input
                type="checkbox"
                checked={item.included}
                onChange={() => toggleIncluded(index)}
              />
            </td>
            <td>{item.rawText}</td>
            <td>{item.normalizedName}</td>
            <td>{item.category}</td>
            <td>
              <input
                type="date"
                value={item.reminderDate}
                onChange={(event) => updateDate(index, event.target.value)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ItemTable;
