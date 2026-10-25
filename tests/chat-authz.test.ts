import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma, createReq, createRes } from "./fake-prisma";

const fake = createFakePrisma();

vi.mock("@libs/server/client", () => ({ default: fake.client }));
vi.mock("@libs/server/withSession", () => ({
  withApiSession: (fn: unknown) => fn,
}));

const { default: handler } = await import("../pages/api/chats/[chatRoomId]");

const SELLER = 1;
const BUYER = 2;
const STRANGER = 3;
const ROOM = 50;

beforeEach(() => {
  const { db } = fake;
  db.users = [
    { id: SELLER, name: "seller" },
    { id: BUYER, name: "buyer" },
    { id: STRANGER, name: "stranger" },
  ];
  db.products = [{ id: 7, userId: SELLER, name: "bike" }];
  db.chatRooms = [{ id: ROOM, creatorId: BUYER, productId: 7 }];
  db.chatMessages = [
    { id: 1, message: "is it available?", userId: BUYER, chatRoomId: ROOM },
  ];
});

const call = async (
  userId: number | undefined,
  method: "GET" | "POST",
  body?: unknown,
  chatRoomId: string = String(ROOM)
) => {
  const req = createReq({
    method,
    body,
    query: { chatRoomId },
    session: userId ? { user: { id: userId } } : {},
  });
  const res = createRes();
  await (handler as any)(req, res);
  return res;
};

describe("/api/chats/[chatRoomId]", () => {
  it("rejects anonymous callers", async () => {
    expect((await call(undefined, "GET")).statusCode).toBe(401);
  });

  it("does not let a logged-in non-member read a room", async () => {
    const res = await call(STRANGER, "GET");
    expect(res.statusCode).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain("available");
  });

  it("does not let a logged-in non-member post into a room", async () => {
    const res = await call(STRANGER, "POST", { message: "spam" });
    expect(res.statusCode).toBe(404);
    expect(fake.db.chatMessages).toHaveLength(1);
  });

  it("gives non-members the same answer for existing and missing rooms", async () => {
    const missing = await call(STRANGER, "GET", undefined, "9999");
    const existing = await call(STRANGER, "GET");
    expect(missing.statusCode).toBe(existing.statusCode);
    expect(missing.body).toEqual(existing.body);
  });

  it("lets the buyer who opened the room read and post", async () => {
    const read = await call(BUYER, "GET");
    expect(read.body.success).toBe(true);
    expect(read.body.messages).toHaveLength(1);

    const post = await call(BUYER, "POST", { message: "hello" });
    expect(post.statusCode).toBe(201);
    expect(fake.db.chatMessages).toHaveLength(2);
  });

  it("lets the product's seller read and reply", async () => {
    expect((await call(SELLER, "GET")).body.success).toBe(true);
    const post = await call(SELLER, "POST", { message: "yes" });
    expect(post.statusCode).toBe(201);
    expect(fake.db.chatMessages.at(-1)).toMatchObject({
      userId: SELLER,
      chatRoomId: ROOM,
    });
  });

  it.each([undefined, "", "   ", 123, { $gt: "" }, "x".repeat(1001)])(
    "rejects invalid message %j",
    async (message) => {
      const res = await call(BUYER, "POST", { message });
      expect(res.statusCode).toBe(400);
      expect(fake.db.chatMessages).toHaveLength(1);
    }
  );

  it("treats a non-numeric room id as not found", async () => {
    expect((await call(BUYER, "GET", undefined, "abc")).statusCode).toBe(404);
  });
});
