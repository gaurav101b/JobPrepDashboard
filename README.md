# Job Prep · Dashboard

A single-user, self-hosted study and application tracker for software engineering interview prep. Runs on `localhost`. SQLite-backed, no auth, no cloud.

> Vibe-coded with an AI agent — polished where it matters (timer, theme, data flow), rough at the edges (some tabs are intentional stubs). Built for one person; if you fork it, expect to read the code.

<img width="800" height="384" alt="image" src="https://github.com/user-attachments/assets/20505397-47f5-4534-94ee-60db3436fd6c" />

<img width="800" height="642" alt="image" src="https://github.com/user-attachments/assets/47f1c5e7-0304-4267-9ee1-370312573a2d" />

<img width="800" height="622" alt="image" src="https://github.com/user-attachments/assets/9c2973aa-5e49-45d2-b9a0-13d99e76dd13" />

<img width="800" height="481" alt="image" src="https://github.com/user-attachments/assets/836cecf1-115a-4ad1-a6a4-455b2e0cb50d" />


## Highlights

- **Hero Pomodoro** — large central timer, click-to-set category, presets, partial-save, browser notifications, persists across reloads.
- **LeetCode auto-import** — pulls accepted submissions from the public GraphQL API, separates a "this cycle" view from your all-time grind, auto-tags topic + difficulty, feeds a spaced-repetition queue.
- **System Design tracker** — chapter-by-chapter checklists for *Alex Xu — System Design Interview Vol 1* and any Udemy course (URL auto-import or paste-the-curriculum).
- **Application pipeline** — kanban + table, target-company strip with 1-click add to wishlist, ICS export for follow-ups.
- **Spotify Now Playing** — optional widget on the time tracker (OAuth, album art, live progress bar).
- **Goals** with progress bars, **Resources** list, calendar (`.ics`) feed for everything.

## Quick start

```bash
git clone <this-repo>
cd job_prep
npm install
npm run dev
# open http://localhost:3000
```

The SQLite DB at `./data/dashboard.db` is created on first request and seeded with topics, target companies, a NeetCode 150 preview, resources, and STAR stories. The `data/` directory is git-ignored.

## Tabs

| Tab | What's there |
|---|---|
| Dashboard | 4 focus cards (today's study, LC this cycle, apps in flight, streak), heatmap, active goals, upcoming follow-ups |
| Time tracker | Hero pomodoro, Spotify now playing, stats/charts under collapsed cards |
| Goals | Weekly goals + milestones with progress bars, ICS export |
| DSA / LeetCode | "This cycle since `<date>`" stats, all-time totals, LC sync, problems table with filters and spaced-repetition queue |
| System Design | Alex Xu Vol 1 (16 chapters) + Udemy course + custom topics, each with confidence dots and notes |
| Applications | Targets strip with 1-click add, kanban + table view, comp tracker, ICS for follow-ups |
| Resources | Books / courses / blogs / repos with status + rating |
| LLD / HFT / CS / Behavioral / Mocks | Stubs — kept distinct in nav, content lands as it's needed |

## Hero Pomodoro

- Massive central time, click-to-set category chips, 25/5 · 50/10 · 90/15 presets, +5min mid-session.
- Tab title becomes `MM:SS Focus · <task>` so it nags you back when you Alt-Tab.
- Pausing preserves elapsed time. **Save** records partial minutes — no all-or-nothing trap.
- Optional sound (Web Audio chime) + browser notification on phase end.
- State persists across navigation and reloads via `localStorage`.

## Integrations

### LeetCode

Pulls accepted submissions from LeetCode's public GraphQL endpoint — no cookies, no API key, just a username. The DSA tab → `LeetCode` popover lets you:

- **Save your username.** Your *Recent submissions* must be public on `leetcode.com/<username>`.
- **Set a cycle start date** (defaults to `2026-05-01`). Submissions on/after this date count toward "this cycle"; older ones still get imported so the all-time total stays honest. Useful if you want to track a fresh grind without your six-year submission history flattening the chart.
- **Sync** to fetch the latest accepted submissions. New rows insert as `Solved` with auto-tagged topic + difficulty; existing rows bump their spaced-repetition review level. Manual entries are preserved and merged on slug.

Behind the scenes it hits `https://leetcode.com/graphql/` — the same API the LeetCode website uses. Requests are batched and rate-limited gently. The unofficial nature of the endpoint means it can break if they change it; the rest of the app keeps working without sync.

### Spotify

A "now playing" widget on the Time tab — track title, artist, album art, live progress bar, polled every 15s. Built on Spotify's Authorization Code OAuth flow; the refresh token is stored in your local SQLite and access tokens are refreshed on demand.

> Spotify rejects `localhost` and HTTP-without-IP redirect URIs since April 2025. Use `127.0.0.1` everywhere — Spotify dashboard, `.env.local`, and the browser address bar.

**Setup:**

1. Create an app at [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard).
2. Add this **exact** redirect URI on the Spotify dashboard:
   ```
   http://127.0.0.1:3000/api/spotify/callback
   ```
3. Copy `.env.local.example` → `.env.local` and fill in:
   ```
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback
   ```
4. Restart `npm run dev`, open the app at **`http://127.0.0.1:3000`** (not `localhost`), go to `/time`, click **Connect Spotify**, approve.

If env vars aren't set, the widget shows a setup hint and nothing else breaks. If you see "*redirect_uri: Not matching configuration*", the URI in the Spotify dashboard, the value of `SPOTIFY_REDIRECT_URI`, and your browser address bar all have to match character-for-character.

Scopes used: `user-read-currently-playing user-read-playback-state`. No data leaves your machine — Spotify calls go directly from the local Next.js server.

### Calendar (ICS)

Export goals and application follow-ups as a feed any calendar app can subscribe to:

```
http://localhost:3000/api/calendar?include=all          # everything
http://localhost:3000/api/calendar?include=applications # follow-ups only
http://localhost:3000/api/calendar?include=goals        # goals only
```

Works as a Google Calendar import or an Apple Calendar subscription.

## Theming

Three palettes from [Color Hunt](https://colorhunt.co/), cycle on the top-bar button (`Sun → Moon → Sunset → Sun …`):

- **Light** (pastel paper): `#F2EAE0` / `#B4D3D9` / `#BDA6CE` / `#9B8EC7`
- **Dark** (warm slate): `#222831` / `#393E46` / `#948979` / `#DFD0B8`
- **Sunset** (plum + rose + peach): `#4C3A51` / `#774360` / `#B25068` / `#E7AB79`

The base is muted; vibrant per-category accents (DSA indigo, SysDesign violet, LLD pink, MiscTech teal, Work amber) layer on top, plus a per-weekday rainbow tint on day cards in the planner. Choice persists in `localStorage`; first-time visit follows system `prefers-color-scheme`.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **React 19**
- **Tailwind CSS v4** with custom shadcn-style primitives
- **better-sqlite3 + Drizzle ORM** at `./data/dashboard.db`
- **Recharts**, **date-fns**, **lucide-react**, **sonner**
- **Spotify Web API** (Authorization Code OAuth)
- **LeetCode GraphQL** (unofficial public endpoint)

## Scripts

```bash
npm run dev          # start dev on :3000
npm run build        # production build
npm run start        # serve production build
npm run lint
npm run db:backup    # snapshot ./data/dashboard.db -> ./data/backups/
npm run db:reset     # nuke the DB (re-seeds on next run)
```

## License

MIT — do whatever, no warranty.
