# Job Prep · Dashboard

> A personal study + application tracker for SDE / HFT interview prep. Single-user, file-backed SQLite, no auth, no cloud. Runs at `http://localhost:3000`.

## What this is

A focus-first dashboard built around an ADHD-friendly Pomodoro timer. It tracks:

- **Study time** by category (DSA, System Design, LLD, Misc Tech, Work) with a hero timer and stacked daily bars.
- **DSA / LeetCode** with a "this cycle" view that separates recent grind from years-old submissions, plus spaced repetition for the problems you keep forgetting.
- **System Design** as a chapter-by-chapter checklist for *Alex Xu — System Design Interview Vol 1* and any Udemy course you're following (auto-import or paste-the-curriculum).
- **Applications** with a pipeline kanban, target companies aimed at ~60–70L+ TC at 4 YoE, ICS calendar export for follow-ups.
- **Goals**, **Resources**, **Behavioral / Stories** (stub), **HFT / CS / LLD / Mocks** (stubs).
- **Spotify Now Playing** widget on the Time tracker (optional, OAuth).

## Vibe-coded disclaimer

This is a vibe-coded personal tool — built fast, iterated with an AI agent, polished where it matters (timer, theme, data flow), rough where it doesn't (some pages are still stubs, the Udemy scrape is best-effort, there's no auth because this runs on `localhost`). It is **not** a multi-tenant product. If you fork it for yourself, expect to read the code.

## Quick start

```bash
git clone <this-repo>
cd job_prep
npm install
npm run dev
# open http://localhost:3000
```

The SQLite DB at `./data/dashboard.db` is created on first request and seeded with topics, target companies, NeetCode 150 preview, resources, and STAR stories. The `data/` directory is git-ignored.

## Tabs

| Tab | What's there |
|---|---|
| Dashboard | 4 focus cards (today's study, LC this cycle, apps in flight, streak) + heatmap + active goals + upcoming follow-ups |
| Time tracker | Hero pomodoro (huge time, click-to-set category, presets, partial-save) + Spotify now playing + stats/charts under collapsed cards |
| Goals | Weekly goals + milestones with progress bars, ICS calendar export |
| DSA / LeetCode | "This cycle since `<date>`" stats, all-time totals, LC auto-import, problems table with filters and spaced-repetition queue |
| System Design | Alex Xu Vol 1 (16 chapters) + Udemy course (auto-import / paste / manual) + custom topics, each with confidence dots and notes |
| Applications | Targets strip (curated 60–70L+ companies, 1-click add), kanban + table view, comp tracker, ICS for follow-ups |
| Resources | Books / courses / blogs / repos with status + rating |
| LLD / HFT / CS / Behavioral / Mocks | Stubs — kept distinct in nav, content arrives as I need it |

## Hero Pomodoro

- Massive central time, click-to-set category chips, 25/5 · 50/10 · 90/15 presets, +5min mid-session.
- Tab title becomes `MM:SS Focus · <task>` so it nags you back when you Alt-Tab.
- Pausing preserves elapsed time. **Save** records partial minutes — no all-or-nothing trap.
- Optional sound (Web Audio chime) + browser notification on phase end.
- State persists across navigation and reloads via `localStorage`.

## LeetCode auto-import

DSA page → `LeetCode` popover:

1. Save your LeetCode username (public profile required — make sure *Recent submissions* is public).
2. Set the cycle start date (defaults to **2026-05-01** — submissions on/after this date count toward "this cycle"; older ones still get imported so the all-time total is honest).
3. `Sync` pulls your latest accepted submissions and merges them into the problem table. Existing rows bump review level; new rows insert as `Solved` with auto-tagged topic + difficulty.

No auth, no cookies — just `https://leetcode.com/graphql/`.

## Spotify Now Playing (optional)

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
2. Add `http://localhost:3000/api/spotify/callback` as a Redirect URI.
3. Copy `.env.local.example` → `.env.local` and fill in:
   ```
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
   ```
4. Restart `npm run dev`.
5. On `/time`, click **Connect Spotify** → approve → done. The widget polls `/api/spotify/now-playing` every 15s.

If env vars aren't set, the widget shows a setup hint instead — nothing else breaks.

## Calendar export (Google Calendar / Apple Calendar)

```
http://localhost:3000/api/calendar?include=all          # everything
http://localhost:3000/api/calendar?include=applications # follow-ups only
http://localhost:3000/api/calendar?include=goals        # goals only
```

Standard ICS. Works as a Google Calendar import or an Apple Calendar subscription.

## Theming

Two palettes pulled from [Color Hunt](https://colorhunt.co/):

- **Light** (pastel paper): `#F2EAE0` / `#B4D3D9` / `#BDA6CE` / `#9B8EC7`
- **Dark** (warm slate): `#222831` / `#393E46` / `#948979` / `#DFD0B8`

The base is muted/pastel; vibrant accent colors (DSA indigo, SysDesign violet, LLD pink, MiscTech teal, Work amber) are layered on top for category cues. Toggle with the sun/moon icon in the top bar; defaults to system preference.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **React 19**
- **Tailwind CSS v4** with custom shadcn-style primitives
- **better-sqlite3 + Drizzle ORM** at `./data/dashboard.db`
- **Recharts** for charts, **date-fns**, **lucide-react**
- **sonner** for toasts
- **Spotify Web API** (Authorization Code OAuth) for Now Playing
- **LeetCode GraphQL** (unofficial public API) for submissions sync

## Scripts

```bash
npm run dev          # start dev on :3000
npm run build        # production build (smoke test)
npm run start        # serve production build
npm run lint         # eslint
npm run db:backup    # snapshot ./data/dashboard.db -> ./data/backups/
npm run db:reset     # nuke the DB (re-seeds on next run)
```

## Project layout

```
src/
  app/                  # routes (one folder per tab) + API endpoints
    api/calendar/       # ICS feed
    api/spotify/        # OAuth login, callback, now-playing, disconnect
  components/
    ui/                 # button, card, input, dialog, popover, ...
    nav/                # sidebar, top bar, mobile nav
    charts/             # heatmap, bars, donut, line trend
    quick/              # quick-log dialogs (problem, app, session)
    time/               # pomodoro-timer, now-playing, manual-log
    dsa/                # leetcode-import, problems-table, charts
    hld/                # track-section, add-custom, udemy-import
    applications/       # board, app card, log button, targets-strip
    goals/              # goal form/dialog/cards
    resources/          # form + list
  lib/
    db/                 # drizzle schema + migrate + seed + init
    actions/            # server actions (problems, apps, sessions, goals,
                        # resources, topics, leetcode, udemy, ...)
    queries.ts          # server-side read helpers
    leetcode.ts         # LeetCode GraphQL fetcher
    spotify.ts          # Spotify OAuth + API helpers
    udemy.ts            # best-effort Udemy curriculum scraper
    ics.ts              # iCalendar builder
    constants.ts        # categories, statuses, target companies, seed lists
    utils.ts            # cn(), formatMinutes(), date helpers
data/
  dashboard.db          # auto-created, gitignored
.env.local.example      # template — copy to .env.local for Spotify
AGENTS.md               # guide for AI agents that work on this repo
```

## Backing up

The DB is a single SQLite file. Pick one:

- `npm run db:backup` to snapshot into `./data/backups/`.
- Copy `data/dashboard.db` periodically.
- Commit `data/` to a *private* repo (it's small; `.gitignore` excludes it by default).

## License

MIT — do whatever, no warranty. See `LICENSE` if present.
