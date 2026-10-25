import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { issueLoginCode, consumeLoginCode } from "../libs/server/otp-store";
import { reserveLoginDelivery, LOGIN_LIMITS } from "../libs/server/login-budget";
import { findLoginUser } from "../libs/server/login-identity";
import { createReq, createRes } from "./fake-prisma";
import { OTP_MAX_ATTEMPTS, OTP_TTL_MS } from "../libs/server/otp";

// Never fall back to DATABASE_URL. The opt-in database MUST be disposable local
// PostgreSQL. A random schema isolates this suite even from other local tests.
const localUrl = process.env.LOCAL_OTP_TEST_DATABASE_URL;
if (!localUrl && (process.env.CI || process.env.REQUIRE_LOCAL_OTP_TESTS)) throw new Error("Local PostgreSQL tests are mandatory in CI");
if (localUrl) {
  const url = new URL(localUrl);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      url.pathname !== "/carrot_otp_test" || !url.port || url.port === "5432" || url.search !== "") {
    throw new Error("OTP database tests require disposable loopback carrot_otp_test on a non-default port");
  }
}
const schema = `otp_test_${randomUUID().replace(/-/g, "")}`;
const url = new URL(localUrl ?? "postgresql://test:test@127.0.0.1:1/carrot_otp_test");
url.searchParams.set("schema", schema);
url.searchParams.set("connection_limit", "25");
const db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
const sent: any[] = [];
vi.mock("@libs/server/client", () => ({ default: new Proxy({}, { get: (_target, key) => {
  const value = (db as any)[key]; return typeof value === "function" ? value.bind(db) : value;
} }) }));
vi.mock("@libs/server/withSession", () => ({ withApiSession: (fn: unknown) => fn }));
vi.mock("@libs/server/email", () => ({ default: { sendMail: async (mail: any) => { sent.push(mail); } } }));
const { default: enter } = await import("../pages/api/users/enter");
const { default: confirm } = await import("../pages/api/users/confirm");
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
    await db.$executeRawUnsafe(`CREATE TABLE "${schema}"."LoginBudget" (id INTEGER PRIMARY KEY CHECK (id = 1), events JSONB NOT NULL)`);
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX "User_email_lower_key" ON "${schema}"."User" (lower(email)) WHERE email IS NOT NULL`);
    userId = (await db.user.create({ data: { name: "test", email: "otp@example.test" } })).id;
  });
  beforeEach(async () => {
    await db.token.deleteMany(); await db.loginBudget.deleteMany(); sent.length = 0;
    vi.stubEnv("OTP_IP_SOURCE", "socket");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "unit-test-config-not-a-real-key");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "unit-test-public-key");
    vi.stubEnv("TURNSTILE_HOSTNAME", "carrot.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, hostname: "carrot.example.test", action: "login" }) }));
  });
  afterAll(async () => {
    await db.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    await db.$disconnect();
    vi.unstubAllEnvs(); vi.unstubAllGlobals();
  });

  it("issues independently per browser, without address-slot starvation", async () => {
    const issued = await Promise.all(Array.from({ length: 20 }, () => issueLoginCode(db, userId)));
    expect(issued.filter(Boolean)).toHaveLength(20);
    expect(await db.token.count()).toBe(20);
    expect(await consumeLoginCode(db, issued[0].pending, issued[0].code)).toBe(true);
  });

  it("caps parallel wrong guesses and rejects the correct code after exhaustion", async () => {
    const issued = (await issueLoginCode(db, userId))!;
    const wrong = issued.code === "AAAAAAAAAAAA" ? "BBBBBBBBBBBB" : "AAAAAAAAAAAA";
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
    expect(await issueLoginCode(db, userId)).toBeTruthy();
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
    const older = new Date(owner.pending.issuedAt - 60_000 - 1000);
    await db.token.update({ where: { id: owner.pending.tokenId }, data: { createdAt: older } });
    owner.pending.issuedAt = older.getTime();
    const other = (await issueLoginCode(db, userId))!;
    const wrong = other.code === "AAAAAAAAAAAA" ? "BBBBBBBBBBBB" : "AAAAAAAAAAAA";
    await Promise.all(Array.from({ length: 20 }, () => consumeLoginCode(db, other.pending, wrong)));
    expect(await consumeLoginCode(db, owner.pending, owner.code)).toBe(true);
  });

  it("uses DB time despite application clock skew during issue and confirmation", async () => {
    const realNow = Date.now();
    // Fake Date only, leaving real timers/Prisma I/O intact.
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(realNow + 24 * 60 * 60_000);
      const issued = await issueLoginCode(db, userId);
      expect(Math.abs(issued.pending.issuedAt - realNow)).toBeLessThan(10_000);
      vi.setSystemTime(realNow - 24 * 60 * 60_000);
      expect(await consumeLoginCode(db, issued.pending, issued.code)).toBe(true);
    } finally { vi.useRealTimers(); }
  });

  it("serializes global and IP admission before writing accounts or sending mail", async () => {
    const results = await Promise.all(Array.from({ length: 20 }, () => reserveLoginDelivery(db, "192.0.2.1")));
    expect(results.filter(Boolean)).toHaveLength(LOGIN_LIMITS.ipTenMinutes);
    await db.loginBudget.deleteMany();
    const global = await Promise.all(Array.from({ length: 20 }, (_, i) => reserveLoginDelivery(db, `192.0.2.${i}`)));
    expect(global.filter(Boolean)).toHaveLength(LOGIN_LIMITS.globalMinute);
    expect(await db.loginBudget.count()).toBe(1);
    expect((await db.loginBudget.findUniqueOrThrow({ where: { id: 1 } })).events).toHaveLength(10);
  });

  it("enforces the hourly and daily global caps concurrently", async () => {
    const [clock] = await db.$queryRaw<{ now: Date }[]>`SELECT clock_timestamp() AS now`;
    for (const [cap, age] of [[LOGIN_LIMITS.globalHour, 2 * 60_000], [LOGIN_LIMITS.globalDay, 2 * 60 * 60_000]]) {
      await db.loginBudget.deleteMany();
      await db.loginBudget.create({ data: { id: 1, events: Array.from({ length: cap - 1 }, () => ({ at: clock.now.getTime() - age, ip: "other" })) } });
      const results = await Promise.all(Array.from({ length: 20 }, (_, i) => reserveLoginDelivery(db, `192.0.2.${i}`)));
      expect(results.filter(Boolean)).toHaveLength(1);
      expect((await db.loginBudget.findUniqueOrThrow({ where: { id: 1 } })).events).toHaveLength(cap);
    }
  });

  it("retains IP daily history, prunes expired events, and uses DB time despite skew", async () => {
    expect(await reserveLoginDelivery(db, "192.0.2.1")).toBe(true);
    const row = await db.loginBudget.findUniqueOrThrow({ where: { id: 1 } });
    const event = (row.events as any[])[0];
    await db.loginBudget.update({ where: { id: 1 }, data: { events: [
      ...Array.from({ length: LOGIN_LIMITS.ipDay }, () => ({ ...event, at: event.at - 2 * 60 * 60_000 })),
      { at: event.at - 25 * 60 * 60_000, ip: "expired" },
    ] } });
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(event.at + 7 * 24 * 60 * 60_000);
      expect(await reserveLoginDelivery(db, "192.0.2.1")).toBe(false);
      expect(await reserveLoginDelivery(db, "192.0.2.2")).toBe(true);
      const events = (await db.loginBudget.findUniqueOrThrow({ where: { id: 1 } })).events as any[];
      expect(events).toHaveLength(LOGIN_LIMITS.ipDay + 1);
      expect(Math.abs(events.at(-1).at - event.at)).toBeLessThan(10_000);
    } finally { vi.useRealTimers(); }
  });

  it("rejects legacy case collisions without selecting or merging either account", async () => {
    await db.$executeRawUnsafe(`DROP INDEX "${schema}"."User_email_lower_key"`);
    const lower = await db.user.create({ data: { name: "lower", email: "collision@example.test" } });
    const upper = await db.user.create({ data: { name: "upper", email: "COLLISION@example.test" } });
    try {
      expect(await findLoginUser(db, "collision@example.test")).toBeNull();
      await expect(db.$executeRawUnsafe(`CREATE UNIQUE INDEX "User_email_lower_key" ON "${schema}"."User" (lower(email)) WHERE email IS NOT NULL`)).rejects.toThrow();
    } finally {
      await db.user.deleteMany({ where: { id: { in: [lower.id, upper.id] } } });
      await db.$executeRawUnsafe(`CREATE UNIQUE INDEX "User_email_lower_key" ON "${schema}"."User" (lower(email)) WHERE email IS NOT NULL`);
    }
    const users = await Promise.all(Array.from({ length: 20 }, () => findLoginUser(db, "concurrent@example.test")));
    expect(new Set(users.map(user => user!.id)).size).toBe(1);
  });

  it("integrates real enter/confirm handlers, challenge gate, budget, identity and PG tokens", async () => {
    const before = await db.user.count();
    const request = (email: string, ip: string) => {
      const req = createReq({ body: { email, challenge: "unit-token" } }); req.socket.remoteAddress = ip; return req;
    };
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    let res = createRes(); await enter(request("blocked@example.test", "192.0.2.1"), res);
    expect(res.statusCode).toBe(503); expect(await db.user.count()).toBe(before);
    expect(await db.loginBudget.count()).toBe(0); expect(sent).toHaveLength(0);
    vi.stubEnv("TURNSTILE_SECRET_KEY", "unit-test-config-not-a-real-key");
    for (let i = 0; i < 5; i++) { res = createRes(); await enter(request("victim@example.test", "192.0.2.1"), res); expect(res.statusCode).toBe(200); }
    res = createRes(); await enter(request("never-created@example.test", "192.0.2.1"), res);
    expect(res.statusCode).toBe(429); expect(await db.user.count()).toBe(before + 1);
    const owner = request("Victim@EXAMPLE.TEST", "192.0.2.2"); res = createRes(); await enter(owner, res);
    expect(res.statusCode).toBe(200); expect(sent).toHaveLength(6);
    expect(await db.user.count()).toBe(before + 1);
    expect(sent[5].to).toEqual({ address: "victim@example.test", name: "" });
    const code = sent[5].text.match(/[A-HJ-NP-Z2-9]{12}/)[0];
    owner.body = { token: code }; res = createRes(); await confirm(owner, res);
    expect(res.statusCode).toBe(200); expect(owner.session.user.id).toBeTruthy();
    expect(await db.token.count()).toBe(6);
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
