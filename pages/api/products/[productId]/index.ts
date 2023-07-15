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
  const isLiked = Boolean(
    await client.record.findFirst({
      where: {
        productId: cleanId,
        userId: user?.id,
        kind: "favs",
      },
      select: {
        id: true,
      },
    })
  );
  res.json({ success: true, isLiked });
}

export default withApiSession(
  withHandler({ methods: ["GET"], handlerFn: handler })
);
