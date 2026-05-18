"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ListChecks,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toggleListProblem } from "@/lib/actions/study-lists";
import { lcProblemUrl, type StudyList } from "@/lib/constants";

const DIFF_CLASS: Record<string, string> = {
  Easy: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
  Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
  Hard: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40",
};

export function StudyListSection({
  list,
  statusByUrl,
  defaultOpen = false,
}: {
  list: StudyList;
  statusByUrl: Record<string, string>;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const total = list.problems.length;
  const done = useMemo(
    () =>
      list.problems.filter(
        (p) => statusByUrl[lcProblemUrl(p.slug)] === "Solved"
      ).length,
    [list.problems, statusByUrl]
  );
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const isSolved = (slug: string) =>
    statusByUrl[lcProblemUrl(slug)] === "Solved";

  // Global serial number per item (1..N) based on the curated source order,
  // so e.g. LeetCode 75's items are numbered 1..75 across all topic groups.
  const indexBySlug = useMemo(() => {
    const out: Record<string, number> = {};
    list.problems.forEach((p, i) => {
      out[p.slug] = i + 1;
    });
    return out;
  }, [list.problems]);
  const indexWidthCh = String(total).length;

  const grouped = useMemo(() => {
    const items = list.problems;
    const map = new Map<string, typeof items>();
    for (const p of items) {
      const arr = map.get(p.topic) ?? [];
      arr.push(p);
      map.set(p.topic, arr);
    }
    return Array.from(map.entries());
  }, [list.problems]);

  return (
    <Card>
      <CardContent className="p-3 md:p-4 space-y-3">
        <button
          className="w-full flex items-center justify-between gap-3 text-left"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <div className="flex items-center gap-2 min-w-0">
            {open ? (
              <ChevronDown className="size-4 text-[hsl(var(--muted-foreground))]" />
            ) : (
              <ChevronRight className="size-4 text-[hsl(var(--muted-foreground))]" />
            )}
            <ListChecks className="size-4 text-[hsl(var(--ring))]" />
            <h3 className="text-sm font-semibold">{list.title}</h3>
            <Link
              href={list.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              aria-label="Open source"
            >
              <ExternalLink className="size-3" />
            </Link>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs tabular-nums text-[hsl(var(--muted-foreground))]">
              {done}/{total}{" "}
              <span className="text-[hsl(var(--muted-foreground))]/70">· {pct}%</span>
            </span>
          </div>
        </button>

        <Progress
          value={pct}
          indicatorClassName={
            pct >= 100
              ? "bg-emerald-500"
              : pct >= 60
              ? "bg-emerald-500/80"
              : pct >= 30
              ? "bg-indigo-500"
              : "bg-amber-500"
          }
        />

        {list.description ? (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {list.description}
          </p>
        ) : null}

        {open ? (
          <div className="space-y-3 pt-1">
            {grouped.map(([topic, items]) => {
              const tDone = items.filter((p) => isSolved(p.slug)).length;
              return (
                <section key={topic}>
                  <header className="flex items-baseline justify-between gap-2 mb-1.5 px-1">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      {topic}
                    </h4>
                    <span className="text-[10px] tabular-nums text-[hsl(var(--muted-foreground))]/80">
                      {tDone}/{items.length}
                    </span>
                  </header>
                  <ul className="divide-y divide-[hsl(var(--border))]/40">
                    {items.map((p) => (
                      <ListRow
                        key={p.slug}
                        listId={list.id}
                        slug={p.slug}
                        title={p.title}
                        topic={p.topic}
                        difficulty={p.difficulty}
                        done={isSolved(p.slug)}
                        index={indexBySlug[p.slug]}
                        indexWidthCh={indexWidthCh}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ListRow({
  listId,
  slug,
  title,
  topic,
  difficulty,
  done,
  index,
  indexWidthCh,
}: {
  listId: string;
  slug: string;
  title: string;
  topic: string;
  difficulty: string;
  done: boolean;
  index: number;
  indexWidthCh: number;
}) {
  const [pending, start] = useTransition();
  const onToggle = () =>
    start(async () => {
      await toggleListProblem({
        listId,
        slug,
        title,
        topic,
        difficulty,
      });
    });

  return (
    <li
      className={
        "flex items-center gap-2 py-1.5 px-1 hover:bg-[hsl(var(--accent))]/30 rounded-sm " +
        (done ? "opacity-70" : "")
      }
    >
      <span
        className="text-[11px] tabular-nums text-[hsl(var(--muted-foreground))]/70 text-right shrink-0"
        style={{ minWidth: `${indexWidthCh + 1}ch` }}
        aria-hidden="true"
      >
        {index}.
      </span>
      <Checkbox
        checked={done}
        onCheckedChange={onToggle}
        disabled={pending}
        className="size-4"
      />
      <Link
        href={lcProblemUrl(slug)}
        target="_blank"
        rel="noreferrer"
        className={
          "flex-1 text-sm truncate hover:underline " +
          (done ? "line-through text-[hsl(var(--muted-foreground))]" : "")
        }
        title={title}
      >
        {title}
      </Link>
      <Badge
        variant="outline"
        className={
          "text-[10px] px-1.5 py-0 font-medium " +
          (DIFF_CLASS[difficulty] ?? "")
        }
      >
        {difficulty}
      </Badge>
    </li>
  );
}
