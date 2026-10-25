import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
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
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 symbols, 60 bits
  return Array.from({ length: 12 }, () => alphabet[randomInt(32)]).join("");
}

// A random browser binding keeps stored hashes distinct even if the same user
// receives an identical code twice. Confirmation selects the exact bound token.
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
  return typeof code === "string" && /^[A-HJ-NP-Z2-9]{12}$/.test(code);
}

// Deliberately support one ASCII dot-atom mailbox, not RFC display-name lists,
// comments, quoted local parts, Unicode or domain literals. Identity policy is
// case-insensitive for both local part and domain; provider aliases stay distinct.
export function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const value = input.trim().toLowerCase();
  if (value.length > 254 || !/^[\x21-\x7e]+$/.test(value)) return null;
  const parts = value.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || local.length > 64 || !/^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*$/.test(local)) return null;
  const labels = domain.split(".");
  if (labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return null;
  return value;
}

export function parseIdentity(body: unknown): { email: string } | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { phone, email } = body as Record<string, unknown>;
  if (phone !== undefined) return null;
  const normalized = normalizeEmail(email);
  return normalized ? { email: normalized } : null;
}
