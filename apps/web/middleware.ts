import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * In dev mode, Next will 404 for /document/<id> because /document/[...slug]
 * is statically generated only for placeholder routes (index/placeholder).
 *
 * We internally rewrite /document/<anything> -> /document/index
 * while keeping the URL in the browser the same, so the client page can
 * still read the real document id from window.location.pathname.
 *
 * In production static export, this middleware does not run; we rely on
 * the static server rewrites in serve.json instead.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/document/')) return NextResponse.next();

  const rest = pathname.slice('/document/'.length);
  const first = rest.split('/').filter(Boolean)[0];

  // Allow our generated placeholders through without rewriting.
  if (!first || first === 'index' || first === 'placeholder') return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/document/index';
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/document/:path*'],
};

