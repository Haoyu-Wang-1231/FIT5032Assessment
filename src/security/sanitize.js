
export function normalizeSafe(str = '') {
  try {
    return String(str).normalize('NFKC').replace(/[\u0000-\u001F\u007F]/g, '');
  } catch {
    return String(str).replace(/[\u0000-\u001F\u007F]/g, '');
  }
}

export function sanitizePlainText(str = '', maxLen = 1000) {
  let s = normalizeSafe(str)
    .replace(/<[^>]*>/g, '') 
    .replace(/javascript:|data:text\/html|vbscript:|on\w+\s*=/gi, '') 
    .replace(/\s+/g, ' ') 
    .trim();
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export function escapeHtml(str = '') {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  return String(str).replace(/[&<>"'\/]/g, ch => map[ch]);
}

export function safeHref(u, hosts = ['your-domain.com', 'firebasestorage.googleapis.com']) {
  try {
    const url = new URL(String(u));
    if (url.protocol !== 'https:') return '#';
    if (!hosts.includes(url.hostname)) return '#';
    return url.toString();
  } catch {
    return '#';
  }
}