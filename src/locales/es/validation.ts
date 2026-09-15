import { appConfig } from "../../config/appConfig";
/** Spanish interface copy for validation. Stored domain values live in domain/schemas.ts. */
export const validationText = {
  invalidDate: "Fecha inválida.",
  eventDateRequired: "Primero define la fecha del evento.",
  noDate: "Sin fecha",
  paymentExceedsTotal: "El abono no puede exceder el total.",
  paymentExceedsAgreement: "El abono no puede exceder lo acordado.",

  invalidMoney: "Ingresa un monto positivo con hasta dos decimales.",
  invalidQuantity: "Cantidad inválida: máximo tres decimales.",
  amountLimitExceeded: `El total excede el límite de ${appConfig.formatting.currencySymbol}${(appConfig.validation.maxAmountCents / 100).toLocaleString(appConfig.formatting.numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
} as const;
