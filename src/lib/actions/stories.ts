"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { stories } from "@/lib/db/schema";
import { stringifyJsonArray } from "@/lib/json";

export type StoryInput = {
  id?: number;
  title: string;
  competencies?: string[];
  situation?: string | null;
  task?: string | null;
  action?: string | null;
  result?: string | null;
  reflection?: string | null;
  durationMinutes?: number | null;
  starred?: boolean;
};

export async function upsertStory(input: StoryInput) {
  ensureDb();
  const data = {
    title: input.title.trim(),
    competencies: stringifyJsonArray(input.competencies ?? []),
    situation: input.situation || null,
    task: input.task || null,
    action: input.action || null,
    result: input.result || null,
    reflection: input.reflection || null,
    durationMinutes: input.durationMinutes ?? 2,
    starred: input.starred ?? false,
    updatedAt: new Date(),
  };
  if (input.id) {
    await db.update(stories).set(data).where(eq(stories.id, input.id));
  } else {
    await db.insert(stories).values(data);
  }
  revalidatePath("/behavioral");
}

export async function deleteStory(id: number) {
  ensureDb();
  await db.delete(stories).where(eq(stories.id, id));
  revalidatePath("/behavioral");
}
