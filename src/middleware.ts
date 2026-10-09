import { NextResponse, type NextRequest } from "next/server";

/**
 * Optional staff gate for /dashboard (HTTP Basic auth, enforced on the server).
 * Active only when BOTH STAFF_USERNAME and STAFF_PASSWORD are set (server-side variables, NOT NEXT_PUBLIC_*).
 * Leave them unset locally and the dashboard stays open.
 *
 * This protects the dashboard PAGE. The public read-only API (potholes, queue, stats) is public by design
 * (constitution 5.4.1 / RLS), and protected actions still need the crew key / admin key on the backend.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function middleware(req: NextRequest) {
  const user = process.env.STAFF_USERNAME;
  const pass = process.env.STAFF_PASSWORD;
  if (!user || !pass) return NextResponse.next();

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(":");
      if (i > -1 && safeEqual(decoded.slice(0, i), user) && safeEqual(decoded.slice(i + 1), pass)) return NextResponse.next();
    } catch {
      /* fall through to 401 */
    }
  }
  return new NextResponse("Municipality staff only. Sign in to continue.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="PITCREW municipality dashboard", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/dashboard/:path*"] };
