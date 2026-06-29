/**
 * Standardized Formatting Utilities for EduDash
 * Ensures consistent output across all languages.
 */

/**
 * Formats a date object or string into a standard localized string.
 * Example (en): 27 June 2026
 * Example (hi): 27 जून 2026
 * @param {Date|string} date 
 * @param {string} lang 'en' or 'hi'
 * @returns {string}
 */
export const formatDate = (date, lang = "en") => {
  if (!date) return "";
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch (e) {
    return String(date);
  }
};

/**
 * Formats a date object or string into a standard localized time string.
 * Example (en): 10:30 AM
 * @param {Date|string} date 
 * @param {string} lang 
 * @returns {string}
 */
export const formatTime = (date, lang = "en") => {
  if (!date) return "";
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(date));
  } catch (e) {
    return String(date);
  }
};

/**
 * Formats a number into a localized currency string (INR).
 * Example: ₹10,500.00
 * @param {number} amount 
 * @param {string} lang 
 * @returns {string}
 */
export const formatCurrency = (amount, lang = "en") => {
  if (amount === undefined || amount === null) return "";
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a decimal into a percentage.
 * Example: 0.85 -> 85%
 * @param {number} value 
 * @param {string} lang 
 * @returns {string}
 */
export const formatPercentage = (value, lang = "en") => {
  if (value === undefined || value === null) return "";
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
};
