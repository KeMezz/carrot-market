import twilio from "twilio";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import nodemailerClient from "@libs/server/email";

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { phone, email } = req.body;
  const body = phone ? { phone } : email ? { email } : null;
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
    await twilioClient.messages.create({
      messagingServiceSid: process.env.TWILIO_MSID,
      from: process.env.PHONE_NUMBER!,
      to: process.env.MY_PHONE!,
      body: `Your login token is ${payload}`,
    });
  } else if (email) {
    const mailOptions = {
      from: process.env.MAIL_ID,
      to: email,
      subject: "Carrot Market Authentication Code",
      text: `Your login token is ${payload}`,
    };
    nodemailerClient.sendMail(mailOptions, (error, response) => {
      if (error) {
        return res.status(500).json({ success: false, ...error });
      } else {
        return res.json({ success: true, ...response });
      }
    });
    nodemailerClient.close();
  }

  return res.json({
    success: true,
  });
}

export default withHandler({
  methods: ["POST"],
  handlerFn: handler,
  isPrivate: false,
});
