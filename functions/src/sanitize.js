export function normalizeSafe(str = '') {
  try {
    return String(str).normalize('NFKC').replace(/[\u0000-\u001F\u007F]/g, '');
  } catch {
    return String(str).replace(/[\u0000-\u001F\u007F]/g, '');
  }
}

export function sanitizePlainText(str = '', maxLen = 250) {
  let output = normalizeSafe(str)
    .replace(/<[^>]*>/g, '') 
    .replace(/javascript:|data:text\/html|vbscript:|on\w+\s*=/gi, '') 
    .replace(/\s+/g, ' ') 
    .trim();
  if (output.length > maxLen){
    output = output.slice(0, maxLen);
  } 
  return output;
}