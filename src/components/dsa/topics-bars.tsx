"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";

export function TopicsBars({ data }: { data: Array<{ topic: string; count: number }> }) {
  const top = data.slice(0, 12);
  return (
    <div style={{ width: "100%", height: Math.max(180, top.length * 22) }}>
      <ResponsiveContainer>
        <BarChart
          data={top}
          layout="vertical"
          margin={{ top: 4, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="topic"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            width={130}
            axisLine={false}
            tickLine={false}
          />
          <RTooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            cursor={{ fill: "hsl(var(--accent))", opacity: 0.3 }}
          />
          <Bar dataKey="count" fill="#a78bfa" radius={[0, 4, 4, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
