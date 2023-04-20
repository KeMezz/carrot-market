import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { page },
    body: { name, price, description },
    session: { user },
  } = req;

  if (req.method === "GET") {
    const totalCount = await client.stream.count();
    const streams = await client.stream.findMany({
      take: 10,
      skip: (Number(page) - 1) * 10,
      select: {
        id: true,
        name: true,
      },
    });
    return res.json({ success: true, streams, totalCount });
  }

  if (req.method === "POST") {
    const stream = await client.stream.create({
      data: {
        name,
        price,
        description,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
    return res.json({ success: true, stream });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handlerFn: handler })
);
