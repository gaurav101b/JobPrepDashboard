"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { topics } from "@/lib/db/schema";

export async function setTopicConfidence(id: number, confidence: number) {
  ensureDb();
  await db
    .update(topics)
    .set({
      confidence: Math.max(0, Math.min(5, Math.round(confidence))),
      updatedAt: new Date(),
    })
    .where(eq(topics.id, id));
  revalidatePath("/hld");
  revalidatePath("/lld");
  revalidatePath("/cs");
  revalidatePath("/hft");
}

export async function setTopicNotes(id: number, notes: string) {
  ensureDb();
  await db.update(topics).set({ notes, updatedAt: new Date() }).where(eq(topics.id, id));
  revalidatePath("/hld");
  revalidatePath("/lld");
  revalidatePath("/cs");
  revalidatePath("/hft");
}

export async function addTopic(domain: string, name: string) {
  ensureDb();
  await db.insert(topics).values({ domain, name });
  revalidatePath("/hld");
  revalidatePath("/lld");
  revalidatePath("/cs");
  revalidatePath("/hft");
}

export async function deleteTopic(id: number) {
  ensureDb();
  await db.delete(topics).where(eq(topics.id, id));
  revalidatePath("/hld");
  revalidatePath("/lld");
  revalidatePath("/cs");
  revalidatePath("/hft");
}
