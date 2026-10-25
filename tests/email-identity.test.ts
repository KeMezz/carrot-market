import { describe, expect, it } from "vitest";
import nodemailer from "nodemailer";
import { parseIdentity, normalizeEmail } from "../libs/server/otp";

describe("one canonical mailbox", () => {
  it("rejects mail lists, display names, comments, domain literals and malformed dot atoms", () => {
    for (const email of ["x,victim@z.com", "evil<victim@z.com>.co", '"victim"@z.com', "victim(comment)@z.com",
      "a;b@z.com", "a:b@z.com", "a\\b@z.com", "a@b@z.com", "a@[127.0.0.1]", "a@-z.com", "a@z-.com",
      "a..b@z.com", ".a@z.com", "a.@z.com", "a b@z.com", "a\r\nb@z.com", "а@z.com", "a".repeat(65)+"@z.com",
      "a@"+"z".repeat(64)+".com"]) expect(parseIdentity({ email }), email).toBeNull();
  });
  it("normalizes consistently and passes Nodemailer one address object", async () => {
    const email = normalizeEmail(" Victim+tag@EXAMPLE.COM ")!;
    expect(email).toBe("victim+tag@example.com");
    const transport = nodemailer.createTransport({ jsonTransport: true });
    const result = await transport.sendMail({ from: "sender@example.test", to: { address: email, name: "" }, text: "local test" });
    expect(result.envelope.to).toEqual([email]);
  });
});
