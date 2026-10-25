import { Prisma, PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import {
  OTP_ISSUE_WINDOW_MS, OTP_MAX_ISSUES_PER_WINDOW, OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS, PendingAuth, generateCode, hashCode,
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
      where: { userId, createdAt: { lt: new Date(now.getTime() - OTP_ISSUE_WINDOW_MS) } },
    });
    const recent = await tx.token.findMany({
      where: { userId }, orderBy: { createdAt: "desc" }, select: { createdAt: true },
    });
    if (recent.length >= OTP_MAX_ISSUES_PER_WINDOW ||
        (recent[0] && now.getTime() - recent[0].createdAt.getTime() < OTP_RESEND_COOLDOWN_MS)) {
      return null;
    }
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
    // Retain exhausted/consumed records for the issuance window, so successful
    // logins and failed delivery cannot reset the mail/guess budget.
    await tx.token.updateMany({
      where: { id: token.id },
      data: { attempts: matches ? OTP_MAX_ATTEMPTS : token.attempts + 1 },
    });
    return matches;
  });
}
