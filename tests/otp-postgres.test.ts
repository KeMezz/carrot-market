import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { issueLoginCode, consumeLoginCode } from "../libs/server/otp-store";
import { OTP_MAX_ATTEMPTS, OTP_MAX_ISSUES_PER_WINDOW, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "../libs/server/otp";

// Never fall back to DATABASE_URL. The opt-in database MUST be disposable local
// PostgreSQL. A random schema isolates this suite even from other local tests.
const localUrl = process.env.LOCAL_OTP_TEST_DATABASE_URL;
if (localUrl) {
  const url = new URL(localUrl);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      url.pathname !== "/carrot_otp_test" || !url.port || url.port === "5432") {
    throw new Error("OTP database tests require disposable loopback carrot_otp_test on a non-default port");
  }
}
const schema = `otp_test_${randomUUID().replace(/-/g, "")}`;
const url = new URL(localUrl ?? "postgresql://test:test@127.0.0.1:1/carrot_otp_test");
url.searchParams.set("schema", schema);
url.searchParams.set("connection_limit", "25");
const db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
let userId: number;
const suite = localUrl ? describe : describe.skip;

suite("OTP transactions on disposable local PostgreSQL", () => {
  beforeAll(async () => {
    await db.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    // Minimal test fixtures only: no application migration or seed command runs.
    await db.$executeRawUnsafe(`CREATE TABLE "${schema}"."User" (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE, phone TEXT UNIQUE,
      avatar TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await db.$executeRawUnsafe(`CREATE TABLE "${schema}"."Token" (
      id SERIAL PRIMARY KEY, payload TEXT NOT NULL UNIQUE, attempts INTEGER NOT NULL DEFAULT 0,
      "userId" INTEGER NOT NULL REFERENCES "${schema}"."User"(id) ON DELETE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    userId = (await db.user.create({ data: { name: "test", email: "otp@example.test" } })).id;
  });
  beforeEach(async () => { await db.token.deleteMany(); });
  afterAll(async () => {
    await db.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    await db.$disconnect();
  });

  it("creates one token for 20 simultaneous issue requests", async () => {
    const issued = await Promise.all(Array.from({ length: 20 }, () => issueLoginCode(db, userId)));
    expect(issued.filter(Boolean)).toHaveLength(1);
    expect(await db.token.count()).toBe(1);
  });

  it("does not exceed the rolling cap when requests race near the limit", async () => {
    const now = Date.now();
    for (let i = 0; i < OTP_MAX_ISSUES_PER_WINDOW - 1; i++) {
      await db.token.create({ data: {
        userId, payload: randomUUID(), attempts: OTP_MAX_ATTEMPTS,
        createdAt: new Date(now - (i + 2) * OTP_RESEND_COOLDOWN_MS),
      } });
    }
    const issued = await Promise.all(Array.from({ length: 20 }, () => issueLoginCode(db, userId)));
    expect(issued.filter(Boolean)).toHaveLength(1);
    expect(await db.token.count()).toBe(OTP_MAX_ISSUES_PER_WINDOW);
  });

  it("caps parallel wrong guesses and rejects the correct code after exhaustion", async () => {
    const issued = (await issueLoginCode(db, userId))!;
    const wrong = issued.code === "111111" ? "222222" : "111111";
    const results = await Promise.all(Array.from({ length: 20 }, () => consumeLoginCode(db, issued.pending, wrong)));
    expect(results.some(Boolean)).toBe(false);
    expect((await db.token.findUniqueOrThrow({ where: { id: issued.pending.tokenId } })).attempts).toBe(OTP_MAX_ATTEMPTS);
    expect(await consumeLoginCode(db, issued.pending, issued.code)).toBe(false);
  });

  it("allows exactly one correct concurrent consumption and retains issuance history", async () => {
    const issued = (await issueLoginCode(db, userId))!;
    const results = await Promise.all(Array.from({ length: 20 }, () => consumeLoginCode(db, issued.pending, issued.code)));
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await db.token.count()).toBe(1);
    expect(await issueLoginCode(db, userId)).toBeNull();
  });

  it("enforces expiry using the database clock", async () => {
    const issued = (await issueLoginCode(db, userId))!;
    const old = new Date(Date.now() - OTP_TTL_MS - 1000);
    await db.token.update({ where: { id: issued.pending.tokenId }, data: { createdAt: old } });
    issued.pending.issuedAt = old.getTime();
    expect(await consumeLoginCode(db, issued.pending, issued.code)).toBe(false);
  });

  it("does not let a second browser exhaust the first browser's token", async () => {
    const owner = (await issueLoginCode(db, userId))!;
    // Move the first issue outside the cooldown without waiting a real minute.
    const older = new Date(owner.pending.issuedAt - OTP_RESEND_COOLDOWN_MS - 1000);
    await db.token.update({ where: { id: owner.pending.tokenId }, data: { createdAt: older } });
    owner.pending.issuedAt = older.getTime();
    const other = (await issueLoginCode(db, userId))!;
    const wrong = other.code === "111111" ? "222222" : "111111";
    await Promise.all(Array.from({ length: 20 }, () => consumeLoginCode(db, other.pending, wrong)));
    expect(await consumeLoginCode(db, owner.pending, owner.code)).toBe(true);
  });

  it("reads the clock after waiting for the identity lock", async () => {
    const issued = (await issueLoginCode(db, userId))!;
    const almostExpired = new Date(Date.now() - OTP_TTL_MS + 750);
    await db.token.update({ where: { id: issued.pending.tokenId }, data: { createdAt: almostExpired } });
    issued.pending.issuedAt = almostExpired.getTime();
    let locked!: () => void;
    const acquired = new Promise<void>((resolve) => { locked = resolve; });
    const blocker = db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
      locked();
      await tx.$queryRaw`SELECT pg_sleep(1.1)::text`;
    });
    await acquired;
    const result = consumeLoginCode(db, issued.pending, issued.code);
    await blocker;
    expect(await result).toBe(false);
  });
});
