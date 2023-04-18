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
    session: { user },
  } = req;
  const post = await client.post.findUnique({
    where: {
      id: Number(postId),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      answers: {
        select: {
          answer: true,
          id: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          answers: true,
          interests: true,
        },
      },
    },
  });

  const isInterest = Boolean(
    await client.interest.findFirst({
      where: {
        postId: Number(postId),
        userId: user?.id,
      },
      select: {
        id: true,
      },
    })
  );

  res.json({ success: true, post, isInterest });
}

export default withApiSession(
  withHandler({ methods: ["GET"], handlerFn: handler })
);
