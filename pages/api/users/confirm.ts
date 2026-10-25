import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withApiSession } from "@libs/server/withSession";
import {
  OTP_MAX_ATTEMPTS,
  codeMatches,
  isExpired,
  isValidCodeFormat,
} from "@libs/server/otp";

// 실패 사유(없음/만료/잠김/불일치)를 구분하지 않고 동일하게 응답한다
const fail = (res: NextApiResponse<ResponseType>, status = 400) =>
  res.status(status).json({ success: false });

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const pending = req.session.pendingAuth;
  const token = req.body?.token;
  if (!pending || !isValidCodeFormat(token)) return fail(res);

  const latest = await client.token.findFirst({
    where: { userId: pending.userId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest || isExpired(latest.createdAt)) return fail(res);

  // 시도 횟수를 먼저 원자적으로 차감한다. 동시에 여러 번 요청해도 한도를 넘길 수 없다.
  const reserved = await client.token.updateMany({
    where: { id: latest.id, attempts: { lt: OTP_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (reserved.count === 0) return fail(res, 429);

  if (!codeMatches(pending.userId, token, latest.payload)) return fail(res);

  // 한 번만 사용 가능: 동시에 올바른 코드가 두 번 들어와도 하나만 통과한다
  const consumed = await client.token.deleteMany({ where: { id: latest.id } });
  if (consumed.count !== 1) return fail(res);
  await client.token.deleteMany({ where: { userId: pending.userId } });

  delete req.session.pendingAuth;
  req.session.user = { id: pending.userId };
  await req.session.save();
  return res.status(200).json({ success: true });
}

export default withApiSession(
  withHandler({ methods: ["POST"], handlerFn: handler, isPrivate: false })
);
