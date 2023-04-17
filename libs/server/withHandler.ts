import { NextApiRequest, NextApiResponse } from "next";

type Method = "GET" | "POST" | "DELETE";
type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export interface ResponseType {
  success: boolean;
  [key: string]: any;
}

interface Config {
  methods: Method[];
  handlerFn: Handler;
  isPrivate?: boolean;
}

export default function withHandler({
  methods,
  handlerFn,
  isPrivate = true,
}: Config) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    if (!methods.includes(req.method as Method)) {
      return res.status(405).end();
    }
    if (isPrivate && !req.session.user) {
      return res.status(401).json({ success: false, error: "please log in" });
    }
    try {
      await handlerFn(req, res);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error });
    }
  };
}
