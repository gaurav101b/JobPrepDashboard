import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  accent = "default",
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  trend?: string;
  accent?:
    | "default"
    | "indigo"
    | "emerald"
    | "amber"
    | "rose"
    | "fuchsia"
    | "sky"
    | "violet";
  className?: string;
}) {
  const accentMap: Record<string, string> = {
    default: "from-zinc-500/15 to-zinc-500/5 text-zinc-500",
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-500",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-500",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-600",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-500",
    fuchsia: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-500",
    sky: "from-sky-500/20 to-sky-500/5 text-sky-500",
    violet: "from-violet-500/20 to-violet-500/5 text-violet-500",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex flex-col gap-1.5 relative overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 pointer-events-none bg-gradient-to-br opacity-60",
          accentMap[accent]
        )}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-medium">
          {label}
        </span>
        {Icon ? <Icon className="size-4 text-[hsl(var(--muted-foreground))]" /> : null}
      </div>
      <div className="relative text-2xl font-semibold tabular-nums">{value}</div>
      {(hint || trend) && (
        <div className="relative text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-2">
          {trend ? <span className="text-[hsl(var(--foreground))]">{trend}</span> : null}
          {hint ? <span>{hint}</span> : null}
        </div>
      )}
    </div>
  );
}
