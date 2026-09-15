/** Public application settings. Never place credentials here.
 * Monetary precision and stored enum values are data contracts, not UI settings.
 */
export const appConfig = {
  brand: { name: "obra", tagline: "CONTROL DE CONSTRUCCIÓN" },
  formatting: {
    numberLocale: "en-US",
    dateLocale: "es-GT",
    currencySymbol: "Q",
  },
  calendar: {
    timeZone: "America/Guatemala",
    utcOffset: "-06:00",
    eventDurationMinutes: 60,
    reminderMinutes: 30,
  },
  dashboard: {
    recentPurchases: 4,
    agendaItems: 2,
    budgetWarningPercent: 80,
    budgetCriticalPercent: 90,
    budgetExceededPercent: 100,
  },
  auth: { minimumPasswordLength: 8 },
  backup: {
    maxFileBytes: 10_000_000,
    maxRecordsPerCollection: 10_000,
    maxImportRecords: 450,
    downloadUrlLifetimeMs: 10_000,
  },
  // Keep these ceilings aligned with firestore.rules when changing them.
  validation: {
    shortTextLength: 160,
    longTextLength: 1000,
    maxAmountCents: 99_999_999_999,
  },
  storage: { trustedDeviceKey: "trusted-device" },
} as const;
