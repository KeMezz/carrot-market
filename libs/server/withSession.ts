import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: number;
    };
    // 인증번호를 발송한 브라우저만 확인 요청을 할 수 있도록 묶어두는 값
    pendingAuth?: {
      userId: number;
      issuedAt: number;
    };
  }
}

const cookieOptions = {
  cookieName: "carrotsession",
  password: process.env.SESSION_PW!,
};

export function withApiSession(
  handlerFn: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse<any>>
) {
  return withIronSessionApiRoute(handlerFn, cookieOptions);
}

export function withSsrSession(handler: any) {
  return withIronSessionSsr(handler, cookieOptions);
}
