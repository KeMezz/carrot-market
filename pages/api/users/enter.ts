import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";
import nodemailerClient from "@libs/server/email";
import { OTP_MAX_ATTEMPTS, parseIdentity } from "@libs/server/otp";
import { issueLoginCode } from "@libs/server/otp-store";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  const identity = parseIdentity(req.body);
  if (!identity) return res.status(400).json({ success: false });

  const user = await client.user.upsert({
    where: identity, update: {}, create: { name: "Anonymous", ...identity }, select: { id: true },
  }).catch(async (error: unknown) => {
    // Prisma may emulate an upsert; concurrent first requests can race its insert.
    if ((error as { code?: string })?.code !== "P2002") throw error;
    return client.user.findUniqueOrThrow({ where: identity, select: { id: true } });
  });
  const issued = await issueLoginCode(client, user.id);
  if (!issued) return res.status(429).json({ success: false });

  try {
    await nodemailerClient.sendMail({
      from: process.env.MAIL_ID, to: identity.email,
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
