"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/init";
import { companies } from "@/lib/db/schema";
import { stringifyJsonArray } from "@/lib/json";

export type CompanyInput = {
  id?: number;
  name: string;
  category?: string;
  focus?: string | null;
  loopNotes?: string | null;
  storyPlan?: string[];
  starred?: boolean;
};

export async function upsertCompany(input: CompanyInput) {
  ensureDb();
  const data = {
    name: input.name.trim(),
    category: input.category ?? "SDE",
    focus: input.focus || null,
    loopNotes: input.loopNotes || null,
    storyPlan: stringifyJsonArray(input.storyPlan ?? []),
    starred: input.starred ?? false,
  };
  if (input.id) {
    await db.update(companies).set(data).where(eq(companies.id, input.id));
  } else {
    await db.insert(companies).values(data);
  }
  revalidatePath("/applications");
  revalidatePath("/behavioral");
}

export async function toggleCompanyStar(id: number) {
  ensureDb();
  const row = await db.select().from(companies).where(eq(companies.id, id)).get();
  if (!row) return;
  await db
    .update(companies)
    .set({ starred: !row.starred })
    .where(eq(companies.id, id));
  revalidatePath("/applications");
}

export async function deleteCompany(id: number) {
  ensureDb();
  await db.delete(companies).where(eq(companies.id, id));
  revalidatePath("/applications");
}
