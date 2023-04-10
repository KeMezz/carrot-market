import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler from "@libs/server/withHandler";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { phone, email } = req.body;
  const payload = phone ? { phone: +phone } : { email };
  const user = await client.user.upsert({
    where: {
      ...payload,
    },
    create: {
      name: "Anonymous",
      ...payload,
    },
    update: {},
  });
  // if (email) {
  //   user = await client.user.findUnique({ where: { email } });
  //   if (!user) {
  //     user = await client.user.create({ data: { name: "Anonymous", email } });
  //   }
  // } else if (phone) {
  //   user = await client.user.findUnique({ where: { phone: +phone } });
  //   if (!user) {
  //     user = await client.user.create({
  //       data: { name: "Anonymous", phone: +phone },
  //     });
  //   }
  // }
  return res.json(user);
}

export default withHandler("POST", handler);
