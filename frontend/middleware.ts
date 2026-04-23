import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const authed = req.cookies.get("umurava_authed")?.value === "1";
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/jobs") && !authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (pathname === "/login" && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/jobs";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/jobs/:path*", "/login"],
};
