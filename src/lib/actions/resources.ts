"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { resources } from "@/lib/db/schema";

export type ResourceInput = {
  id?: number;
  title: string;
  kind?: string;
  url?: string | null;
  topic?: string | null;
  status?: string;
  rating?: number | null;
  notes?: string | null;
};

export async function upsertResource(input: ResourceInput) {
  ensureDb();
  const data = {
    title: input.title.trim(),
    kind: input.kind ?? "Book",
    url: input.url || null,
    topic: input.topic || null,
    status: input.status ?? "To-Read",
    rating: input.rating ?? null,
    notes: input.notes || null,
  };
  if (input.id) {
    await db.update(resources).set(data).where(eq(resources.id, input.id));
  } else {
    await db.insert(resources).values(data);
  }
  revalidatePath("/resources");
}

export async function setResourceStatus(id: number, status: string) {
  ensureDb();
  await db.update(resources).set({ status }).where(eq(resources.id, id));
  revalidatePath("/resources");
}

export async function deleteResource(id: number) {
  ensureDb();
  await db.delete(resources).where(eq(resources.id, id));
  revalidatePath("/resources");
}
