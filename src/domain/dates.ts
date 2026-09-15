import { appConfig } from "../config/appConfig";
import { validationText } from "../locales/es/validation";
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: appConfig.calendar.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const localNow = () =>
  `${today()}T${new Intl.DateTimeFormat("en-GB", { timeZone: appConfig.calendar.timeZone, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}`;
export const dateLabel = (s: string) =>
  s
    ? new Intl.DateTimeFormat(appConfig.formatting.dateLocale, {
        timeZone: appConfig.calendar.timeZone,
        dateStyle: "medium",
      }).format(
        new Date(
          s.length === 10
            ? s + "T12:00:00" + appConfig.calendar.utcOffset
            : s + appConfig.calendar.utcOffset,
        ),
      )
    : validationText.noDate;
