<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Guide — `job_prep`

If you are an AI agent that just took over this repo: read this once before touching anything. The owner is solo, the app is a personal tool, the bar is "make me ship more applications without losing focus."

## What this app is

A personal SDE/HFT interview prep tracker. Single-user, runs on `localhost:3000`, file-backed SQLite at `./data/dashboard.db`. No auth. No multi-tenant. The `data/` directory is git-ignored.

The hero is the **Time tracker page** (`/time`) — its Pomodoro is the central focus surface; everything else is supportive.

## How to run / host

```bash
# install
npm install

# dev (Turbopack, hot reload, opens on :3000)
npm run dev

# verify changes don't break the build
npm run lint
npx tsc --noEmit
npm run build
```

There is no production deployment. The owner runs `npm run dev` locally when working. If you need to "host" it elsewhere, copy the repo + the `data/` directory and `npm run start` after a build — but the `127.0.0.1:3000` redirect URI configured for Spotify only works locally; you'd need to update the Spotify app and `SPOTIFY_REDIRECT_URI` env var.

**Spotify gotcha:** as of April 2025 Spotify rejects `localhost` and any HTTP redirect URI that isn't a loopback IP. The default redirect we ship is `http://127.0.0.1:3000/api/spotify/callback`. The user must (a) register exactly that string on the dashboard, (b) keep `SPOTIFY_REDIRECT_URI` matching, and (c) actually visit the app at `http://127.0.0.1:3000` (not `http://localhost:3000`) when clicking "Connect Spotify". If anything mismatches, Spotify replies `redirect_uri: Not matching configuration`.

DB lifecycle:

| Command | Effect |
|---|---|
| `npm run dev` | If DB is missing, creates + runs the v3 seed migration. If `seeded=v1` or `v2`, runs migration to v3 and stops. If `seeded=v3`, no-op. |
| `npm run db:backup` | Copies `data/dashboard.db` to `data/backups/<timestamp>.db`. |
| `npm run db:reset` | **Deletes the DB.** Next request re-creates and re-seeds it. |

## Architecture in 60 seconds

- **Next.js 16 App Router**, all routes are server-rendered (`export const dynamic = "force-dynamic"`).
- **Drizzle ORM + better-sqlite3** for storage. Schema lives in `src/lib/db/schema.ts`. Migrations are hand-written in `src/lib/db/migrate.ts` (just `CREATE TABLE IF NOT EXISTS`). Seed + version migrations live in `src/lib/db/seed.ts`.
- **Server actions** for all mutations (`src/lib/actions/*.ts`). They `revalidatePath()` the routes they touch.
- **Server-side queries** in `src/lib/queries.ts` for all read helpers used by RSC pages.
- **Charts** are Recharts (`src/components/charts/`). They render fine in the dark and warm-paper themes — colors come from `CATEGORY_COLORS` in `src/lib/constants.ts`.
- **Theme** uses CSS variables in `src/app/globals.css`. Three palettes selectable from the topbar button (single-click cycle): pastel light (`F2EAE0/B4D3D9/BDA6CE/9B8EC7`), warm slate dark (`222831/393E46/948979/DFD0B8`), and sunset teal+copper (`2C3639/3F4E4F/A27B5C/DCD7C9`). Sunset is implemented as `.dark .sunset` on `<html>` so Tailwind's `dark:` variants still apply; the `.sunset` block in `globals.css` overrides only the palette variables that differ from plain dark. A pre-hydration script in `src/app/layout.tsx` reads `localStorage.theme` and sets the classes before paint to avoid flicker. Default for first-time visit follows `prefers-color-scheme`.

## Conventions

1. **Categories.** There are exactly **5** study categories: `DSA`, `SysDesign`, `LLD`, `MiscTech`, `Work`. Display labels live in `CATEGORY_LABELS`. Do **not** introduce new categories without bumping the seed version and migrating existing rows. The user explicitly asked for low granularity.
2. **Component library.** Use the shadcn-style primitives in `src/components/ui/`. Don't pull in another UI lib; consistency matters more than flexibility here.
3. **Date handling.** All "today" logic uses `startOfDay()` / `todayISO()` from `src/lib/utils.ts`. Don't reinvent.
4. **Tabs to leave alone.** `/lld`, `/hft`, `/cs`, `/behavioral`, `/mocks` are intentional stubs (`<ComingSoon/>`). Don't promote them to real pages without an explicit ask.
5. **System Design page** is built around **Alex Xu Vol 1** + a **Udemy** course. Vol 2 was dropped per user feedback. Coursera is **not** in scope.
6. **Confidence scale** for HLD topics is `0..5` (0 = untouched). Don't change without migrating data.
7. **Cycle tracking.** "This cycle" on DSA is gated by the `leetcode.cycle_start` setting (default `2026-05-01`). The all-time view should always remain available so the user can see their full LeetCode history.
8. **Spotify.** Only OAuth via Authorization Code flow. Refresh token lives in the `settings` table; client id/secret live in `.env.local`. Never log tokens. If the env vars are missing the widget should fail gracefully.
9. **No emojis** in commits, code comments, or prose unless the user asks for them. The owner explicitly disallows them.

## Where to find things

```
src/app/                   # routes
  page.tsx                 # /         dashboard
  time/page.tsx            # /time     hero pomodoro + spotify + collapsible stats
  dsa/page.tsx             # /dsa      LeetCode + cycle stats + table
  hld/page.tsx             # /hld      Alex Xu Vol 1 + Udemy + Custom
  applications/page.tsx    # /apps     targets strip + kanban
  goals/page.tsx           # /goals
  resources/page.tsx       # /resources
  api/calendar/route.ts    # ICS feed
  api/spotify/*            # OAuth + now-playing endpoints
  {hft,cs,lld,behavioral,mocks}/page.tsx  # ComingSoon stubs

src/components/
  nav/                     # sidebar, topbar, mobile nav, nav-config
  charts/                  # heatmap, category-bars, category-donut, line-trend
  quick/                   # log-problem, log-app, log-session dialogs
  time/                    # pomodoro-timer, now-playing, session-row-actions, manual-log
  dsa/                     # leetcode-import, problems-table, solved-by-difficulty, topics-bars
  hld/                     # track-section, add-custom, udemy-import
  applications/            # log-app-button, app-card, applications-board, targets-strip
  goals/                   # goal-card, goal-form-dialog, new-goal-button
  resources/               # resource-form, resources-list
  ui/                      # button, card, input, dialog, popover, ...
  stat-card.tsx, page-header.tsx, empty-state.tsx, coming-soon.tsx

src/lib/
  db/                      # index.ts, schema.ts, migrate.ts, seed.ts, init.ts
  actions/                 # server actions per domain
  queries.ts               # server-side reads
  constants.ts             # categories, statuses, companies, HLD tracks
  utils.ts                 # cn(), formatMinutes(), startOfDay(), todayISO()
  json.ts                  # parse/stringify JSON-as-text-column helpers
  leetcode.ts              # LC GraphQL client
  spotify.ts               # Spotify OAuth + API client
  udemy.ts                 # best-effort curriculum scraper
  ics.ts                   # iCalendar builder
```

## Common tasks

### Add a stat card to the dashboard
1. Server-side: add a query helper to `src/lib/queries.ts` (it should call `ensureDb()` first).
2. RSC page (`src/app/page.tsx`): await it alongside the other queries.
3. Use `<BigCard/>` (defined in the same file) or `<StatCard/>` from `src/components/stat-card.tsx`. Pick a category-aligned `accent`.

### Add a column to an existing table
1. Add the column to `src/lib/db/schema.ts` and `src/lib/db/migrate.ts` (`ALTER TABLE` is fine — write it idempotent: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` doesn't exist in SQLite, so wrap in a try/catch in `migrate.ts` or check via `PRAGMA table_info`).
2. Update relevant action / query types.
3. Bump `SEED_VERSION` in `src/lib/db/seed.ts` and add a migration step if you need to backfill.

### Add a new category
**Don't, unless the owner asks.** If they do:
1. Update `STUDY_CATEGORIES`, `CATEGORY_LABELS`, `CATEGORY_COLORS`, `CATEGORY_DESCRIPTIONS` in `src/lib/constants.ts`.
2. Bump seed version and add a migration in `src/lib/db/seed.ts` if existing rows need rewriting.
3. The Pomodoro `loadState()` already falls back to `DSA` for unknown categories.

### Re-seed companies
Edit `TARGET_COMPANIES` in `src/lib/constants.ts`, bump `SEED_VERSION`, and add a migration step that does `DELETE FROM companies` + re-insert (see `migrateToV2()` for the pattern).

### Debug a route
- Server logs print to whichever terminal is running `npm run dev`.
- For DB inspection: `sqlite3 data/dashboard.db` then `.tables` / `.schema <table>` / SQL.
- For Spotify token issues: `sqlite3 data/dashboard.db "SELECT key, value FROM settings WHERE key LIKE 'spotify.%'"` — clear with `DELETE FROM settings WHERE key LIKE 'spotify.%'`.

## Things to be careful about

- **Server actions must be `async`.** Helper functions in `src/lib/actions/*.ts` files that aren't exported as actions need to be moved out — Next.js will fail the build otherwise.
- **`STUDY_CATEGORIES` enum.** TypeScript narrows the union to those 5 strings. If you ever read a category from the DB that isn't in the union, cast through `as StudyCategory` and have a fallback color (`?? "#64748b"`). Don't loosen the type.
- **Recharts SSR width=-1 warnings** are noise — they hydrate fine on the client. Don't try to fix them.
- **`react-hooks/purity` and `react-hooks/set-state-in-effect`** are disabled in `eslint.config.mjs` with explicit reasoning. Don't re-enable; the patterns are intentional.
- **Don't commit `data/`.** It's git-ignored.
- **Don't commit `.env.local`.** It's git-ignored. Only the `.env.local.example` template ships with the repo.
- **Don't add auth.** This is `localhost`-only by design.

## Working agreement with the owner

The owner's communication preferences are encoded in their Cursor user rules: be brutally concise, lead with the conclusion, no sycophantic filler, no emojis, prefer structured data over prose. Default to action — if the task is clear, ship the change and report the diff. Ask only when there's a real fork in the road.

When you complete a feature, leave a short, technical commit message explaining the *why*. Squash trivial intermediate commits. The owner reads diffs, not changelogs.
