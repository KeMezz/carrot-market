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
  const interests = await client.interest.count({
    where: {
      postId: Number(postId),
    },
  });
  const answers = await client.answer.count({
    where: {
      postId: Number(postId),
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
  res.json({ success: true, isInterest, _count: { interests, answers } });
}

export default withApiSession(
  withHandler({ methods: ["GET"], handlerFn: handler })
);
