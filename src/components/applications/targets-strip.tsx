"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Building2, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addCompanyToPipeline } from "@/lib/actions/applications";
import { cn } from "@/lib/utils";

type Target = { id: number; name: string; category: string; focus: string | null };

const CATEGORY_TINTS: Record<string, string> = {
  HFT: "text-pop-1 border-pop-1/40 bg-pop-1/10",
  SDE: "text-pop-3 border-pop-3/40 bg-pop-3/10",
};

export function TargetsStrip({
  targets,
  inPipeline,
}: {
  targets: Target[];
  inPipeline: string[];
}) {
  const inSet = useMemo(
    () => new Set(inPipeline.map((c) => c.toLowerCase())),
    [inPipeline]
  );
  const [pending, start] = useTransition();
  const [filter, setFilter] = useState<"All" | "HFT" | "SDE" | "Remaining">(
    "Remaining"
  );
  const [collapsed, setCollapsed] = useState(false);

  const visible = targets.filter((t) => {
    if (filter === "HFT") return t.category === "HFT";
    if (filter === "SDE") return t.category === "SDE";
    if (filter === "Remaining") return !inSet.has(t.name.toLowerCase());
    return true;
  });

  const remaining = targets.filter((t) => !inSet.has(t.name.toLowerCase())).length;

  const addOne = (t: Target) => {
    start(async () => {
      const res = await addCompanyToPipeline(t.name, t.category);
      if (res.ok) {
        toast.success(`${t.name} added to Wishlist`);
      } else {
        toast.error("Failed to add: " + (res.error ?? "unknown"));
      }
    });
  };

  return (
    <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] mb-5">
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[hsl(var(--border))]/60">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-[hsl(var(--muted-foreground))]" />
          <h3 className="text-sm font-medium">Target companies</h3>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
            {targets.length} curated for ~60–70L+ TC at 4 YoE · {remaining} not yet in pipeline
          </span>
        </div>
        <div className="flex items-center gap-1">
          {(["Remaining", "All", "HFT", "SDE"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={cn(
                "text-[11px] px-2 py-1 rounded-md border transition-colors",
                filter === k
                  ? "border-[hsl(var(--ring))] bg-[hsl(var(--ring))]/15 text-[hsl(var(--foreground))]"
                  : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              {k}
            </button>
          ))}
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                collapsed ? "-rotate-90" : "rotate-0"
              )}
            />
          </Button>
        </div>
      </header>
      {collapsed ? null : (
        <div className="p-3">
          {visible.length === 0 ? (
            <div className="text-xs text-[hsl(var(--muted-foreground))] py-4 text-center">
              {filter === "Remaining"
                ? "All target companies are in your pipeline. Nice."
                : "No companies match this filter."}
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {visible.map((t) => {
                const already = inSet.has(t.name.toLowerCase());
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]/50 px-3 py-2.5 flex flex-col gap-1.5 hover:border-[hsl(var(--ring))]/50 transition-colors",
                      already && "opacity-70"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{t.name}</div>
                        {t.focus ? (
                          <div className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">
                            {t.focus}
                          </div>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full border whitespace-nowrap",
                          CATEGORY_TINTS[t.category] ??
                            "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                        )}
                      >
                        {t.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {already ? (
                        <span className="text-[11px] text-[hsl(var(--muted-foreground))] inline-flex items-center gap-1">
                          <Check className="size-3" /> in pipeline
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1.5 text-[11px] px-2"
                          onClick={() => addOne(t)}
                          disabled={pending}
                        >
                          <Plus className="size-3" /> Add to Wishlist
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
