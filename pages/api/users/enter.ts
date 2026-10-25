import twilio from "twilio";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";
import nodemailerClient from "@libs/server/email";
import {
  OTP_ISSUE_WINDOW_MS,
  OTP_MAX_ISSUES_PER_WINDOW,
  OTP_RESEND_COOLDOWN_MS,
  generateCode,
  hashCode,
  parseIdentity,
} from "@libs/server/otp";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const identity = parseIdentity(req.body);
  if (!identity) return res.status(400).json({ success: false });

  const user = await client.user.upsert({
    where: identity,
    update: {},
    create: { name: "Anonymous", ...identity },
    select: { id: true },
  });

  // 발급 횟수/재전송 간격은 DB에 남은 토큰 기준으로 제한한다 (서버리스에서도 유지됨)
  const now = Date.now();
  const windowStart = new Date(now - OTP_ISSUE_WINDOW_MS);
  await client.token.deleteMany({
    where: { userId: user.id, createdAt: { lt: windowStart } },
  });
  const recent = await client.token.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (
    recent.length >= OTP_MAX_ISSUES_PER_WINDOW ||
    (recent[0] &&
      now - recent[0].createdAt.getTime() < OTP_RESEND_COOLDOWN_MS)
  ) {
    return res.status(429).json({ success: false });
  }

  let code = "";
  let tokenId: number | null = null;
  for (let tries = 0; tries < 3 && tokenId === null; tries++) {
    code = generateCode();
    try {
      const created = await client.token.create({
        data: { payload: hashCode(user.id, code), userId: user.id },
        select: { id: true },
      });
      tokenId = created.id;
    } catch (error: any) {
      // 같은 사용자에게 같은 코드가 겹친 경우(payload unique)에만 재시도
      if (error?.code !== "P2002") throw error;
    }
  }
  if (tokenId === null) throw new Error("could not issue a login code");

  try {
    if ("phone" in identity) {
      const twilioClient = twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_TOKEN
      );
      await twilioClient.messages.create({
        messagingServiceSid: process.env.TWILIO_MSID,
        from: process.env.PHONE_NUMBER!,
        to: process.env.MY_PHONE!,
        body: `Your login token is ${code}`,
      });
    } else {
      await nodemailerClient.sendMail({
        from: process.env.MAIL_ID,
        to: identity.email,
        subject: "Carrot Market Authentication Code",
        text: `Your login token is ${code}`,
      });
    }
  } catch (error) {
    console.error("failed to deliver login code", error);
    await client.token.deleteMany({ where: { id: tokenId } });
    return res.status(500).json({ success: false });
  }

  // 인증번호를 요청한 브라우저에서만 확인할 수 있도록 세션에 묶는다
  req.session.pendingAuth = { userId: user.id, issuedAt: now };
  await req.session.save();

  return res.json({ success: true });
}

export default withApiSession(
  withHandler({
    methods: ["POST"],
    handlerFn: handler,
    isPrivate: false,
  })
);
