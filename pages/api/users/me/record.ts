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

  switch (kind) {
    case Kind.favs:
    case Kind.purchases:
    case Kind.sales:
      const records = await client.record.findMany({
        include: {
          product: {
            include: {
              _count: {
                select: {
                  records: {
                    where: {
                      kind: "favs",
                    },
                  },
                },
              },
            },
          },
        },
        where: {
          userId: user?.id,
          kind,
        },
      });
      res.json({ success: true, records });
      break;
    default:
      res.json({ success: false });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET"], handlerFn: handler })
);
