import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id },
    session: { user },
  } = req;

  const alreadyExists = await client.interest.findFirst({
    where: {
      userId: user?.id,
      postId: Number(id),
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
            id: Number(id),
          },
        },
      },
    });
  }

  res.json({ success: true });
}

export default withApiSession(
  withHandler({ methods: ["POST"], handlerFn: handler })
);
