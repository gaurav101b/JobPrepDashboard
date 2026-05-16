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
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STUDY_CATEGORIES,
} from "@/lib/constants";

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
            unit="m"
          />
          <RTooltip
            cursor={{ fill: "hsl(var(--accent))", opacity: 0.3 }}
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
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
