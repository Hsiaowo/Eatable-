function toCalendarDate(value) {
  return value.replaceAll("-", "");
}

export function buildCalendarFile(items) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eatable//Food Reminder//EN"
  ];

  items.forEach((item, index) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:eatable-${index}@local`);
    lines.push(`DTSTAMP:${toCalendarDate(item.reminderDate)}T090000Z`);
    lines.push(`DTSTART;VALUE=DATE:${toCalendarDate(item.reminderDate)}`);
    lines.push(`SUMMARY:Eat ${item.normalizedName}`);
    lines.push(`DESCRIPTION:Estimated freshness reminder for ${item.rawText}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}
