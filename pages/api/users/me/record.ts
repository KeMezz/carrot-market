import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";
import { Kind } from "@prisma/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { kind },
    session: { user },
  } = req;

  console.log(kind);

  switch (kind) {
    case Kind.favs:
    case Kind.purchases:
    case Kind.sales:
      const products = await client.record.findMany({
        where: {
          id: user?.id,
          kind,
        },
      });
      res.json({ success: true, products });
      break;
    default:
      res.json({ success: false });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET"], handlerFn: handler })
);
