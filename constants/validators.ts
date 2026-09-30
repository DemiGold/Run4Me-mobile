// constants/validators.ts
//
// Shared input validation + sanitizers.
// Used by Sign In, Customer Registration, Runner Registration.

// ─── Name ───
// Letters (incl. accented), spaces, hyphens, apostrophes.
// Allows: "Chinedu Okafor", "Mary-Jane O'Brien", "Àmìná Yusuf"
// Rejects: "Chinedu123", "   ", "X"
const NAME_RE = /^[A-Za-zÀ-ÿ]+(?:[ '-][A-Za-zÀ-ÿ]+)*$/;

export const isValidName = (v: string): boolean => {
  const trimmed = v.trim();
  if (trimmed.length < 3) return false;
  if (!NAME_RE.test(trimmed)) return false;
  // Must be at least 2 words (first + last name)
  return trimmed.split(/\s+/).length >= 2;
};

// Strip digits / punctuation as the user types. Collapse multi-spaces.
export const sanitizeName = (v: string): string =>
  v.replace(/[^A-Za-zÀ-ÿ '-]/g, '').replace(/\s{2,}/g, ' ');

// ─── Email ───
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const isValidEmail = (v: string): boolean => {
  const t = v.trim();
  if (t.length > 254) return false;
  return EMAIL_RE.test(t);
};

// ─── Phone (Nigerian) ───
// Accepts 0XXXXXXXXXX (11) or +234XXXXXXXXXX / 234XXXXXXXXXX (13).
export const isValidPhone = (v: string): boolean => {
  const d = v.replace(/\D/g, '');
  if (/^0\d{10}$/.test(d)) return true;
  if (/^234\d{10}$/.test(d)) return true;
  return false;
};

// Keep digits and an optional leading '+'. Cap at 14 chars.
export const sanitizePhone = (v: string): string => {
  const hasPlus = v.startsWith('+');
  const digits = v.replace(/\D/g, '').slice(0, 13);
  return hasPlus ? `+${digits}` : digits;
};