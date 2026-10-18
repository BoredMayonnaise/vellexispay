import { timingSafeEqual } from 'node:crypto'

import { NextResponse, type NextRequest } from 'next/server'

// Edge runtime disables eval, which breaks NextResponse construction on some
// paths. This gate is a single secret compare; Node runtime is the right home.
export const runtime = 'nodejs'

/**
 * Gate the dashboard. It exposes internal tier capacity, so it must not be public.
 *
 * Lives at the project root, not in src/ — with app/ at the root Next does not
 * set srcDir, so src/middleware.ts is silently ignored.
 *
 * If DASHBOARD_TOKEN is unset this fails CLOSED (503). An unset secret must never
 * mean "allow everyone".
 */
export async function middleware(request: NextRequest) {
  const expected = process.env.DASHBOARD_TOKEN

  if (!expected) {
    return new NextResponse('Dashboard disabled: DASHBOARD_TOKEN is not set.', {
      status: 503,
    })
  }

  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!constantTimeEquals(token, expected)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Bearer' },
    })
  }

  return NextResponse.next()
}

/** Length-safe: timingSafeEqual throws on a length mismatch. */
function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export const config = {
  matcher: ['/'],
}