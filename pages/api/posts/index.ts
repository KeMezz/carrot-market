import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    // query,
    body: { question },
    session: { user },
  } = req;
  if (req.method === "GET") {
    // const { latitude, longitude } = query;
    // const parsedLatitude = parseFloat(latitude!?.toString());
    // const parsedLongitude = parseFloat(longitude!?.toString());
    const posts = await client.post.findMany({
      // where: {
      //   latitude: {
      //     gte: parsedLatitude - 0.01,
      //     lte: parsedLatitude + 0.01,
      //   },
      //   longitude: {
      //     gte: parsedLongitude - 0.01,
      //     lte: parsedLongitude + 0.01,
      //   },
      // },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            interests: true,
            answers: true,
          },
        },
      },
    });
    return res.json({ success: true, posts });
  }
  if (req.method === "POST") {
    const post = await client.post.create({
      data: {
        question,
        // latitude,
        // longitude,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
    return res.json({ success: true, post });
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handlerFn: handler })
);
