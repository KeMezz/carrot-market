import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

const MESSAGE_MAX_LENGTH = 1000;

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { chatRoomId },
    session: { user },
  } = req;

  const roomId = Number(chatRoomId);
  if (!user || !Number.isInteger(roomId)) {
    return res.status(404).json({ success: false });
  }

  // 채팅방 참여자(개설한 구매자 또는 상품 판매자)만 접근할 수 있다.
  // 존재하지 않는 방과 권한이 없는 방은 동일하게 404로 응답한다.
  const chatRoom = await client.chatRoom.findFirst({
    where: {
      id: roomId,
      OR: [{ creatorId: user.id }, { product: { userId: user.id } }],
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
  if (!chatRoom) return res.status(404).json({ success: false });

  if (req.method === "GET") {
    const messages = await client.chatMessage.findMany({
      where: {
        chatRoomId: roomId,
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
    return res.json({ success: true, messages, chatRoom });
  }

  if (req.method === "POST") {
    const message = req.body?.message;
    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > MESSAGE_MAX_LENGTH
    ) {
      return res.status(400).json({ success: false });
    }
    await client.chatMessage.create({
      data: {
        message,
        user: {
          connect: {
            id: user.id,
          },
        },
        chatRoom: {
          connect: {
            id: roomId,
          },
        },
      },
    });
    return res.status(201).json({ success: true });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handlerFn: handler })
);
