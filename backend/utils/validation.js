export function cleanText(value, maxLength = 1000) {
  return String(value || '').trim().slice(0, maxLength);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value || '').trim());
}

export function isValidHttpUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function parseTextArray(value, fallback = []) {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) return value.map((item) => cleanText(item, 80)).filter(Boolean);

  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error('Expected an array');
  return parsed.map((item) => cleanText(item, 80)).filter(Boolean);
}

export function isStrongPassword(value) {
  const password = String(value || '');
  return password.length >= 8
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}
