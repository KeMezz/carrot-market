import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { productId },
    session: { user },
  } = req;
  const cleanId = Number(productId);
  const product = await client.product.findUnique({
    where: {
      id: cleanId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
  const terms = product?.name
    .split(" ")
    .map((word) => ({ name: { contains: word } }));
  const relatedProducts = await client.product.findMany({
    where: {
      OR: terms,
      AND: {
        id: {
          not: cleanId,
        },
      },
    },
  });
  const isLiked = Boolean(
    await client.record.findFirst({
      where: {
        productId: product?.id,
        userId: user?.id,
        kind: "favs",
      },
      select: {
        id: true,
      },
    })
  );
  res.json({ success: true, product, relatedProducts, isLiked });
}

export default withApiSession(
  withHandler({ methods: ["GET"], handlerFn: handler })
);
