import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const profile = await client.user.findUnique({
      where: { id: req.session.user?.id },
    });
    if (!profile) return res.status(404).json({ success: false });
    res.json({ success: true, profile });
  }

  if (req.method === "POST") {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        "email" in body || "phone" in body ||
        (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim() || body.name.length > 80)) ||
        (body.avatarId !== undefined && (typeof body.avatarId !== "string" || !body.avatarId || body.avatarId.length > 200))) {
      return res.status(400).json({ success: false, error: "Login identity cannot be edited here" });
    }
    const data = {
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.avatarId !== undefined ? { avatar: body.avatarId } : {}),
    };
    if (!Object.keys(data).length) return res.status(400).json({ success: false });
    await client.user.update({ where: { id: req.session.user!.id }, data });
    return res.json({ success: true });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handlerFn: handler })
);
