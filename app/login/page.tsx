import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { SESSION_COOKIE } from '@/lib/session'

export default async function Login() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const expected = process.env.DASHBOARD_TOKEN

  if (!expected) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-2 px-6 py-24">
        <h1 className="text-lg font-semibold">Dashboard disabled</h1>
        <p className="text-sm text-ink-muted">
          DASHBOARD_TOKEN is not set. Add it to <code className="font-mono">.env</code> and
          restart the server.
        </p>
      </main>
    )
  }

  if (token && token === expected) {
    redirect('/')
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">vellexispay</h1>
        <p className="text-sm text-ink-muted">
          Enter the dashboard token from <code className="font-mono">.env</code>.
        </p>
      </div>

      <form action="/api/login" method="post" className="flex flex-col gap-3">
        <label htmlFor="token" className="text-sm font-medium">
          Token
        </label>
        <input
          id="token"
          name="token"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="rounded-md border border-line bg-surface-raised px-3 py-2 font-mono text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-accent-strong px-3 py-2 text-sm font-medium text-white hover:bg-accent"
        >
          Sign in
        </button>
      </form>
    </main>
  )
}