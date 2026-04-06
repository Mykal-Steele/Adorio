import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DEFAULT_MAIN_HOST = "adorio.space";
const DEFAULT_SOCIAL_HOST = "social.adorio.space";

const normalizeHost = (value: string | null): string => {
  if (!value) return "";
  return value.split(":")[0].toLowerCase();
};

export function middleware(request: NextRequest) {
  const host = normalizeHost(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  const mainHost = (process.env.MAIN_HOST ?? DEFAULT_MAIN_HOST).toLowerCase();
  const socialHost = (process.env.SOCIAL_HOST ?? DEFAULT_SOCIAL_HOST).toLowerCase();
  const { pathname, search } = request.nextUrl;
  const isRscRequest = request.nextUrl.searchParams.has("_rsc") || request.headers.has("rsc");

  if (!host || host.includes("localhost") || host.startsWith("127.0.0.1")) {
    return NextResponse.next();
  }

  if (host === socialHost) {
    if (pathname === "/") {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = "/social";
      return NextResponse.rewrite(rewriteUrl);
    }

    if (pathname === "/social") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  if ((host === mainHost || host === `www.${mainHost}`) && pathname === "/social" && !isRscRequest) {
    const target = new URL(`https://${socialHost}/`);
    target.search = search;
    return NextResponse.redirect(target, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
