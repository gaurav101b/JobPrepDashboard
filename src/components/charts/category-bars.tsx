"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STUDY_CATEGORIES,
} from "@/lib/constants";
import { formatHm } from "@/lib/utils";

// Custom tooltip: per-category breakdown (non-zero only) + a Total row.
// Default recharts tooltip only renders the stack pieces — we want the day's
// total time alongside the breakdown so the user sees both at a glance.
function CategoryTooltip(props: Partial<TooltipContentProps<number, string>>) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;
  const entries = payload.filter((p) => Number(p.value ?? 0) > 0);
  const total = payload.reduce(
    (sum: number, p) => sum + Number(p.value ?? 0),
    0
  );
  return (
    <div
      className="rounded-lg border bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] shadow-md"
      style={{
        borderColor: "hsl(var(--border))",
        padding: "8px 10px",
        fontSize: 12,
        minWidth: 140,
      }}
    >
      {label ? (
        <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-1.5">
          {String(label)}
        </div>
      ) : null}
      <ul className="space-y-1">
        {entries.map((p) => (
          <li
            key={String(p.dataKey ?? p.name)}
            className="flex items-center gap-2"
          >
            <span
              className="size-2 rounded-sm shrink-0"
              style={{ background: String(p.color ?? p.fill ?? "currentColor") }}
            />
            <span className="flex-1 truncate">{String(p.name)}</span>
            <span className="tabular-nums font-medium">
              {formatHm(Number(p.value ?? 0))}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-1.5 pt-1.5 border-t border-[hsl(var(--border))] flex items-center justify-between">
        <span className="text-[hsl(var(--muted-foreground))]">Total</span>
        <span className="tabular-nums font-semibold">{formatHm(total)}</span>
      </div>
    </div>
  );
}

export function CategoryBars({
  data,
  height = 240,
}: {
  data: Array<Record<string, number | string>>;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v: string) => v.slice(5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatHm(v)}
            width={42}
          />
          <RTooltip
            cursor={{ fill: "hsl(var(--accent))", opacity: 0.3 }}
            content={<CategoryTooltip />}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {STUDY_CATEGORIES.map((cat) => (
            <Bar
              key={cat}
              dataKey={cat}
              name={CATEGORY_LABELS[cat]}
              stackId="a"
              fill={CATEGORY_COLORS[cat]}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
