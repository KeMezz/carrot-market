import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";

type Error = null | string;
export interface ProfileErrorResponse {
  email: Error;
  phone: Error;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const profile = await client.user.findUnique({
      where: { id: req.session.user?.id },
    });
    res.json({ success: true, profile });
  }

  if (req.method === "POST") {
    const {
      session: { user },
      body: { email, phone, name },
    } = req;

    if (!email && !phone) {
      return res.status(400).json({ success: false });
    }

    const currentUser = await client.user.findUnique({
      where: {
        id: user?.id,
      },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    let error: ProfileErrorResponse = {
      email: null,
      phone: null,
    };

    if (email || email === "") {
      const alreadyExists = Boolean(
        await client.user.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
          },
        })
      );
      if (alreadyExists && currentUser?.email !== email) {
        error = { ...error, email: `${email} is already in use.` };
      } else {
        await client.user.update({
          where: {
            id: user?.id,
          },
          data: {
            email,
          },
        });
      }
    }

    if (phone || phone === "") {
      const alreadyExists = Boolean(
        await client.user.findUnique({
          where: {
            phone,
          },
          select: {
            id: true,
          },
        })
      );
      if (alreadyExists && currentUser?.phone !== phone) {
        error = { ...error, phone: `${phone} is already in use.` };
      } else {
        await client.user.update({
          where: {
            id: user?.id,
          },
          data: {
            phone,
          },
        });
      }
    }

    if (name) {
      await client.user.update({
        where: {
          id: user?.id,
        },
        data: {
          name,
        },
      });
    }

    if (error.email || error.phone) {
      return res.json({ success: false, error });
    } else {
      return res.json({ success: true });
    }
  }
}

export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handlerFn: handler })
);
