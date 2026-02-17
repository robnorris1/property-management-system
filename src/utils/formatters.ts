/**
 * Utility functions for formatting data in the property management application
 */

/**
 * Formats a number as currency (USD)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

/**
 * Formats a value as a percentage with one decimal place
 * @param value - The value to format (can be any type)
 * @returns Formatted percentage string or 'N/A' for invalid values
 */
export const formatPercentage = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    const numValue = Number(value);
    if (isNaN(numValue)) return 'N/A';
    return `${numValue.toFixed(1)}%`;
};

/**
 * Formats a date string for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Gets the abbreviated month name from a month number
 * @param monthNum - Month number as string (1-12)
 * @returns Abbreviated month name
 */
export const getMonthName = (monthNum: string): string => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[parseInt(monthNum) - 1] || 'Unknown';
};

/**
 * Safely multiplies two values, handling null/undefined cases
 * @param a - First value
 * @param b - Second value
 * @returns Product of the values, or null if either is null/undefined
 */
export const safeMultiply = (a: number | null | undefined, b: number): number | null => {
    if (a === null || a === undefined) return null;
    return a * b;
};