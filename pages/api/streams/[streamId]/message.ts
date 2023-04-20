import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { message },
    query: { streamId },
    session: { user },
  } = req;

  if (req.method === "POST") {
    const createdMessage = await client.streamMessage.create({
      data: {
        message,
        stream: {
          connect: {
            id: Number(streamId),
          },
        },
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });

    if (!createdMessage) {
      return res.status(400).json({ success: false });
    } else {
      return res.json({ success: true, message: createdMessage });
    }
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handlerFn: handler })
);
