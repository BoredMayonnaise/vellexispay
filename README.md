# vellexispay

Multi-tier model routing. TypeScript (strict) · Next.js App Router · Tailwind CSS · Prisma · Neon Postgres · pnpm · Vitest.

## Setup

```sh
pnpm install
cp .env.example .env   # then fill in the Neon URLs and a DASHBOARD_TOKEN
pnpm db:seed           # creates draft / standard / premium tiers
pnpm dev
```

## Dashboard access

`/` is gated. Open `http://localhost:3000` in a browser — you are redirected to
`/login`, where you paste the token from `.env`. That sets an `httpOnly` session
cookie for 12 hours.

For curl and CI, send the token as a bearer header instead:

```sh
TOKEN=$(grep DASHBOARD_TOKEN .env | cut -d'"' -f2)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/
```

Generate a token with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

If `DASHBOARD_TOKEN` is unset the middleware returns 503 rather than serving —
an unset secret must never mean "open to everyone".

## Database

Neon project `vellexispay`, branch `dev`. Two URLs, same database:

- `DATABASE_URL` — pooled endpoint, for runtime queries
- `DIRECT_URL` — direct endpoint, for `prisma migrate` (it cannot run on the pooler)

```sh
pnpm prisma migrate dev   # schema changes
pnpm db:seed              # upsert the three tiers
```

## Verify

```sh
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```