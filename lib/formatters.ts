/**
 * Formatting utilities for currency, percentages, and numbers
 */

/**
 * Format a number as currency (Vietnamese Dong)
 */
export function formatCurrency(amount: number, locale: string = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a decimal as a percentage
 */
export function formatPercentage(decimal: number, decimals: number = 1): string {
  return `${(decimal * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format duration in years and months (Vietnamese)
 */
export function formatDuration(years: number, months: number): string {
  if (!Number.isFinite(years) || !Number.isFinite(months)) {
    return 'Chưa đạt được trong phạm vi tính toán';
  }

  const parts: string[] = [];
  
  if (years > 0) {
    parts.push(`${years} năm`);
  }
  
  if (months > 0) {
    parts.push(`${months} tháng`);
  }
  
  if (parts.length === 0) {
    return 'Đã đạt được!';
  }
  
  return parts.join(' và ');
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
}

/**
 * Parse percentage string to decimal
 */
export function parsePercentage(value: string): number {
  const num = parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
  return num / 100;
}
