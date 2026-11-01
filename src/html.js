export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function inline(value) {
  const escaped = escapeHtml(value);
  // Match both forms in one pass so code and generated HTML are never parsed again.
  return escaped.replace(/`([^`]+)`|\[([^\]]+)\]\(([^\s)]+)\)/g, (match, code, label, url) => {
    if (code !== undefined) return `<code>${code}</code>`;
    if (/^(?:[a-z][a-z0-9+.-]*:)/i.test(url) && !/^(?:https?:|mailto:)/i.test(url)) return match;
    return `<a href="${url}">${label}</a>`;
  });
}
