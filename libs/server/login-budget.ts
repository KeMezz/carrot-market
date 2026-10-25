import { Prisma, PrismaClient } from "@prisma/client";
import { createHmac } from "crypto";

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
export const LOGIN_LIMITS = { globalMinute: 10, globalHour: 100, globalDay: 500, ipTenMinutes: 5, ipDay: 30 };
type Event = { at: number; ip: string };

// A single bounded row serializes all replicas. At most 500 events/24h, no
// attacker-controlled rate-limit rows. No email key: knowing a victim address
// cannot reserve that person's private issuance slots. IPs are keyed HMACs.
export async function reserveLoginDelivery(db: PrismaClient, ip: string) {
  const key = process.env.OTP_SECRET ?? process.env.SESSION_PW;
  if (!key || key.length < 32) throw new Error("Login secret is not configured");
  const ipHash = createHmac("sha256", key).update(`login-ip:${ip}`).digest("hex");
  return db.$transaction(async tx => {
    await tx.$executeRaw`INSERT INTO "LoginBudget" (id, events) VALUES (1, '[]'::jsonb) ON CONFLICT (id) DO NOTHING`;
    const [row] = await tx.$queryRaw<{ events: Prisma.JsonValue }[]>`SELECT events FROM "LoginBudget" WHERE id = 1 FOR UPDATE`;
    const [clock] = await tx.$queryRaw<{ now: Date }[]>`SELECT clock_timestamp() AS now`;
    const now = clock.now.getTime();
    if (!Array.isArray(row.events) || row.events.some(e => !e || typeof e !== "object" || Array.isArray(e) ||
      typeof e.at !== "number" || !Number.isFinite(e.at) || typeof e.ip !== "string")) throw new Error("Invalid login budget");
    const events = (row.events as Event[]).filter(e => e.at > now - DAY);
    // Future events remain counted on DB clock rollback; do not free a budget.
    const own = events.filter(e => e.ip === ipHash);
    if (events.length >= LOGIN_LIMITS.globalDay ||
        events.filter(e => e.at > now - 60 * MINUTE).length >= LOGIN_LIMITS.globalHour ||
        events.filter(e => e.at > now - MINUTE).length >= LOGIN_LIMITS.globalMinute ||
        own.length >= LOGIN_LIMITS.ipDay ||
        own.filter(e => e.at > now - 10 * MINUTE).length >= LOGIN_LIMITS.ipTenMinutes) return false;
    events.push({ at: now, ip: ipHash });
    await tx.loginBudget.update({ where: { id: 1 }, data: { events } });
    return true;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, maxWait: 10_000, timeout: 10_000 });
}
