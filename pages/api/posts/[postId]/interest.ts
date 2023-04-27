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

  const post = await client.post.findFirst({
    where: {
      id: Number(postId),
    },
    select: {
      id: true,
    },
  });

  if (!post) return res.status(404).json({ success: false });

  const alreadyExists = await client.interest.findFirst({
    where: {
      userId: user?.id,
      postId: Number(postId),
    },
    select: {
      id: true,
    },
  });

  if (alreadyExists) {
    await client.interest.delete({
      where: {
        id: alreadyExists.id,
      },
    });
  } else {
    await client.interest.create({
      data: {
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
  }

  await res.revalidate("/community");
  res.json({ success: true });
}

export default withApiSession(
  withHandler({ methods: ["POST"], handlerFn: handler })
);
