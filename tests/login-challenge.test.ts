import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loginClientIp, verifyLoginChallenge } from "../libs/server/login-challenge";
import { createReq } from "./fake-prisma";

beforeEach(() => {
  vi.stubEnv("OTP_IP_SOURCE", "socket");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "unit-test-config-not-a-real-key");
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "unit-test-public-key");
  vi.stubEnv("TURNSTILE_HOSTNAME", "carrot.example.test");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("login admission challenge and IP trust", () => {
  it("ignores forwarded headers for direct sockets and fails closed without a source", () => {
    const req = createReq({});
    req.headers["x-forwarded-for"] = "203.0.113.9";
    expect(loginClientIp(req)).toBe("192.0.2.1");
    vi.stubEnv("OTP_IP_SOURCE", "");
    expect(loginClientIp(req)).toBeNull();
  });
  it("requires explicit Vercel runtime trust and one valid platform IP", () => {
    const req = createReq({});
    vi.stubEnv("OTP_IP_SOURCE", "vercel");
    vi.stubEnv("VERCEL", "");
    req.headers["x-vercel-forwarded-for"] = "203.0.113.9";
    expect(loginClientIp(req)).toBeNull();
    vi.stubEnv("VERCEL", "1");
    expect(loginClientIp(req)).toBe("203.0.113.9");
    for (const value of ["203.0.113.9,192.0.2.1", ["203.0.113.9"], "not-an-ip", undefined]) {
      req.headers["x-vercel-forwarded-for"] = value;
      expect(loginClientIp(req)).toBeNull();
    }
  });
  it("canonicalizes IPv6 and IPv4 mapped addresses", () => {
    const req = createReq({});
    for (const value of ["::ffff:192.0.2.1", "::FFFF:c000:201", "0:0:0:0:0:ffff:c000:201"]) {
      req.socket.remoteAddress = value;
      expect(loginClientIp(req)).toBe("192.0.2.1");
    }
    req.socket.remoteAddress = "2001:0DB8:0000::1";
    expect(loginClientIp(req)).toBe("[2001:db8::1]");
  });
  it("does not call the provider for missing config, known dummy keys or malformed tokens", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    for (const bad of [undefined, {}, "", "x".repeat(2049)]) expect(await verifyLoginChallenge(bad, "192.0.2.1")).toBe(false);
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect(await verifyLoginChallenge("token", "192.0.2.1")).toBe(false);
    vi.stubEnv("TURNSTILE_SECRET_KEY", "1x0000000000000000000000000000000AA");
    expect(await verifyLoginChallenge("token", "192.0.2.1")).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("requires server-validated success, expected hostname and login action", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    for (const result of [null, {}, { success: false }, { success: true, hostname: "evil.test", action: "login" },
      { success: true, hostname: "carrot.example.test", action: "other" }]) {
      fetcher.mockResolvedValue({ ok: true, json: async () => result });
      expect(await verifyLoginChallenge("token", "192.0.2.1")).toBe(false);
    }
    fetcher.mockResolvedValue({ ok: true, json: async () => ({ success: true, hostname: "carrot.example.test", action: "login" }) });
    expect(await verifyLoginChallenge("token", "192.0.2.1")).toBe(true);
    const [endpoint, request] = fetcher.mock.lastCall!;
    expect(endpoint).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(JSON.parse(request.body)).toMatchObject({ response: "token", remoteip: "192.0.2.1" });
    expect(request.signal).toBeInstanceOf(AbortSignal);
    fetcher.mockRejectedValue(new Error("timeout"));
    expect(await verifyLoginChallenge("token", "192.0.2.1")).toBe(false);
  });
});
