export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 rounded bg-surface-raised" />
        <div className="h-4 w-72 rounded bg-surface-raised" />
      </div>
      {/* Matches the tier card height so the swap does not shift layout. */}
      <ul className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-4"
          >
            <div className="h-5 w-32 rounded bg-surface" />
            <div className="h-2 w-full rounded-full bg-surface" />
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading tier data</span>
    </main>
  )
}