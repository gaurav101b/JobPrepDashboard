import "server-only";
import { sqlite } from "./index";

let migrated = false;

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL DEFAULT 'DSA',
    title TEXT NOT NULL,
    url TEXT,
    platform TEXT DEFAULT 'LeetCode',
    difficulty TEXT NOT NULL DEFAULT 'Medium',
    topics TEXT NOT NULL DEFAULT '[]',
    companies TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'Todo',
    attempts INTEGER NOT NULL DEFAULT 0,
    time_minutes INTEGER DEFAULT 0,
    insight TEXT,
    notes TEXT,
    source TEXT,
    last_attempted_at INTEGER,
    next_review_at INTEGER,
    review_level INTEGER NOT NULL DEFAULT 0,
    starred INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,
  `CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    remote TEXT,
    status TEXT NOT NULL DEFAULT 'Wishlist',
    source TEXT,
    referral TEXT,
    jd_url TEXT,
    applied_at INTEGER,
    next_step_at INTEGER,
    next_step_note TEXT,
    base_salary REAL,
    bonus REAL,
    equity REAL,
    sign_on REAL,
    total_comp REAL,
    currency TEXT DEFAULT 'INR',
    notes TEXT,
    category TEXT DEFAULT 'SDE',
    resume_version TEXT,
    starred INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,
  `CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    note TEXT,
    source TEXT DEFAULT 'manual',
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,
  `CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    name TEXT NOT NULL,
    confidence INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    resource_url TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,
  `CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    competencies TEXT NOT NULL DEFAULT '[]',
    situation TEXT,
    task TEXT,
    action TEXT,
    result TEXT,
    reflection TEXT,
    duration_minutes INTEGER DEFAULT 2,
    starred INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,
  `CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'Book',
    url TEXT,
    topic TEXT,
    status TEXT NOT NULL DEFAULT 'To-Read',
    rating INTEGER,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,
  `CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL DEFAULT 'weekly',
    title TEXT NOT NULL,
    category TEXT,
    target INTEGER NOT NULL DEFAULT 1,
    progress INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'count',
    start_date INTEGER NOT NULL,
    end_date INTEGER NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,
  `CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'SDE',
    focus TEXT,
    loop_notes TEXT,
    story_plan TEXT DEFAULT '[]',
    starred INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,
  `CREATE TABLE IF NOT EXISTS mocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date INTEGER NOT NULL,
    type TEXT NOT NULL DEFAULT 'DSA',
    platform TEXT,
    interviewer TEXT,
    problem TEXT,
    score INTEGER NOT NULL DEFAULT 3,
    went_well TEXT,
    to_fix TEXT,
    follow_up TEXT,
    duration_minutes INTEGER DEFAULT 45,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
  );`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);`,
  `CREATE INDEX IF NOT EXISTS idx_problems_next_review ON problems(next_review_at);`,
  `CREATE INDEX IF NOT EXISTS idx_problems_kind ON problems(kind);`,
  `CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_started ON study_sessions(started_at);`,
  `CREATE INDEX IF NOT EXISTS idx_topics_domain ON topics(domain);`,
  `CREATE INDEX IF NOT EXISTS idx_goals_dates ON goals(start_date, end_date);`,
  `CREATE INDEX IF NOT EXISTS idx_mocks_date ON mocks(date);`,
];

export function ensureMigrated() {
  if (migrated) return;
  const tx = sqlite.transaction(() => {
    for (const stmt of STATEMENTS) sqlite.exec(stmt);
  });
  tx();
  migrated = true;
}
