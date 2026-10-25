import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_ISSUE_WINDOW_MS = 60 * 60 * 1000;
export const OTP_MAX_ISSUES_PER_WINDOW = 5;

function secret() {
  const key = process.env.OTP_SECRET ?? process.env.SESSION_PW;
  if (!key) throw new Error("OTP_SECRET or SESSION_PW must be set");
  return key;
}

export function generateCode() {
  return String(randomInt(100000, 1000000));
}

// DB가 유출되어도 6자리 코드를 오프라인으로 바로 복원할 수 없도록 HMAC으로 저장한다.
// userId를 포함하므로 서로 다른 사용자의 같은 코드가 payload @unique와 충돌하지 않는다.
export function hashCode(userId: number, code: string) {
  return createHmac("sha256", secret()).update(`${userId}:${code}`).digest("hex");
}

export function codeMatches(userId: number, code: string, storedHash: string) {
  const expected = Buffer.from(hashCode(userId, code), "hex");
  const actual = Buffer.from(storedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isExpired(createdAt: Date, now = Date.now()) {
  return now - createdAt.getTime() > OTP_TTL_MS;
}

export function isValidCodeFormat(code: unknown): code is string {
  return typeof code === "string" && /^\d{6}$/.test(code);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseIdentity(body: unknown) {
  const { phone, email } = (body ?? {}) as Record<string, unknown>;
  if (typeof phone === "string" && phone) {
    const value = phone.trim();
    return /^\d{8,15}$/.test(value) ? { phone: value } : null;
  }
  if (typeof email === "string" && email) {
    const value = email.trim();
    return value.length <= 254 && EMAIL_REGEX.test(value)
      ? { email: value }
      : null;
  }
  return null;
}
