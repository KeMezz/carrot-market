import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { productId },
    session: { user },
  } = req;

  if (req.method === "GET") {
    const chatRooms = await client.chatRoom.findMany({
      where: {
        OR: [
          {
            product: {
              userId: user?.id,
            },
          },
          {
            chatMessages: {
              some: {
                userId: user?.id,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        chatMessages: {
          take: -1,
          select: {
            id: true,
            message: true,
            createdAt: true,
            user: { select: { id: true, avatar: true, name: true } },
          },
        },
      },
    });
    return res.json({ success: true, chatRooms });
  }

  if (req.method === "POST") {
    const alreadyExists = await client.chatRoom.findFirst({
      where: {
        productId: productId,
        creatorId: user?.id,
      },
      select: {
        id: true,
      },
    });
    if (alreadyExists)
      return res.status(200).json({ success: true, chatRoom: alreadyExists });

    const chatRoom = await client.chatRoom.create({
      data: {
        product: {
          connect: {
            id: Number(productId),
          },
        },
        creator: {
          connect: {
            id: user?.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
    if (!chatRoom) return res.status(400).json({ success: false });
    return res.json({ success: true, chatRoom });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handlerFn: handler })
);
