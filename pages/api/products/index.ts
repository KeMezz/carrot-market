import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const products = await client.product.findMany({});
    return res.json({ success: true, products });
  }
  if (req.method === "POST") {
    const {
      body: { name, price, description },
      session: { user },
    } = req;
    const product = await client.product.create({
      data: {
        name,
        price: +price,
        description,
        image: "",
        user: { connect: { id: user?.id } },
      },
    });
    return res.json({ success: true, product });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handlerFn: handler })
);
