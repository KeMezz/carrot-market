import twilio from "twilio";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { phone, email } = req.body;
  const body = phone ? { phone: +phone } : email ? { email } : null;
  if (!body) return res.status(400).json({ success: false });
  const payload = Math.floor(100000 + Math.random() * 900000) + "";
  const token = await client.token.create({
    data: {
      payload,
      user: {
        connectOrCreate: {
          where: {
            ...body,
          },
          create: {
            name: "Anonymous",
            ...body,
          },
        },
      },
    },
  });

  if (phone) {
    const msg = await twilioClient.messages.create({
      messagingServiceSid: process.env.TWILIO_MSID,
      from: process.env.PHONE_NUMBER!,
      to: process.env.MY_PHONE!,
      body: `Your login token is ${payload}`,
    });
    console.log(msg);
  }

  return res.json({
    success: true,
  });
}

export default withHandler("POST", handler);
