import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { chatRoomId },
    body: { message },
    session: { user },
  } = req;

  if (req.method === "GET") {
    const chatRoom = await client.chatRoom.findFirst({
      where: {
        id: Number(chatRoomId),
      },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    try {
      const messages = await client.chatMessage.findMany({
        where: {
          chatRoomId: Number(chatRoomId),
        },
        select: {
          id: true,
          message: true,
          user: {
            select: {
              id: true,
              avatar: true,
            },
          },
        },
      });
      res.json({ success: true, messages, chatRoom });
    } catch (error) {
      res.json({ success: false, error });
    }
  }

  if (req.method === "POST") {
    try {
      await client.chatMessage.create({
        data: {
          message,
          user: {
            connect: {
              id: user?.id,
            },
          },
          chatRoom: {
            connect: {
              id: Number(chatRoomId),
            },
          },
        },
      });
      res.status(201).json({ success: true });
    } catch (error) {
      res.json({ success: false, error });
    }
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handlerFn: handler })
);
