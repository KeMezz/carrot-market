import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const totalCount = Math.ceil((await client.product.count()) / 10);
    const products = await client.product.findMany({
      include: {
        _count: {
          select: {
            chatRooms: true,
            records: {
              where: {
                kind: "favs",
              },
            },
          },
        },
      },
    });
    if (!products) return res.status(404).json({ success: false });
    else return res.json({ success: true, products, totalCount });
  }

  if (req.method === "POST") {
    const {
      body: { name, price, description, image },
      session: { user },
    } = req;
    const product = await client.product.create({
      data: {
        name,
        price: +price,
        description,
        image: image ?? "",
        user: { connect: { id: user?.id } },
      },
    });
    return res.json({ success: true, product });
  }
}

export default withApiSession(
  withHandler({
    methods: ["GET", "POST"],
    handlerFn: handler,
  })
);
