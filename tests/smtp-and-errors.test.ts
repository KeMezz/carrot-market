import { describe, expect, it, vi } from "vitest";
import nodemailer from "nodemailer";
import { createServer } from "node:tls";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import nodemailerClient from "../libs/server/email";
import withHandler from "../libs/server/withHandler";
import { createReq, createRes } from "./fake-prisma";

describe("SMTP transport and error sanitization", () => {
  it("requires implicit TLS and trusted certificates", () => {
    const options = nodemailerClient.options as any;
    expect(options.host).toBe("smtp.naver.com");
    expect(options.port).toBe(465);
    expect(options.secure).toBe(true);
    expect(options.tls.rejectUnauthorized).toBe(true);
    expect(options.tls.minVersion).toBe("TLSv1.2");
  });
  it("rejects an SMTP peer with an untrusted certificate", async () => {
    const dir = mkdtempSync(join(tmpdir(), "carrot-smtp-test-"));
    execFileSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes",
      "-keyout", join(dir, "key.pem"), "-out", join(dir, "cert.pem"),
      "-subj", "/CN=localhost", "-days", "1"], { stdio: "ignore" });
    const server = createServer({ key: readFileSync(join(dir, "key.pem")), cert: readFileSync(join(dir, "cert.pem")) }, (socket) => {
      socket.write("220 localhost ESMTP\r\n");
      socket.on("data", (data) => {
        if (data.toString().startsWith("QUIT")) socket.end("221 bye\r\n");
        else socket.write("250 localhost\r\n");
      });
    });
    server.on("tlsClientError", () => {});
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const transport = nodemailer.createTransport({ ...nodemailerClient.options as any,
      host: "127.0.0.1", port: (server.address() as any).port, auth: undefined,
    });
    try {
      await expect(transport.verify()).rejects.toMatchObject({ code: "ESOCKET" });
    } finally {
      transport.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does not expose credentials in database/provider errors or logs", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withHandler({ methods: ["POST"], isPrivate: false, handlerFn: async () => {
      throw new Error("postgresql://user:secret@internal/db SMTP AUTH secret");
    } });
    const res = createRes();
    await handler(createReq({}), res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ success: false, error: "internal server error" });
    expect(log.mock.calls).toEqual([["API request failed"]]);
    log.mockRestore();
  });
});
