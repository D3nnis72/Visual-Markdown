// The MPE parser runs in QuickJS without Intl, so numbers are formatted by hand.
const SEPARATORS = { de: { decimal: ',', thousands: '.' }, en: { decimal: '.', thousands: ',' } };

export function formatNumber(value, lang, decimals = 2) {
  const { decimal, thousands } = SEPARATORS[lang] ?? SEPARATORS.de;
  const fixed = Math.abs(value).toFixed(decimals).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  const [whole, fraction] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  return `${value < 0 ? '−' : ''}${grouped}${fraction ? decimal + fraction : ''}`;
}

export const formatPercent = (share, lang, decimals = 1) =>
  `${formatNumber(share * 100, lang, decimals)}${lang === 'en' ? '%' : ' %'}`;

export const formatSigned = (value, lang) => `${value > 0 ? '+' : ''}${formatNumber(value, lang)}`;
