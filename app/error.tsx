'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-sm text-ink-muted">
        The dashboard could not load tier data. The database may be unreachable or
        paused.
      </p>
      {/* digest only — the message and stack stay server-side. */}
      {error.digest ? (
        <p className="font-mono text-xs text-ink-muted">ref: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="w-fit rounded-md border border-line px-3 py-1.5 text-sm font-medium hover:bg-surface"
      >
        Try again
      </button>
    </main>
  )
}