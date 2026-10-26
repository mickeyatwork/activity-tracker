/**
 * Formats a date string (YYYY-MM-DD or ISO string) to UK style: DD/MM/YYYY
 * Avoiding timezone-shifting issues.
 */
export function formatDateUK(dateStr) {
  if (!dateStr) return '';
  
  // If in YYYY-MM-DD format
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [year, month, day] = dateStr.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Parses a UK formatted date string (DD/MM/YYYY) to YYYY-MM-DD format
 * Returns null if invalid
 */
export function parseDateUK(ukStr) {
  if (!ukStr || typeof ukStr !== 'string') return null;
  const match = ukStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;
  
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }
  
  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
