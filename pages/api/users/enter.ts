import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";
import nodemailerClient from "@libs/server/email";
import { OTP_MAX_ATTEMPTS, parseIdentity } from "@libs/server/otp";
import { findLoginUser } from "@libs/server/login-identity";
import { verifyLoginChallenge, loginClientIp } from "@libs/server/login-challenge";
import { reserveLoginDelivery } from "@libs/server/login-budget";
import { issueLoginCode } from "@libs/server/otp-store";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  const identity = parseIdentity(req.body);
  if (!identity) return res.status(400).json({ success: false });

  const ip = loginClientIp(req);
  if (!ip || !await verifyLoginChallenge(req.body?.challenge, ip)) {
    return res.status(503).json({ success: false });
  }
  // Reserve before creating any User/Token or sending mail. Never refund errors:
  // external SMTP acceptance and our transaction cannot commit atomically.
  if (!await reserveLoginDelivery(client, ip)) return res.status(429).json({ success: false });
  const user = await findLoginUser(client, identity.email);
  if (!user) return res.status(400).json({ success: false });
  const issued = await issueLoginCode(client, user.id);
  if (!issued) return res.status(429).json({ success: false });

  try {
    await nodemailerClient.sendMail({
      from: process.env.MAIL_ID, to: { address: identity.email, name: "" },
      subject: "Carrot Market Authentication Code",
      text: `Your login token is ${issued.code}`,
    });
    req.session.pendingAuth = issued.pending;
    await req.session.save();
  } catch {
    // Never log provider errors: they can contain credentials, addresses or codes.
    console.error("Login code delivery/session persistence failed");
    await client.token.updateMany({
      where: { id: issued.pending.tokenId }, data: { attempts: OTP_MAX_ATTEMPTS },
    });
    return res.status(500).json({ success: false });
  }
  return res.json({ success: true });
}

export default withApiSession(withHandler({ methods: ["POST"], handlerFn: handler, isPrivate: false }));
