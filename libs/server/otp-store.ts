import { Prisma, PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import {
  OTP_TTL_MS, OTP_MAX_ATTEMPTS, PendingAuth, generateCode, hashCode,
  codeMatches, isExpired,
} from "./otp";

// All issuance, attempts and consumption for an identity take the same durable
// PostgreSQL row lock. ReadCommitted makes reads after lock acquisition see the
// preceding transaction's writes. No network calls occur inside this transaction.
async function withIdentityLock<T>(
  db: PrismaClient, userId: number,
  action: (tx: Prisma.TransactionClient, now: Date) => Promise<T>
): Promise<T> {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    // Read the DB clock AFTER waiting for the lock (not transaction-start now()).
    const [clock] = await tx.$queryRaw<{ now: Date }[]>`SELECT clock_timestamp() AS now`;
    return action(tx, clock.now);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, maxWait: 10_000, timeout: 10_000 });
}

export async function issueLoginCode(db: PrismaClient, userId: number) {
  return withIdentityLock(db, userId, async (tx, now) => {
    await tx.token.deleteMany({
      where: { userId, createdAt: { lt: new Date(now.getTime() - OTP_TTL_MS) } },
    });
    const code = generateCode();
    const binding = randomBytes(32).toString("hex");
    const token = await tx.token.create({
      data: { userId, payload: hashCode(userId, binding, code), createdAt: now },
      select: { id: true },
    });
    return { code, pending: { userId, tokenId: token.id, binding, issuedAt: now.getTime() } };
  });
}

export async function consumeLoginCode(db: PrismaClient, pending: PendingAuth, code: string) {
  return withIdentityLock(db, pending.userId, async (tx, now) => {
    const token = await tx.token.findFirst({
      where: { id: pending.tokenId, userId: pending.userId },
    });
    if (!token || token.createdAt.getTime() !== pending.issuedAt ||
        isExpired(token.createdAt, now.getTime())) return false;
    if (token.attempts >= OTP_MAX_ATTEMPTS) return false;

    const matches = codeMatches(pending.userId, pending.binding, code, token.payload);
    // Retain exhausted/consumed records until expiry. Sending limits are
    // reserved separately and never reset by login, cookie rotation or failure.
    await tx.token.updateMany({
      where: { id: token.id },
      data: { attempts: matches ? OTP_MAX_ATTEMPTS : token.attempts + 1 },
    });
    return matches;
  });
}
