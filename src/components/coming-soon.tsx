import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  title,
  description,
  icon: Icon,
  features,
  redirectHint,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  features: string[];
  redirectHint?: { href: string; label: string };
}) {
  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-transparent pointer-events-none" />
      <CardContent className="p-8 md:p-12 relative">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="muted" className="text-[10px] gap-1">
            <Sparkles className="size-3" /> V2
          </Badge>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Coming after V1 feedback
          </span>
        </div>
        <div className="flex items-start gap-4 mb-5">
          {Icon ? (
            <div className="size-12 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
              <Icon className="size-6" />
            </div>
          ) : null}
          <div>
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 max-w-2xl">
              {description}
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 max-w-2xl">
          {features.map((f) => (
            <div
              key={f}
              className="text-sm flex items-start gap-2 p-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))]/40"
            >
              <span className="size-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        {redirectHint ? (
          <div className="mt-6">
            <Button asChild size="sm" variant="outline">
              <Link href={redirectHint.href}>
                {redirectHint.label} <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        ) : null}
        <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-6">
          Schema, seed data, and server actions are already in place — only the
          UI is gated on your V1 feedback.
        </p>
      </CardContent>
    </Card>
  );
}
