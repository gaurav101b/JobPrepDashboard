import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  real,
} from "drizzle-orm/sqlite-core";

const ts = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

export const problems = sqliteTable("problems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull().default("DSA"),
  title: text("title").notNull(),
  url: text("url"),
  platform: text("platform").default("LeetCode"),
  difficulty: text("difficulty").notNull().default("Medium"),
  topics: text("topics").notNull().default("[]"),
  companies: text("companies").notNull().default("[]"),
  status: text("status").notNull().default("Todo"),
  attempts: integer("attempts").notNull().default(0),
  timeMinutes: integer("time_minutes").default(0),
  insight: text("insight"),
  notes: text("notes"),
  source: text("source"),
  lastAttemptedAt: integer("last_attempted_at", { mode: "timestamp_ms" }),
  nextReviewAt: integer("next_review_at", { mode: "timestamp_ms" }),
  reviewLevel: integer("review_level").notNull().default(0),
  starred: integer("starred", { mode: "boolean" }).notNull().default(false),
  createdAt: ts(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  location: text("location"),
  remote: text("remote"),
  status: text("status").notNull().default("Wishlist"),
  source: text("source"),
  referral: text("referral"),
  jdUrl: text("jd_url"),
  appliedAt: integer("applied_at", { mode: "timestamp_ms" }),
  nextStepAt: integer("next_step_at", { mode: "timestamp_ms" }),
  nextStepNote: text("next_step_note"),
  baseSalary: real("base_salary"),
  bonus: real("bonus"),
  equity: real("equity"),
  signOn: real("sign_on"),
  totalComp: real("total_comp"),
  currency: text("currency").default("INR"),
  notes: text("notes"),
  category: text("category").default("SDE"),
  resumeVersion: text("resume_version"),
  starred: integer("starred", { mode: "boolean" }).notNull().default(false),
  createdAt: ts(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const studySessions = sqliteTable("study_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  minutes: integer("minutes").notNull(),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  endedAt: integer("ended_at", { mode: "timestamp_ms" }),
  note: text("note"),
  source: text("source").default("manual"),
  createdAt: ts(),
});

export const topics = sqliteTable("topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  domain: text("domain").notNull(),
  name: text("name").notNull(),
  confidence: integer("confidence").notNull().default(1),
  notes: text("notes"),
  resourceUrl: text("resource_url"),
  createdAt: ts(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const stories = sqliteTable("stories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  competencies: text("competencies").notNull().default("[]"),
  situation: text("situation"),
  task: text("task"),
  action: text("action"),
  result: text("result"),
  reflection: text("reflection"),
  durationMinutes: integer("duration_minutes").default(2),
  starred: integer("starred", { mode: "boolean" }).notNull().default(false),
  createdAt: ts(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  kind: text("kind").notNull().default("Book"),
  url: text("url"),
  topic: text("topic"),
  status: text("status").notNull().default("To-Read"),
  rating: integer("rating"),
  notes: text("notes"),
  createdAt: ts(),
});

export const goals = sqliteTable("goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull().default("weekly"),
  title: text("title").notNull(),
  category: text("category"),
  target: integer("target").notNull().default(1),
  progress: integer("progress").notNull().default(0),
  unit: text("unit").default("count"),
  startDate: integer("start_date", { mode: "timestamp_ms" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp_ms" }).notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  createdAt: ts(),
});

export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  category: text("category").notNull().default("SDE"),
  focus: text("focus"),
  loopNotes: text("loop_notes"),
  storyPlan: text("story_plan").default("[]"),
  starred: integer("starred", { mode: "boolean" }).notNull().default(false),
  createdAt: ts(),
});

export const mocks = sqliteTable("mocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: integer("date", { mode: "timestamp_ms" }).notNull(),
  type: text("type").notNull().default("DSA"),
  platform: text("platform"),
  interviewer: text("interviewer"),
  problem: text("problem"),
  score: integer("score").notNull().default(3),
  wentWell: text("went_well"),
  toFix: text("to_fix"),
  followUp: text("follow_up"),
  durationMinutes: integer("duration_minutes").default(45),
  createdAt: ts(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type StudySession = typeof studySessions.$inferSelect;
export type NewStudySession = typeof studySessions.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Mock = typeof mocks.$inferSelect;
export type NewMock = typeof mocks.$inferInsert;
