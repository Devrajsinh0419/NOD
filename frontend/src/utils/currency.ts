// Currency Converter and Formatter Utility
import { authService } from "@/services/auth.service";

// Curated static exchange rates (with USD as the base currency)
// Rates are snapshots, ensuring instant local conversions without external API failures.
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 83.5, // 1 USD = 83.5 INR
  EUR: 0.92, // 1 USD = 0.92 EUR
  GBP: 0.79, // 1 USD = 0.79 GBP
  AUD: 1.51, // 1 USD = 1.51 AUD
  CAD: 1.37, // 1 USD = 1.37 CAD
};

/**
 * Get the currently logged-in user's preferred currency.
 * Defaults to "USD" if not authenticated or not set.
 */
export function getUserCurrency(): string {
  const user = authService.getStoredUser();
  return (user?.currency || "USD").toUpperCase();
}

/**
 * Convert an amount from one currency to another.
 * @param amount Amount to convert
 * @param from Source currency code (e.g. "USD")
 * @param to Target currency code (e.g. "INR")
 */
export function convertCurrency(
  amount: number | string,
  from: string = "USD",
  to: string = "USD"
): number {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 0;

  const fromCode = (from || "USD").toUpperCase();
  const toCode = (to || "USD").toUpperCase();

  if (fromCode === toCode) return numAmount;

  const rateFrom = EXCHANGE_RATES[fromCode] || 1.0;
  const rateTo = EXCHANGE_RATES[toCode] || 1.0;

  // Convert first to base (USD), then to target
  const amountInUSD = numAmount / rateFrom;
  return amountInUSD * rateTo;
}

/**
 * Formats a given amount into the specified target currency.
 * Automatically converts the amount from the source currency to the target currency first.
 */
export function formatCurrency(
  amount: number | string,
  from: string = "USD",
  to: string = "USD"
): string {
  const targetCode = (to || "USD").toUpperCase();
  const converted = convertCurrency(amount, from, targetCode);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: targetCode,
      maximumFractionDigits: 0,
    }).format(converted);
  } catch {
    return `${targetCode} ${converted.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;
  }
}

/**
 * Helper to convert and format any amount directly to the user's preferred currency.
 * Assumes the source currency is "USD" if not specified.
 */
export function formatToUserCurrency(
  amount: number | string,
  from: string = "USD"
): string {
  const userCurrency = getUserCurrency();
  return formatCurrency(amount, from, userCurrency);
}
