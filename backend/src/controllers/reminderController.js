import { buildCalendarFile } from "../services/calendarService.js";

export function exportCalendar(request, response) {
  const { items = [] } = request.body;
  const fileContent = buildCalendarFile(items);

  response.setHeader("Content-Type", "text/calendar; charset=utf-8");
  response.setHeader("Content-Disposition", 'attachment; filename="eatable-reminders.ics"');
  response.send(fileContent);
}
