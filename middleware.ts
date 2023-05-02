import {
  NextFetchEvent,
  NextRequest,
  NextResponse,
  userAgent,
} from "next/server";

export const config = {
  matcher: "/",
};

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const ua = userAgent(req);
  if (ua.isBot) {
    return NextResponse.json({ message: "Bot Not Allowed" }, { status: 403 });
  }
  if (
    !req.cookies.has("carrotsession") &&
    !req.nextUrl.pathname.startsWith("/enter")
  ) {
    req.nextUrl.pathname = "/enter";
    return NextResponse.redirect(req.nextUrl);
  }
}
