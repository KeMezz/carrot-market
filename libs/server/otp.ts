import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
// A short rolling window bounds mail volume without an hour-long address lockout.
export const OTP_ISSUE_WINDOW_MS = 10 * 60 * 1000;
export const OTP_MAX_ISSUES_PER_WINDOW = 5;

export interface PendingAuth {
  userId: number;
  tokenId: number;
  binding: string;
  issuedAt: number;
}

function secret() {
  const key = process.env.OTP_SECRET ?? process.env.SESSION_PW;
  if (!key || key.length < 32) throw new Error("Login secret is not configured");
  return key;
}

export function generateCode() {
  return String(randomInt(100000, 1000000));
}

// A random browser binding keeps stored hashes distinct even if the same user
// receives identical digits twice. Confirmation selects the exact bound token.
export function hashCode(userId: number, binding: string, code: string) {
  return createHmac("sha256", secret())
    .update(`${userId}:${binding}:${code}`).digest("hex");
}

export function codeMatches(userId: number, binding: string, code: string, storedHash: string) {
  const expected = Buffer.from(hashCode(userId, binding, code), "hex");
  const actual = Buffer.from(storedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isExpired(createdAt: Date, now = Date.now()) {
  const age = now - createdAt.getTime();
  return age < 0 || age >= OTP_TTL_MS;
}

export function isValidPending(pending: unknown): pending is PendingAuth {
  if (!pending || typeof pending !== "object") return false;
  const p = pending as PendingAuth;
  return Number.isSafeInteger(p.userId) && p.userId > 0 &&
    Number.isSafeInteger(p.tokenId) && p.tokenId > 0 &&
    typeof p.binding === "string" && /^[a-f0-9]{64}$/.test(p.binding) &&
    Number.isSafeInteger(p.issuedAt) && p.issuedAt > 0;
}

export function isValidCodeFormat(code: unknown): code is string {
  return typeof code === "string" && /^\d{6}$/.test(code);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseIdentity(body: unknown): { email: string } | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { phone, email } = body as Record<string, unknown>;
  // Phone login is unsupported. Reject mixed requests too; never invoke SMS.
  if (phone !== undefined) return null;
  if (typeof email !== "string") return null;
  const value = email.trim();
  return value.length <= 254 && EMAIL_REGEX.test(value) ? { email: value } : null;
}
