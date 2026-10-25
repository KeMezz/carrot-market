import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma, createReq, createRes } from "./fake-prisma";
const fake = createFakePrisma();
vi.mock("@libs/server/client", () => ({ default: fake.client }));
vi.mock("@libs/server/withSession", () => ({ withApiSession: (fn: unknown) => fn }));
const { default: profile } = await import("../pages/api/users/me");
beforeEach(() => { fake.db.users = [{ id: 1, email: "owner@example.test", name: "Owner" }]; });
describe("profile identity is immutable without verification", () => {
  it("rejects identity fields before all writes and preserves existing session trust", async () => {
    for (const body of [{ email: "victim@example.test", name: "Changed" }, { email: "owner@example.test" },
      { email: "" }, { email: { contains: "@" } }, { phone: "123" }, { phone: null }]) {
      const req = createReq({ body, session: { user: { id: 1 } } });
      const res = createRes(); await profile(req, res);
      expect(res.statusCode).toBe(400);
      expect(fake.db.users[0]).toEqual({ id: 1, email: "owner@example.test", name: "Owner" });
      expect(req.session.user).toEqual({ id: 1 });
    }
  });
  it("still updates name and avatar for the authenticated user", async () => {
    const res = createRes();
    await profile(createReq({ body: { name: "Updated", avatarId: "avatar" }, session: { user: { id: 1 } } }), res);
    expect(res.body.success).toBe(true);
    expect(fake.db.users[0]).toMatchObject({ email: "owner@example.test", name: "Updated", avatar: "avatar" });
  });
});
