"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickLogProblemDialog } from "@/components/quick/quick-log-problem";

export function LogProblemButton({ kind = "DSA" }: { kind?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-3.5" /> Log problem
      </Button>
      <QuickLogProblemDialog open={open} onOpenChange={setOpen} defaultKind={kind} />
    </>
  );
}
