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
    lines.push(`DESCRIPTION:${buildDescription(item)}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

function buildDescription(item) {
  const parts = [
    `Estimated freshness reminder for ${escapeCalendarText(item.rawText)}`
  ];

  if (item.category) {
    parts.push(`Category: ${escapeCalendarText(item.category)}`);
  }

  if (item.storageLocation) {
    parts.push(`Storage: ${escapeCalendarText(item.storageLocation)}`);
  }

  if (item.estimatedShelfLifeDays) {
    parts.push(`Approx. storage time: ${item.estimatedShelfLifeDays} day(s)`);
  }

  if (item.reasoning) {
    parts.push(`LLM note: ${escapeCalendarText(item.reasoning)}`);
  }

  return parts.join("\\n");
}

function escapeCalendarText(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}
