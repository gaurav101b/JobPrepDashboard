"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  Search,
  X,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
  Pencil,
  Star,
  Download,
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
import { AppCard, type AppRow } from "./app-card";
import {
  QuickLogApplicationDialog,
  appRowToDraft,
} from "@/components/quick/quick-log-application";
import {
  STATUS_COLORS,
  type ApplicationStatus,
} from "@/lib/constants";

const PIPELINE: ApplicationStatus[] = [
  "Wishlist",
  "Researching",
  "Applied",
  "OA",
  "Phone",
  "Onsite",
  "Offer",
];
const ARCHIVED: ApplicationStatus[] = ["Rejected", "Withdrawn", "Ghosted"];

export function ApplicationsBoard({ apps }: { apps: AppRow[] }) {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [editing, setEditing] = useState<AppRow | null>(null);

  const filtered = useMemo(() => {
    let list = apps;
    if (category !== "all") list = list.filter((a) => a.category === category);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.company.toLowerCase().includes(s) ||
          a.role.toLowerCase().includes(s) ||
          (a.location ?? "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [apps, search, category]);

  const buckets = useMemo(() => {
    const map = new Map<string, AppRow[]>();
    for (const s of [...PIPELINE, ...ARCHIVED]) map.set(s, []);
    for (const a of filtered) {
      const arr = map.get(a.status) ?? [];
      arr.push(a);
      map.set(a.status, arr);
    }
    for (const [k, v] of map.entries()) {
      v.sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        const at = a.nextStepAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bt = b.nextStepAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return at - bt;
      });
      map.set(k, v);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[hsl(var(--muted-foreground))]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, role, location..."
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
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="SDE">SDE</SelectItem>
              <SelectItem value="HFT">HFT</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-[hsl(var(--muted-foreground))] tabular-nums ml-1">
            {filtered.length} apps
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button asChild size="sm" variant="outline">
              <Link href="/api/calendar?include=applications" target="_blank">
                <Download className="size-3.5" /> .ics
              </Link>
            </Button>
            <div className="flex rounded-md border border-[hsl(var(--border))] p-0.5">
              <Button
                size="sm"
                variant={view === "kanban" ? "secondary" : "ghost"}
                className="h-7 px-2 gap-1"
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="size-3.5" /> Kanban
              </Button>
              <Button
                size="sm"
                variant={view === "table" ? "secondary" : "ghost"}
                className="h-7 px-2 gap-1"
                onClick={() => setView("table")}
              >
                <TableIcon className="size-3.5" /> Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {view === "kanban" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
          {PIPELINE.map((status) => {
            const items = buckets.get(status) ?? [];
            return (
              <div
                key={status}
                className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]/40 p-2 space-y-2 min-h-[200px]"
              >
                <div className="flex items-center justify-between px-1">
                  <span
                    className={`text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}
                  >
                    {status}
                  </span>
                  <span className="text-[11px] text-[hsl(var(--muted-foreground))] tabular-nums">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))] italic px-1 py-2">
                      Empty
                    </div>
                  ) : (
                    items.map((a) => (
                      <AppCard key={a.id} app={a} onEdit={setEditing} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  <th className="px-3 py-2 font-medium w-6"></th>
                  <th className="px-3 py-2 font-medium">Company</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Loc</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Cat</th>
                  <th className="px-3 py-2 font-medium">Applied</th>
                  <th className="px-3 py-2 font-medium">Next</th>
                  <th className="px-3 py-2 font-medium text-right">TC</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-3 py-6 text-center text-xs text-[hsl(var(--muted-foreground))]"
                    >
                      No applications match these filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => {
                    const overdue =
                      !!a.nextStepAt && a.nextStepAt.getTime() < Date.now() &&
                      !["Offer", "Rejected", "Withdrawn", "Ghosted"].includes(a.status);
                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-[hsl(var(--accent))]/40"
                      >
                        <td className="px-3 py-2">
                          {a.starred ? (
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          ) : null}
                        </td>
                        <td className="px-3 py-2 font-medium">{a.company}</td>
                        <td className="px-3 py-2 text-[hsl(var(--muted-foreground))] truncate max-w-[200px]">
                          {a.role}
                        </td>
                        <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                          {a.location ?? "—"}
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            variant="outline"
                            className={
                              "text-[10px] " +
                              (STATUS_COLORS[a.status as ApplicationStatus] ?? "")
                            }
                          >
                            {a.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {a.category ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))] tabular-nums whitespace-nowrap">
                          {a.appliedAt
                            ? formatDistanceToNow(a.appliedAt, { addSuffix: true })
                            : "—"}
                        </td>
                        <td
                          className={
                            "px-3 py-2 text-xs tabular-nums whitespace-nowrap " +
                            (overdue ? "text-rose-300" : "text-[hsl(var(--muted-foreground))]")
                          }
                        >
                          {a.nextStepAt ? format(a.nextStepAt, "d MMM") : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs tabular-nums text-right whitespace-nowrap">
                          {a.totalComp
                            ? `${a.currency ?? "INR"} ${(a.totalComp / 100000).toFixed(1)}L`
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1 justify-end">
                            {a.jdUrl ? (
                              <Button size="icon" variant="ghost" className="size-7" asChild>
                                <Link href={a.jdUrl} target="_blank">
                                  <ExternalLink className="size-3.5" />
                                </Link>
                              </Button>
                            ) : null}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7"
                              onClick={() => setEditing(a)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <QuickLogApplicationDialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        initial={editing ? appRowToDraft(editing) : undefined}
        key={editing?.id ?? "new"}
      />
    </div>
  );
}
