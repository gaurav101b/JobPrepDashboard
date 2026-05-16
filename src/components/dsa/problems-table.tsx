"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  Star,
  StarOff,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Circle,
  Pencil,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteProblem,
  logAttempt,
  toggleProblemStar,
} from "@/lib/actions/problems";
import {
  QuickLogProblemDialog,
  type ProblemDraft,
} from "@/components/quick/quick-log-problem";
import { toast } from "sonner";
import {
  PROBLEM_DIFFICULTIES,
  PROBLEM_KINDS,
  PROBLEM_STATUSES,
} from "@/lib/constants";

export type Row = {
  id: number;
  kind: string;
  title: string;
  url: string | null;
  platform: string | null;
  difficulty: string;
  topics: string[];
  companies: string[];
  status: string;
  attempts: number;
  timeMinutes: number;
  insight: string | null;
  source: string | null;
  lastAttemptedAt: Date | null;
  nextReviewAt: Date | null;
  reviewLevel: number;
  starred: boolean;
  notes: string | null;
};

type SortKey = "recent" | "title" | "due" | "difficulty";

const DIFF_BADGE: Record<string, string> = {
  Easy: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
  Medium: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  Hard: "text-rose-300 border-rose-500/40 bg-rose-500/10",
};

const STATUS_BADGE: Record<string, string> = {
  Todo: "text-zinc-300 border-zinc-500/30 bg-zinc-500/10",
  Solved: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
  "Need Review": "text-amber-300 border-amber-500/40 bg-amber-500/10",
};

export function ProblemsTable({
  rows,
  topics: allTopics,
  initialDueOnly,
}: {
  rows: Row[];
  topics: string[];
  initialDueOnly: boolean;
}) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [dueOnly, setDueOnly] = useState(initialDueOnly);
  const [sortKey, setSortKey] = useState<SortKey>("recent");
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<Row | null>(null);

  const filtered = useMemo(() => {
    let r = rows.slice();
    if (kind !== "all") r = r.filter((x) => x.kind === kind);
    if (difficulty !== "all") r = r.filter((x) => x.difficulty === difficulty);
    if (status !== "all") r = r.filter((x) => x.status === status);
    if (topic !== "all") r = r.filter((x) => x.topics.includes(topic));
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.title.toLowerCase().includes(s) ||
          x.topics.some((t) => t.toLowerCase().includes(s)) ||
          x.companies.some((c) => c.toLowerCase().includes(s))
      );
    }
    if (dueOnly) {
      const now = Date.now();
      r = r.filter((x) => x.nextReviewAt && x.nextReviewAt.getTime() <= now);
    }
    if (sortKey === "title") {
      r.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortKey === "difficulty") {
      const order: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
      r.sort((a, b) => (order[a.difficulty] ?? 9) - (order[b.difficulty] ?? 9));
    } else if (sortKey === "due") {
      r.sort((a, b) => {
        const at = a.nextReviewAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bt = b.nextReviewAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return at - bt;
      });
    } else {
      r.sort((a, b) => {
        const at = a.lastAttemptedAt?.getTime() ?? 0;
        const bt = b.lastAttemptedAt?.getTime() ?? 0;
        return bt - at;
      });
    }
    return r;
  }, [rows, kind, difficulty, status, topic, search, dueOnly, sortKey]);

  const setStatusOf = (id: number, s: "Solved" | "Need Review" | "Todo") =>
    start(async () => {
      try {
        await logAttempt(id, s);
        toast.success(`Marked ${s.toLowerCase()}`);
      } catch (e) {
        toast.error(String(e));
      }
    });

  const toggleStar = (id: number) =>
    start(async () => {
      await toggleProblemStar(id);
    });

  const remove = (id: number) =>
    start(async () => {
      if (!confirm("Delete this problem?")) return;
      await deleteProblem(id);
      toast.success("Deleted");
    });

  return (
    <Card>
      <CardContent className="p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[hsl(var(--muted-foreground))]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, topic, company..."
              className="pl-8 pr-8"
            />
            {search ? (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Kind" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kinds</SelectItem>
              {PROBLEM_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulty</SelectItem>
              {PROBLEM_DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {PROBLEM_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {allTopics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant={dueOnly ? "default" : "outline"}
            onClick={() => setDueOnly((v) => !v)}
          >
            Due only
          </Button>
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-[150px] ml-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Sort: Recent</SelectItem>
              <SelectItem value="due">Sort: Due first</SelectItem>
              <SelectItem value="title">Sort: Title A→Z</SelectItem>
              <SelectItem value="difficulty">Sort: Difficulty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
          {filtered.length} of {rows.length}
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                <th className="px-2 py-2 font-medium w-6"></th>
                <th className="px-2 py-2 font-medium">Title</th>
                <th className="px-2 py-2 font-medium">Topics</th>
                <th className="px-2 py-2 font-medium">Diff</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium">Last</th>
                <th className="px-2 py-2 font-medium">Next</th>
                <th className="px-2 py-2 font-medium text-center">L</th>
                <th className="px-2 py-2 font-medium text-right">×</th>
                <th className="px-2 py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map((r) => {
                const due =
                  r.nextReviewAt && r.nextReviewAt.getTime() <= Date.now();
                return (
                  <tr key={r.id} className="hover:bg-[hsl(var(--accent))]/40">
                    <td className="px-2 py-2 align-top">
                      <button
                        onClick={() => toggleStar(r.id)}
                        className="text-[hsl(var(--muted-foreground))] hover:text-amber-400"
                        disabled={pending}
                        aria-label="Star"
                      >
                        {r.starred ? (
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        ) : (
                          <StarOff className="size-3.5" />
                        )}
                      </button>
                    </td>
                    <td className="px-2 py-2 max-w-[280px] align-top">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium hover:underline truncate"
                          >
                            {r.title}
                          </a>
                        ) : (
                          <span className="font-medium truncate">{r.title}</span>
                        )}
                        {r.url ? (
                          <ExternalLink className="size-3 text-[hsl(var(--muted-foreground))] shrink-0" />
                        ) : null}
                      </div>
                      {r.insight ? (
                        <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                          {r.insight}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-2 py-2 align-top max-w-[260px]">
                      <div className="flex flex-wrap gap-1">
                        {r.topics.slice(0, 4).map((t) => (
                          <Badge
                            key={t}
                            variant="muted"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {t}
                          </Badge>
                        ))}
                        {r.topics.length > 4 ? (
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            +{r.topics.length - 4}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <Badge
                        variant="outline"
                        className={"text-[10px] " + (DIFF_BADGE[r.difficulty] ?? "")}
                      >
                        {r.difficulty}
                      </Badge>
                    </td>
                    <td className="px-2 py-2 align-top">
                      <Badge
                        variant="outline"
                        className={"text-[10px] " + (STATUS_BADGE[r.status] ?? "")}
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-2 py-2 align-top text-[11px] text-[hsl(var(--muted-foreground))] tabular-nums whitespace-nowrap">
                      {r.lastAttemptedAt
                        ? formatDistanceToNow(r.lastAttemptedAt, { addSuffix: true })
                        : "—"}
                    </td>
                    <td className="px-2 py-2 align-top text-[11px] tabular-nums whitespace-nowrap">
                      {r.nextReviewAt ? (
                        <span className={due ? "text-rose-300" : ""}>
                          {format(r.nextReviewAt, "d MMM")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-2 py-2 align-top text-center text-[11px] tabular-nums">
                      {r.reviewLevel}
                    </td>
                    <td className="px-2 py-2 align-top text-right text-[11px] tabular-nums text-[hsl(var(--muted-foreground))]">
                      {r.attempts}
                    </td>
                    <td className="px-2 py-2 align-top">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => setStatusOf(r.id, "Solved")}
                          disabled={pending}
                          title="Mark solved"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-400" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => setStatusOf(r.id, "Need Review")}
                          disabled={pending}
                          title="Need review"
                        >
                          <AlertCircle className="size-3.5 text-amber-400" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => setStatusOf(r.id, "Todo")}
                          disabled={pending}
                          title="Mark todo"
                        >
                          <Circle className="size-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7"
                              aria-label="More"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setEditing(r)}>
                              <Pencil className="size-3.5" /> Edit
                            </DropdownMenuItem>
                            {r.url ? (
                              <DropdownMenuItem asChild>
                                <Link href={r.url} target="_blank">
                                  <ExternalLink className="size-3.5" /> Open URL
                                </Link>
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => remove(r.id)}>
                              <Trash2 className="size-3.5 text-rose-400" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
              No problems match these filters
            </div>
          ) : null}
        </div>
        <QuickLogProblemDialog
          open={!!editing}
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
          defaultKind={editing?.kind ?? "DSA"}
          initial={editing ? rowToDraft(editing) : undefined}
        />
      </CardContent>
    </Card>
  );
}

function rowToDraft(row: Row): ProblemDraft {
  return {
    id: row.id,
    title: row.title,
    url: row.url ?? "",
    kind: row.kind,
    difficulty: row.difficulty,
    status: row.status,
    topics: row.topics,
    companies: row.companies,
    insight: row.insight ?? "",
    notes: row.notes ?? "",
    timeMinutes: row.timeMinutes ?? 0,
  };
}
