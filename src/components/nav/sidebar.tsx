"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_GROUPS } from "./nav-config";
import { Briefcase } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]/40">
      <div className="px-5 pt-5 pb-4 border-b border-[hsl(var(--border))]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-8 rounded-md bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white shadow">
            <Briefcase className="size-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Job Prep</span>
            <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              SDE · HFT
            </span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-3 space-y-4">
        {NAV_GROUPS.map((group) => {
          const items = NAV_ITEMS.filter((it) => it.group === group);
          return (
            <div key={group}>
              <div className="px-2 pb-1.5 text-[10px] uppercase font-semibold tracking-wider text-[hsl(var(--muted-foreground))]">
                {group}
              </div>
              <ul className="space-y-0.5">
                {items.map((it) => {
                  const active =
                    it.href === "/"
                      ? pathname === "/"
                      : pathname === it.href || pathname.startsWith(`${it.href}/`);
                  const Icon = it.icon;
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={cn(
                          "group flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                          active
                            ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-medium"
                            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/60"
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            active
                              ? "text-[hsl(var(--foreground))]"
                              : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
                          )}
                        />
                        <span className="truncate">{it.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-[hsl(var(--border))] text-[11px] text-[hsl(var(--muted-foreground))]">
        <div>Local · SQLite · v0.1</div>
        <div className="text-[hsl(var(--foreground))]/70 mt-0.5">Gaurav Barmola</div>
      </div>
    </aside>
  );
}
