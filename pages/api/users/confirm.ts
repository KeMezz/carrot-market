import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";
import { isValidCodeFormat, isValidPending } from "@libs/server/otp";
import { consumeLoginCode } from "@libs/server/otp-store";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  const pending = req.session.pendingAuth;
  const token = req.body?.token;
  // Legacy pending cookies do not identify a challenge and must start over.
  if (!isValidPending(pending) || !isValidCodeFormat(token) ||
      !await consumeLoginCode(client, pending, token)) {
    return res.status(400).json({ success: false });
  }
  delete req.session.pendingAuth;
  req.session.user = { id: pending.userId };
  await req.session.save();
  return res.status(200).json({ success: true });
}

export default withApiSession(withHandler({ methods: ["POST"], handlerFn: handler, isPrivate: false }));
