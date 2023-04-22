import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: number;
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
