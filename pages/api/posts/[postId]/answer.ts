import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { postId },
    body: { answer },
    session: { user },
  } = req;

  const post = await client.post.findFirst({
    where: {
      id: Number(postId),
    },
    select: {
      id: true,
    },
  });
  if (!post) return res.status(404).json({ success: false });

  const newAnswer = await client.answer.create({
    data: {
      answer: String(answer),
      user: {
        connect: {
          id: user?.id,
        },
      },
      post: {
        connect: {
          id: Number(postId),
        },
      },
    },
  });

  return res.json({ success: true, answer: newAnswer });
}

export default withApiSession(
  withHandler({ methods: ["POST"], handlerFn: handler })
);
