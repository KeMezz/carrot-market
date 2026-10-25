import { NextApiRequest } from "next";
import { isIP } from "net";

export function loginClientIp(req: NextApiRequest): string | null {
  // Explicit deployment contract. Never trust arbitrary forwarding headers.
  // Vercel overwrites x-vercel-forwarded-for; direct origin access must be closed.
  let value: unknown;
  if (process.env.OTP_IP_SOURCE === "vercel" && process.env.VERCEL === "1") {
    value = req.headers["x-vercel-forwarded-for"];
  } else if (process.env.OTP_IP_SOURCE === "socket") {
    // For direct connections only. A reverse proxy's address shares one budget.
    value = req.socket?.remoteAddress;
  }
  if (typeof value !== "string" || !isIP(value)) return null;
  // Canonicalize IPv6 spelling and mapped IPv4 so equivalent IPs share a budget.
  if (isIP(value) === 4) return value;
  const canonical = new URL(`http://[${value}]/`).hostname;
  const mapped = /^\[::ffff:([0-9a-f]+):([0-9a-f]+)\]$/.exec(canonical);
  if (mapped) {
    const high = parseInt(mapped[1], 16), low = parseInt(mapped[2], 16);
    return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
  }
  return canonical;
}

export async function verifyLoginChallenge(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const hostname = process.env.TURNSTILE_HOSTNAME;
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!secret || !hostname || !sitekey || /^[123]x0{8,}/.test(secret) || /^[123]x0{8,}/.test(sitekey) || typeof token !== "string" || !token || token.length > 2048) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip.replace(/^\[|\]$/g, "") }),
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result?.success === true && result.hostname === hostname && result.action === "login";
  } catch { return false; } finally { clearTimeout(timeout); }
}
