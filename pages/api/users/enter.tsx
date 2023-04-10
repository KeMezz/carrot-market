import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler from "@libs/server/withHandler";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { phone, email } = req.body;
  let user;
  if (email) {
    user = await client.user.findUnique({ where: { email } });
    if (!user) {
      console.log("Did not find. Will create.");
      user = await client.user.create({ data: { name: "Anonymous", email } });
    }
    console.log(user);
  } else if (phone) {
    user = await client.user.findUnique({ where: { phone } });
    if (!user) {
      user = await client.user.create({ data: { name: "Anonymous", phone } });
    }
  }
  return res.json({ ok: true });
}

export default withHandler("POST", handler);
