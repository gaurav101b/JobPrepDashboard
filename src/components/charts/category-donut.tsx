"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  Legend,
} from "recharts";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type StudyCategory,
} from "@/lib/constants";
import { formatHm } from "@/lib/utils";

export function CategoryDonut({
  data,
  height = 240,
}: {
  data: Array<{ category: string; minutes: number }>;
  height?: number;
}) {
  const filtered = data
    .filter((d) => d.minutes > 0)
    .map((d) => ({
      ...d,
      label: CATEGORY_LABELS[d.category as StudyCategory] ?? d.category,
    }));
  if (filtered.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[hsl(var(--muted-foreground))]"
        style={{ height }}
      >
        No sessions yet
      </div>
    );
  }
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="minutes"
            nameKey="label"
            innerRadius="55%"
            outerRadius="85%"
            stroke="hsl(var(--card))"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {filtered.map((d) => (
              <Cell
                key={d.category}
                fill={CATEGORY_COLORS[d.category as StudyCategory] ?? "#64748b"}
              />
            ))}
          </Pie>
          <RTooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => formatHm(Number(v ?? 0))}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(v) => <span className="text-[hsl(var(--foreground))]">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
