/**
 * Utility functions for safe number conversion and formatting
 */

/**
 * Safely converts a value to number, handling string concatenation issues
 * @param value - The value to convert
 * @param defaultValue - Default value if conversion fails
 * @returns A valid number
 */
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  // If already a number, return it
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  // Convert string to number
  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal point and minus sign
    const cleanValue = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? defaultValue : num;
  }
  
  // Try direct conversion
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Formats a number for display, avoiding scientific notation
 * @param value - The number to format
 * @param locale - Locale for formatting (default: 'vi-VN')
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export const formatNumber = (
  value: any, 
  locale: string = 'vi-VN', 
  options?: Intl.NumberFormatOptions
): string => {
  const num = safeNumber(value);
  
  // Handle very large numbers to avoid scientific notation
  if (Math.abs(num) >= 1e15) {
    return num.toLocaleString(locale, { 
      maximumFractionDigits: 0,
      ...options 
    });
  }
  
  return num.toLocaleString(locale, options);
};

/**
 * Formats currency for display
 * @param value - The number to format
 * @param currency - Currency code (default: 'VND')
 * @param locale - Locale for formatting (default: 'vi-VN')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: any, 
  currency: string = 'VND', 
  locale: string = 'vi-VN'
): string => {
  const num = safeNumber(value);
  
  // Handle very large numbers
  if (Math.abs(num) >= 1e15) {
    return `₫${num.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Calculates percentage safely
 * @param numerator - The numerator
 * @param denominator - The denominator
 * @param decimals - Number of decimal places (default: 1)
 * @returns Percentage as number
 */
export const safePercentage = (
  numerator: any, 
  denominator: any, 
  decimals: number = 1
): number => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  
  if (den === 0) {
    return 0;
  }
  
  return Number(((num / den) * 100).toFixed(decimals));
};

/**
 * Calculates ratio safely
 * @param numerator - The numerator
 * @param denominator - The denominator
 * @param decimals - Number of decimal places (default: 2)
 * @returns Ratio as number
 */
export const safeRatio = (
  numerator: any, 
  denominator: any, 
  decimals: number = 2
): number => {
  const num = safeNumber(numerator);
  const den = safeNumber(denominator);
  
  if (den === 0) {
    return 0;
  }
  
  return Number((num / den).toFixed(decimals));
};




