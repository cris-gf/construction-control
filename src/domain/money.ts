import { appConfig } from "../config/appConfig";
import { validationText } from "../locales/es/validation";
export const money = (cents: number) =>
  `${appConfig.formatting.currencySymbol}${(cents / 100).toLocaleString(appConfig.formatting.numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function cents(value: string): number {
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(value))
    throw new Error(validationText.invalidMoney);
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
// Cantidades en milésimas; redondeo half-up de la línea al centavo.
export function total(quantity: string, unitPriceCents: number): number {
  if (!/^\d{1,7}(\.\d{1,3})?$/.test(quantity))
    throw new Error(validationText.invalidQuantity);
  const [whole, fraction = ""] = quantity.split(".");
  const q = BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0"));
  const result = Number((q * BigInt(unitPriceCents) + 500n) / 1000n);
  if (
    !Number.isSafeInteger(result) ||
    result > appConfig.validation.maxAmountCents
  )
    throw new Error(validationText.amountLimitExceeded);
  return result;
}
