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
  const alreadyExists = await client.record.findFirst({
    where: {
      productId: Number(productId),
      userId: user?.id,
      kind: "favs",
    },
  });
  if (alreadyExists) {
    await client.record.delete({
      where: {
        id: alreadyExists.id,
      },
      select: {
        kind: true,
      },
    });
    return res.status(204).json({ success: true });
  } else {
    await client.record.create({
      data: {
        kind: "favs",
        user: {
          connect: {
            id: user?.id,
          },
        },
        product: {
          connect: {
            id: Number(productId),
          },
        },
      },
    });
    return res.status(201).json({ success: true });
  }
}

export default withApiSession(
  withHandler({ methods: ["POST"], handlerFn: handler })
);
