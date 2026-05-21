/**
 * Formats a Date object or string into a premium readable date/time string.
 * @param {Date|string|number} date The date input
 * @param {string} locale Default locale (en-US)
 * @returns {string} Readable Date/Time string
 */
export const formatDateTime = (date, locale = 'en-US') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Formats a date to ISO string for database compatibility.
 * @param {Date|string|number} date The date input
 * @returns {string} ISO Date string
 */
export const formatISO = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
};

export default {
  formatDateTime,
  formatISO,
};
