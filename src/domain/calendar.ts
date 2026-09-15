import { appConfig } from "../config/appConfig";
import { validationText } from "../locales/es/validation";
const escapeIcs = (s: string) =>
  s
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\r", "");
export function ics(title: string, date: string, id: string) {
  if (!date) throw new Error(validationText.eventDateRequired);
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replaceAll("-", "")
      .replaceAll(":", "")
      .replace(/\.\d{3}/, "");
  const start = new Date(date + appConfig.calendar.utcOffset);
  if (!Number.isFinite(start.getTime()))
    throw new Error(validationText.invalidDate);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Obra//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${id}@obra.local`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(new Date(start.getTime() + appConfig.calendar.eventDurationMinutes * 60_000))}`,
    `SUMMARY:${escapeIcs(title)}`,
    "BEGIN:VALARM",
    `TRIGGER:-PT${appConfig.calendar.reminderMinutes}M`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return (
    lines
      .map((line) => {
        let out = "",
          bytes = 0;
        for (const c of line) {
          const n = new TextEncoder().encode(c).length;
          if (bytes + n > 73) {
            out += "\r\n ";
            bytes = 1;
          }
          out += c;
          bytes += n;
        }
        return out;
      })
      .join("\r\n") + "\r\n"
  );
}
