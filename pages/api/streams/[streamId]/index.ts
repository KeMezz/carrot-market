import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { streamId },
  } = req;
  const stream = await client.stream.findUnique({
    where: {
      id: Number(streamId),
    },
    include: {
      messages: {
        select: {
          message: true,
          user: {
            select: {
              id: true,
              avatar: true,
            },
          },
        },
      },
    },
  });
  if (!stream) {
    return res.status(404).json({ success: false });
  } else {
    return res.status(200).json({ success: true, stream });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET"], handlerFn: handler })
);
