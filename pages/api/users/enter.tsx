import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { phone, email } = req.body;
  const body = phone ? { phone: +phone } : email ? { email } : null;
  if (!body) return res.status(400).json({ success: false });
  const token = await client.token.create({
    data: {
      payload: Math.floor(100000 + Math.random() * 900000) + "",
      user: {
        connectOrCreate: {
          where: {
            ...body,
          },
          create: {
            name: "Anonymous",
            ...body,
          },
        },
      },
    },
  });
  return res.json({
    success: true,
  });
}

export default withHandler("POST", handler);
