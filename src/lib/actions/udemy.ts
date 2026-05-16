"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { settings, topics } from "@/lib/db/schema";
import { scrapeUdemyCurriculum } from "@/lib/udemy";

export type UdemyImportResult = {
  ok: boolean;
  courseTitle: string | null;
  imported: number;
  skipped: number;
  error?: string;
  lecturesPreview?: string[];
};

export async function setUdemyCourseUrl(url: string) {
  ensureDb();
  const trimmed = url.trim();
  if (!trimmed) {
    await db.delete(settings).where(eq(settings.key, "udemy.course_url"));
  } else {
    await db
      .insert(settings)
      .values({ key: "udemy.course_url", value: trimmed })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: trimmed },
      });
  }
  revalidatePath("/hld");
}

export async function getUdemyCourseUrl(): Promise<string | null> {
  ensureDb();
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "udemy.course_url"))
    .get();
  return row?.value ?? null;
}

export async function bulkAddUdemyLectures(
  lines: string[],
  domain = "HLD-Udemy"
): Promise<{ added: number; skipped: number }> {
  ensureDb();
  const cleaned = lines
    .map((l) => l.trim())
    .filter((l) => l.length >= 2 && l.length <= 200);
  if (cleaned.length === 0) return { added: 0, skipped: 0 };

  const existing = await db
    .select()
    .from(topics)
    .where(eq(topics.domain, domain))
    .all();
  const seen = new Set(existing.map((t) => t.name));
  let added = 0;
  let skipped = 0;
  for (const name of cleaned) {
    if (seen.has(name)) {
      skipped += 1;
      continue;
    }
    await db.insert(topics).values({ domain, name, confidence: 0 });
    seen.add(name);
    added += 1;
  }
  revalidatePath("/hld");
  return { added, skipped };
}

export async function importUdemyFromUrl(url: string): Promise<UdemyImportResult> {
  ensureDb();
  try {
    const curriculum = await scrapeUdemyCurriculum(url);
    if (curriculum.lectures.length === 0) {
      return {
        ok: false,
        courseTitle: curriculum.courseTitle,
        imported: 0,
        skipped: 0,
        error:
          "Couldn't find lectures on the page (Udemy varies markup by course). Use 'Paste curriculum' instead.",
      };
    }
    await setUdemyCourseUrl(url);
    const { added, skipped } = await bulkAddUdemyLectures(curriculum.lectures);
    return {
      ok: true,
      courseTitle: curriculum.courseTitle,
      imported: added,
      skipped,
      lecturesPreview: curriculum.lectures.slice(0, 5),
    };
  } catch (e) {
    return {
      ok: false,
      courseTitle: null,
      imported: 0,
      skipped: 0,
      error: String(e instanceof Error ? e.message : e),
    };
  }
}
