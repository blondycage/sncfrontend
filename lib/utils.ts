import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Currency symbol mapping
 */
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  TRY: '₺'
};

/**
 * Format price with currency symbol
 * @param price - The price to format
 * @param currency - Currency code (USD, EUR, GBP, TRY). Defaults to USD if not provided
 * @param frequency - Optional pricing frequency (e.g., 'month', 'week', 'day')
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(price: number, currency: string = 'USD', frequency?: string): string {
  const symbol = currencySymbols[currency] || '$';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);

  const priceString = `${symbol}${formattedPrice}`;

  return frequency ? `${priceString}/${frequency}` : priceString;
}

/**
 * Get currency symbol from currency code
 * @param currency - Currency code (USD, EUR, GBP, TRY)
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  return currencySymbols[currency] || '$';
}
