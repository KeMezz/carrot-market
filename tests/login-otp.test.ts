import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma, createReq, createRes } from "./fake-prisma";

const fake = createFakePrisma();
const sent: { to: { address: string; name: string }; text: string }[] = [];
const mail = { fail: false };

vi.mock("@libs/server/client", () => ({ default: fake.client }));
vi.mock("@libs/server/withSession", () => ({
  withApiSession: (fn: unknown) => fn,
}));
vi.mock("@libs/server/email", () => ({
  default: {
    sendMail: async (options: { to: { address: string; name: string }; text: string }) => {
      if (mail.fail) throw new Error("smtp down");
      sent.push(options);
    },
  },
}));

vi.mock("@libs/server/login-challenge", () => ({
  loginClientIp: (req: any) => req.socket.remoteAddress,
  verifyLoginChallenge: async () => true,
}));
const { default: enter } = await import("../pages/api/users/enter");
const { default: confirm } = await import("../pages/api/users/confirm");
const otp = await import("../libs/server/otp");

const codeFromMail = (index = sent.length - 1) =>
  sent[index].text.match(/[A-HJ-NP-Z2-9]{12}/)![0];

// 브라우저 하나를 흉내낸다: 세션 객체(쿠키)를 요청 사이에 유지한다
function browser() {
  const session: Record<string, any> = {};
  const run = async (handler: any, body: unknown) => {
    const req = createReq({ body });
    Object.assign(req.session, session);
    req.session.save = async () => {
      for (const key of Object.keys(session)) delete session[key];
      Object.assign(session, req.session);
    };
    const res = createRes();
    await handler(req, res);
    return res;
  };
  return {
    session,
    enter: (email: string) => run(enter, { email }),
    confirm: (token: unknown) => run(confirm, { token }),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-25T00:00:00Z"));
  fake.db.users = [];
  fake.db.tokens = [];
  fake.db.budget = [];
  sent.length = 0;
  mail.fail = false;
});
afterEach(() => vi.useRealTimers());

describe("otp helpers", () => {
  it("generates 12 uniform base32 symbols (60 bits)", () => {
    for (let i = 0; i < 2000; i++) {
      expect(otp.generateCode()).toMatch(/^[A-HJ-NP-Z2-9]{12}$/);
    }
  });

  it("does not store the plaintext code and binds it to the user", () => {
    const stored = otp.hashCode(1, "a".repeat(64), "123456");
    expect(stored).not.toContain("123456");
    expect(otp.codeMatches(1, "a".repeat(64), "123456", stored)).toBe(true);
    expect(otp.codeMatches(2, "a".repeat(64), "123456", stored)).toBe(false);
    expect(otp.codeMatches(1, "a".repeat(64), "123457", stored)).toBe(false);
    expect(otp.codeMatches(1, "a".repeat(64), "123456", "not-hex")).toBe(false);
  });

  it("validates identity input types", () => {
    expect(otp.parseIdentity({ email: { contains: "a" } })).toBeNull();
    expect(otp.parseIdentity({ email: "not-an-email" })).toBeNull();
    expect(otp.parseIdentity({ email: " a@b.co " })).toEqual({ email: "a@b.co" });
  });
});

describe("POST /api/users/enter", () => {
  it("emails a code and stores only its hash", async () => {
    const b = browser();
    const res = await b.enter("a@example.com");
    expect(res.body).toEqual({ success: true });
    expect(sent).toHaveLength(1);
    expect(fake.db.tokens).toHaveLength(1);
    expect(fake.db.tokens[0].payload).not.toContain(codeFromMail());
    expect(b.session.pendingAuth?.userId).toBe(fake.db.users[0].id);
  });

  it("does not expose SMTP details and exhausts the code when delivery fails", async () => {
    mail.fail = true;
    const res = await browser().enter("a@example.com");
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ success: false });
    expect(fake.db.tokens[0].attempts).toBe(otp.OTP_MAX_ATTEMPTS);
  });

  it("cannot reserve a victim's email slots from another IP", async () => {
    const attacker = browser();
    for (let i = 0; i < 5; i++) expect((await attacker.enter("victim@example.com")).statusCode).toBe(200);
    expect((await attacker.enter("victim@example.com")).statusCode).toBe(429);
    const req = createReq({ body: { email: "victim@example.com" } });
    req.socket.remoteAddress = "192.0.2.2";
    const res = createRes();
    await enter(req, res);
    expect(res.statusCode).toBe(200);
    expect(sent).toHaveLength(6);
  });

  it("blocks one IP across addresses and cookie rotation before user creation", async () => {
    for (let i = 0; i < 5; i++) expect((await browser().enter(`user${i}@example.com`)).statusCode).toBe(200);
    expect((await browser().enter("new@example.com")).statusCode).toBe(429);
    expect(fake.db.users).toHaveLength(5);
    expect(fake.db.tokens).toHaveLength(5);
    expect(sent).toHaveLength(5);
  });

});

describe("POST /api/users/confirm", () => {
  it("logs in with the emailed code exactly once", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const code = codeFromMail();
    const res = await b.confirm(code);
    expect(res.statusCode).toBe(200);
    expect(b.session.user).toEqual({ id: fake.db.users[0].id });
    expect(b.session.pendingAuth).toBeUndefined();
    expect(fake.db.tokens[0].attempts).toBe(otp.OTP_MAX_ATTEMPTS);
    expect((await b.confirm(code)).statusCode).toBe(400);
  });

  it("rejects confirmation without a pending login in the session", async () => {
    const owner = browser();
    await owner.enter("victim@example.com");
    const attacker = browser();
    const res = await attacker.confirm(codeFromMail());
    expect(res.statusCode).toBe(400);
    expect(attacker.session.user).toBeUndefined();
  });

  it("does not accept another user's code (no token-only lookup)", async () => {
    const victim = browser();
    await victim.enter("victim@example.com");
    const victimCode = codeFromMail();
    const attacker = browser();
    await attacker.enter("attacker@example.com");

    const res = await attacker.confirm(victimCode);
    expect(res.success ?? res.body.success).toBe(false);
    expect(attacker.session.user).toBeUndefined();
  });

  it("rejects expired codes", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const code = codeFromMail();
    vi.advanceTimersByTime(otp.OTP_TTL_MS + 1);
    expect((await b.confirm(code)).statusCode).toBe(400);
    expect(b.session.user).toBeUndefined();
  });

  it("locks the code after too many wrong guesses, even for the right code", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const code = codeFromMail();
    const wrong = code === "AAAAAAAAAAAA" ? "BBBBBBBBBBBB" : "AAAAAAAAAAAA";
    for (let i = 0; i < otp.OTP_MAX_ATTEMPTS; i++) {
      expect((await b.confirm(wrong)).statusCode).toBe(400);
    }
    const res = await b.confirm(code);
    expect(res.statusCode).toBe(400);
    expect(b.session.user).toBeUndefined();
  });

  it("issues a fresh code with its own attempt counter after the cooldown", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const wrong = codeFromMail() === "AAAAAAAAAAAA" ? "BBBBBBBBBBBB" : "AAAAAAAAAAAA";
    await b.confirm(wrong);
    vi.advanceTimersByTime(60_000 + 1);
    await b.enter("a@example.com");
    // 발송 예산은 로그인 성공·실패와 무관하다.
    expect(fake.db.tokens.length).toBe(2);
    expect(fake.db.tokens[1].attempts).toBe(0);
    expect((await b.confirm(codeFromMail())).statusCode).toBe(200);
  });

  it("rejects malformed tokens without touching the database", async () => {
    const b = browser();
    await b.enter("a@example.com");
    for (const bad of [undefined, "", "12345", "1234567", 123456, { a: 1 }, ["123456"]]) {
      expect((await b.confirm(bad)).statusCode).toBe(400);
    }
    expect(fake.db.tokens[0].attempts).toBe(0);
  });

  it("lets only one of two concurrent correct submissions through", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const code = codeFromMail();
    const results = await Promise.all([b.confirm(code), b.confirm(code)]);
    expect(results.filter((r) => r.statusCode === 200)).toHaveLength(1);
  });
});


describe("challenge binding and durable budgets", () => {
  it("rejects phone and mixed identities before DB writes or sending", async () => {
    for (const body of [{ phone: "821012345678" }, { phone: "821012345678", email: "a@example.com" }]) {
      const res = createRes();
      await enter(createReq({ body }), res);
      expect(res.statusCode).toBe(400);
    }
    expect(fake.db.users).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });

  it("serializes a simultaneous issuance burst", async () => {
    const responses = await Promise.all(Array.from({ length: 20 }, () => browser().enter("a@example.com")));
    expect(responses.filter((r) => r.statusCode === 200)).toHaveLength(5);
    expect(fake.db.tokens).toHaveLength(5);
    expect(sent).toHaveLength(5);
  });

  it("does not invalidate another browser's pending login or spend its attempts", async () => {
    const owner = browser();
    const other = browser();
    await owner.enter("a@example.com");
    const ownerCode = codeFromMail();
    vi.advanceTimersByTime(60_000 + 1);
    await other.enter("a@example.com");
    const otherCode = codeFromMail();
    // A copied pending cookie identifies exactly the first token, never the newest.
    const ownerPending = { ...owner.session.pendingAuth };
    expect((await owner.confirm(ownerCode)).statusCode).toBe(200);
    expect(fake.db.tokens[1].attempts).toBe(0);
    expect((await other.confirm(otherCode)).statusCode).toBe(200);
    owner.session.pendingAuth = ownerPending;
    expect((await owner.confirm(ownerCode)).statusCode).toBe(400);
  });

  it("binds the code to a random browser secret even for the same identity", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const code = codeFromMail();
    b.session.pendingAuth.binding = "f".repeat(64);
    expect((await b.confirm(code)).statusCode).toBe(400);
  });

  it("rejects legacy pending cookies and modified issuance timestamps", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const code = codeFromMail();
    const pending = { ...b.session.pendingAuth };
    b.session.pendingAuth = { userId: pending.userId, issuedAt: pending.issuedAt };
    expect((await b.confirm(code)).statusCode).toBe(400);
    b.session.pendingAuth = { ...pending, issuedAt: pending.issuedAt + 1 };
    expect((await b.confirm(code)).statusCode).toBe(400);
    expect(fake.db.tokens[0].attempts).toBe(0);
  });

  it("expires at the TTL boundary", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const code = codeFromMail();
    vi.advanceTimersByTime(otp.OTP_TTL_MS);
    expect((await b.confirm(code)).statusCode).toBe(400);
  });

  it("retains issuance budget after successful login", async () => {
    for (let i = 0; i < 5; i++) {
      const b = browser();
      expect((await b.enter("a@example.com")).statusCode).toBe(200);
      expect((await b.confirm(codeFromMail())).statusCode).toBe(200);
      vi.advanceTimersByTime(60_000 + 1);
    }
    expect((await browser().enter("a@example.com")).statusCode).toBe(429);
  });

  it("retains issuance budget after delivery failures without logging error objects", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mail.fail = true;
    for (let i = 0; i < 5; i++) {
      expect((await browser().enter("a@example.com")).statusCode).toBe(500);
      vi.advanceTimersByTime(60_000 + 1);
    }
    expect((await browser().enter("a@example.com")).statusCode).toBe(429);
    expect(log.mock.calls.every((args) => args.length === 1 && args[0] === "Login code delivery/session persistence failed")).toBe(true);
    log.mockRestore();
  });

  it("does not exceed the attempt budget under concurrent guesses", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const code = codeFromMail();
    const wrong = code === "AAAAAAAAAAAA" ? "BBBBBBBBBBBB" : "AAAAAAAAAAAA";
    await Promise.all(Array.from({ length: 20 }, () => b.confirm(wrong)));
    expect(fake.db.tokens[0].attempts).toBe(otp.OTP_MAX_ATTEMPTS);
    expect((await b.confirm(code)).statusCode).toBe(400);
  });
});
