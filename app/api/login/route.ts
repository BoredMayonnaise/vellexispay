import { timingSafeEqual } from 'node:crypto'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { SESSION_COOKIE, MAX_TOKEN_LENGTH, SESSION_MAX_AGE } from '@/lib/session'

export async function POST(request: Request) {
  const expected = process.env.DASHBOARD_TOKEN

  if (!expected) {
    return Response.json({ error: 'dashboard disabled' }, { status: 503 })
  }

  const form = await request.formData()
  const token = String(form.get('token') ?? '')

  // Unbounded input would be hashed/compared at any length.
  if (token.length > MAX_TOKEN_LENGTH || !matches(token, expected)) {
    return Response.json({ error: 'invalid token' }, { status: 401 })
  }

  const jar = await cookies()
  jar.set(SESSION_COOKIE, expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  redirect('/')
}

function matches(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}