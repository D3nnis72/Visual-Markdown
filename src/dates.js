export const STALE_DAYS = 7;
const months = {
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const shortMonths = {
  de: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

/** Returns the calendar date of a YYYY-MM-DD value, or null for anything else. */
export function parseDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
  return { year, month, day, timestamp };
}

export function formatDate(date, lang, { short = false, today = null } = {}) {
  const language = lang === 'en' ? 'en' : 'de';
  if (!short) return `${date.day}${language === 'de' ? '.' : ''} ${months[language][date.month - 1]} ${date.year}`;
  const name = shortMonths[language][date.month - 1];
  const otherYear = today && today.getFullYear() !== date.year;
  if (language === 'en') return `${name} ${date.day}${otherYear ? `, ${date.year}` : ''}`;
  return `${date.day}. ${name}${otherYear ? ` ${date.year}` : ''}`;
}

export function isStale(date, today) {
  return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - date.timestamp > STALE_DAYS * 86400000;
}
