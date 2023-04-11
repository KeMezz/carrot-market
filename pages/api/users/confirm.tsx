import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { token } = req.body;
  const exists = await client.token.findUnique({
    where: { payload: token },
  });
  if (!exists) return res.status(404).json({ success: false });
  req.session.user = {
    id: exists.userId,
  };
  await req.session.save();
  return res.status(200).json({ success: true });
}

export default withApiSession(withHandler("POST", handler));
