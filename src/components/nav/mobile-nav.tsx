"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS, NAV_GROUPS } from "./nav-config";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col">
            <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="size-8 rounded-md bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white">
                  <Briefcase className="size-4" />
                </div>
                <span className="text-sm font-semibold">Job Prep</span>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-4" />
              </Button>
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
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm",
                                active
                                  ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/60"
                              )}
                            >
                              <Icon className="size-4" />
                              <span>{it.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
