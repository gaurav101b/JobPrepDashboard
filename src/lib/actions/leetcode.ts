"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { problems, settings } from "@/lib/db/schema";
import { stringifyJsonArray } from "@/lib/json";
import { fetchRecentAccepted, fetchQuestionDetail, fetchUserStats } from "@/lib/leetcode";
import { DEFAULT_LC_CYCLE_START } from "@/lib/constants";

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60];

function nextReviewAt(level: number): Date {
  const idx = Math.min(level, REVIEW_INTERVALS_DAYS.length - 1);
  return new Date(Date.now() + REVIEW_INTERVALS_DAYS[idx] * 24 * 60 * 60 * 1000);
}

export async function setLeetCodeUsername(username: string) {
  ensureDb();
  const trimmed = username.trim();
  if (!trimmed) {
    await db.delete(settings).where(eq(settings.key, "leetcode.username"));
  } else {
    await db
      .insert(settings)
      .values({ key: "leetcode.username", value: trimmed })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: trimmed },
      });
  }
  revalidatePath("/dsa");
  revalidatePath("/");
}

export async function getLeetCodeUsername(): Promise<string | null> {
  ensureDb();
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "leetcode.username"))
    .get();
  return row?.value ?? null;
}

export async function setLeetCodeCycleStart(dateISO: string) {
  ensureDb();
  const trimmed = dateISO.trim();
  const parsed = trimmed ? new Date(trimmed) : null;
  const value = parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toISOString().slice(0, 10)
    : DEFAULT_LC_CYCLE_START;
  await db
    .insert(settings)
    .values({ key: "leetcode.cycle_start", value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value },
    });
  revalidatePath("/dsa");
  revalidatePath("/");
}

export async function getLeetCodeCycleStart(): Promise<string> {
  ensureDb();
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "leetcode.cycle_start"))
    .get();
  return row?.value ?? DEFAULT_LC_CYCLE_START;
}

export type ImportResult = {
  username: string;
  fetched: number;
  added: number;
  updated: number;
  skipped: number;
  stats: { total: number; easy: number; medium: number; hard: number } | null;
  errors: string[];
};

export async function importLeetCodeRecent(
  usernameInput?: string,
  limit = 30
): Promise<ImportResult> {
  ensureDb();
  let username = usernameInput?.trim() || (await getLeetCodeUsername());
  if (!username) {
    return {
      username: "",
      fetched: 0,
      added: 0,
      updated: 0,
      skipped: 0,
      stats: null,
      errors: ["LeetCode username not set"],
    };
  }
  if (usernameInput && usernameInput.trim() !== username) {
    username = usernameInput.trim();
  }
  if (usernameInput) await setLeetCodeUsername(username);

  const errors: string[] = [];
  let stats: ImportResult["stats"] = null;
  try {
    stats = await fetchUserStats(username);
    if (!stats) errors.push(`No LeetCode user '${username}' found`);
  } catch (e) {
    errors.push(`Stats: ${String(e)}`);
  }

  let subs: Awaited<ReturnType<typeof fetchRecentAccepted>> = [];
  try {
    subs = await fetchRecentAccepted(username, limit);
  } catch (e) {
    errors.push(`Recent: ${String(e)}`);
    return { username, fetched: 0, added: 0, updated: 0, skipped: 0, stats, errors };
  }

  let added = 0;
  let updated = 0;
  let skipped = 0;

  const seenSlugs = new Set<string>();
  const batches = subs.filter((s) => {
    if (seenSlugs.has(s.titleSlug)) return false;
    seenSlugs.add(s.titleSlug);
    return true;
  });

  for (const sub of batches) {
    const url = `https://leetcode.com/problems/${sub.titleSlug}/`;
    const ts = Number(sub.timestamp) * 1000;
    let detail: Awaited<ReturnType<typeof fetchQuestionDetail>> = null;
    try {
      detail = await fetchQuestionDetail(sub.titleSlug);
    } catch (e) {
      errors.push(`Detail ${sub.titleSlug}: ${String(e)}`);
    }

    const topics = detail?.topicTags?.map((t) => t.name) ?? [];
    const difficulty = detail?.difficulty ?? "Medium";

    const existing = await db
      .select()
      .from(problems)
      .where(sql`url = ${url} OR (lower(title) = ${sub.title.toLowerCase()} AND platform = 'LeetCode')`)
      .get();

    if (existing) {
      const existingTopics = JSON.parse(existing.topics || "[]") as string[];
      const mergedTopics = Array.from(new Set([...existingTopics, ...topics]));
      const lastAt = existing.lastAttemptedAt?.getTime() ?? 0;
      if (ts > lastAt) {
        const newLevel = (existing.reviewLevel ?? 0) + 1;
        await db
          .update(problems)
          .set({
            status: "Solved",
            attempts: (existing.attempts ?? 0) + 1,
            lastAttemptedAt: new Date(ts),
            nextReviewAt: nextReviewAt(newLevel),
            reviewLevel: newLevel,
            difficulty,
            url,
            topics: stringifyJsonArray(mergedTopics),
            source: existing.source ?? "LeetCode",
            updatedAt: new Date(),
          })
          .where(eq(problems.id, existing.id));
        updated++;
      } else {
        skipped++;
      }
    } else {
      await db.insert(problems).values({
        kind: "DSA",
        title: sub.title,
        url,
        platform: "LeetCode",
        difficulty,
        topics: stringifyJsonArray(topics),
        companies: "[]",
        status: "Solved",
        attempts: 1,
        timeMinutes: 0,
        lastAttemptedAt: new Date(ts),
        nextReviewAt: nextReviewAt(1),
        reviewLevel: 1,
        source: "LeetCode",
      });
      added++;
    }
    await new Promise((r) => setTimeout(r, 120));
  }

  revalidatePath("/dsa");
  revalidatePath("/");

  return {
    username,
    fetched: batches.length,
    added,
    updated,
    skipped,
    stats,
    errors,
  };
}
