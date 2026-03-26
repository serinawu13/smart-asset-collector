/**
 * Currency conversion utilities
 * Handles currency formatting and conversion for the application
 */

// Exchange rates relative to USD (base currency)
// In a production app, these would be fetched from an API
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CHF: 0.88,
};

// Currency symbols
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CHF: 'CHF',
};

/**
 * Convert amount from USD to target currency
 */
export function convertCurrency(amountInUSD: number, targetCurrency: string): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return amountInUSD * rate;
}

/**
 * Format currency value with proper symbol and formatting
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const { minimumFractionDigits = 0, maximumFractionDigits = 0 } = options || {};
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Convert and format currency in one step
 */
export function convertAndFormatCurrency(
  amountInUSD: number,
  targetCurrency: string = 'USD',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const convertedAmount = convertCurrency(amountInUSD, targetCurrency);
  return formatCurrency(convertedAmount, targetCurrency, options);
}
