import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma, createReq, createRes } from "./fake-prisma";

const fake = createFakePrisma();
const sent: { to: string; text: string }[] = [];
const mail = { fail: false };

vi.mock("@libs/server/client", () => ({ default: fake.client }));
vi.mock("@libs/server/withSession", () => ({
  withApiSession: (fn: unknown) => fn,
}));
vi.mock("@libs/server/email", () => ({
  default: {
    sendMail: async (options: { to: string; text: string }) => {
      if (mail.fail) throw new Error("smtp down");
      sent.push(options);
    },
  },
}));
vi.mock("twilio", () => ({ default: () => ({}) }));

const { default: enter } = await import("../pages/api/users/enter");
const { default: confirm } = await import("../pages/api/users/confirm");
const otp = await import("../libs/server/otp");

const codeFromMail = (index = sent.length - 1) =>
  sent[index].text.match(/\d{6}/)![0];

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
  sent.length = 0;
  mail.fail = false;
});
afterEach(() => vi.useRealTimers());

describe("otp helpers", () => {
  it("generates six digit codes from the full range", () => {
    for (let i = 0; i < 2000; i++) {
      expect(otp.generateCode()).toMatch(/^[1-9]\d{5}$/);
    }
  });

  it("does not store the plaintext code and binds it to the user", () => {
    const stored = otp.hashCode(1, "123456");
    expect(stored).not.toContain("123456");
    expect(otp.codeMatches(1, "123456", stored)).toBe(true);
    expect(otp.codeMatches(2, "123456", stored)).toBe(false);
    expect(otp.codeMatches(1, "123457", stored)).toBe(false);
    expect(otp.codeMatches(1, "123456", "not-hex")).toBe(false);
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

  it("does not leak SMTP details and removes the code when delivery fails", async () => {
    mail.fail = true;
    const res = await browser().enter("a@example.com");
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ success: false });
    expect(fake.db.tokens).toHaveLength(0);
  });

  it("enforces a resend cooldown", async () => {
    const b = browser();
    await b.enter("a@example.com");
    expect((await b.enter("a@example.com")).statusCode).toBe(429);
    expect(sent).toHaveLength(1);
    vi.advanceTimersByTime(otp.OTP_RESEND_COOLDOWN_MS + 1);
    expect((await b.enter("a@example.com")).statusCode).toBe(200);
  });

  it("caps issuance per identity per hour", async () => {
    const b = browser();
    for (let i = 0; i < otp.OTP_MAX_ISSUES_PER_WINDOW; i++) {
      expect((await b.enter("a@example.com")).statusCode).toBe(200);
      vi.advanceTimersByTime(otp.OTP_RESEND_COOLDOWN_MS + 1);
    }
    expect((await b.enter("a@example.com")).statusCode).toBe(429);
    // 다른 이메일은 영향을 받지 않는다
    expect((await b.enter("b@example.com")).statusCode).toBe(200);
    vi.advanceTimersByTime(otp.OTP_ISSUE_WINDOW_MS);
    expect((await b.enter("a@example.com")).statusCode).toBe(200);
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
    expect(fake.db.tokens).toHaveLength(0);
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
    const wrong = code === "111111" ? "222222" : "111111";
    for (let i = 0; i < otp.OTP_MAX_ATTEMPTS; i++) {
      expect((await b.confirm(wrong)).statusCode).toBe(400);
    }
    const res = await b.confirm(code);
    expect(res.statusCode).toBe(429);
    expect(b.session.user).toBeUndefined();
  });

  it("issues a fresh code with its own attempt counter after the cooldown", async () => {
    const b = browser();
    await b.enter("a@example.com");
    const wrong = codeFromMail() === "111111" ? "222222" : "111111";
    await b.confirm(wrong);
    vi.advanceTimersByTime(otp.OTP_RESEND_COOLDOWN_MS + 1);
    await b.enter("a@example.com");
    // 새 코드는 새 시도 횟수를 갖지만, 발급 자체가 시간당 5회로 제한된다
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
