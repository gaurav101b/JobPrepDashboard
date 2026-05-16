"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ExternalLink,
  Plus,
  Pencil,
  CheckCircle2,
  BookOpen,
  Eye,
  Clock,
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
import { setResourceStatus } from "@/lib/actions/resources";
import { ResourceFormDialog, type ResourceDraft } from "./resource-form";
import { RESOURCE_KINDS, RESOURCE_STATUSES } from "@/lib/constants";
import { toast } from "sonner";

export type ResRow = {
  id: number;
  title: string;
  kind: string;
  url: string | null;
  topic: string | null;
  status: string;
  rating: number | null;
  notes: string | null;
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  "To-Read": <Clock className="size-3 text-zinc-400" />,
  Reading: <Eye className="size-3 text-amber-400" />,
  Done: <CheckCircle2 className="size-3 text-emerald-400" />,
};

export function ResourcesList({ rows }: { rows: ResRow[] }) {
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [editing, setEditing] = useState<ResRow | null>(null);
  const [creating, setCreating] = useState(false);

  const topics = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) if (r.topic) s.add(r.topic);
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (kind !== "all") r = r.filter((x) => x.kind === kind);
    if (status !== "all") r = r.filter((x) => x.status === status);
    if (topic !== "all") r = r.filter((x) => x.topic === topic);
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.title.toLowerCase().includes(s) ||
          (x.topic ?? "").toLowerCase().includes(s) ||
          (x.notes ?? "").toLowerCase().includes(s)
      );
    }
    return r;
  }, [rows, kind, status, topic, search]);

  const cycle = (r: ResRow) => {
    const order = RESOURCE_STATUSES;
    const next = order[(order.indexOf(r.status as (typeof order)[number]) + 1) % order.length];
    start(async () => {
      try {
        await setResourceStatus(r.id, next);
      } catch (e) {
        toast.error(String(e));
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[hsl(var(--muted-foreground))]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, topic, notes..."
              className="pl-8 pr-8"
            />
            {search ? (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                aria-label="Clear"
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
              {RESOURCE_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {RESOURCE_STATUSES.map((s) => (
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
              {topics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5 ml-auto">
            <Plus className="size-3.5" /> Add
          </Button>
        </div>

        <div className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums">
          {filtered.length} of {rows.length}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex items-start gap-3 p-3 rounded-md border border-[hsl(var(--border))] hover:border-[hsl(var(--ring))]/40 transition-colors group"
            >
              <button
                onClick={() => cycle(r)}
                disabled={pending}
                className="mt-0.5 shrink-0"
                title={`Cycle status (${r.status})`}
              >
                {STATUS_ICON[r.status] ?? (
                  <BookOpen className="size-3 text-[hsl(var(--muted-foreground))]" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  {r.url ? (
                    <Link
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-sm hover:underline truncate"
                    >
                      {r.title}
                    </Link>
                  ) : (
                    <span className="font-medium text-sm truncate">{r.title}</span>
                  )}
                  {r.url ? (
                    <ExternalLink className="size-3 text-[hsl(var(--muted-foreground))] shrink-0" />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {r.kind}
                  </Badge>
                  {r.topic ? (
                    <Badge variant="muted" className="text-[10px] px-1.5 py-0">
                      {r.topic}
                    </Badge>
                  ) : null}
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] inline-flex items-center gap-1">
                    {STATUS_ICON[r.status]}
                    {r.status}
                  </span>
                  {r.rating ? (
                    <span className="text-[10px] text-amber-300">
                      {"★".repeat(r.rating)}
                    </span>
                  ) : null}
                </div>
                {r.notes ? (
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1.5 line-clamp-2">
                    {r.notes}
                  </p>
                ) : null}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditing(r)}
                aria-label="Edit"
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          ))}
          {filtered.length === 0 ? (
            <div className="lg:col-span-2 py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
              Nothing here. Add a book, course, or video.
            </div>
          ) : null}
        </div>

        <ResourceFormDialog
          open={!!editing || creating}
          onOpenChange={(o) => {
            if (!o) {
              setEditing(null);
              setCreating(false);
            }
          }}
          topics={topics}
          initial={editing ? toDraft(editing) : undefined}
          key={editing?.id ?? (creating ? "new" : "closed")}
        />
      </CardContent>
    </Card>
  );
}

function toDraft(r: ResRow): ResourceDraft {
  return {
    id: r.id,
    title: r.title,
    kind: r.kind,
    url: r.url ?? "",
    topic: r.topic ?? "",
    status: r.status,
    rating: r.rating,
    notes: r.notes ?? "",
  };
}
