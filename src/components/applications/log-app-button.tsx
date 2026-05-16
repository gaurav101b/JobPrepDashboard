"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickLogApplicationDialog } from "@/components/quick/quick-log-application";

export function LogApplicationButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-3.5" /> New application
      </Button>
      <QuickLogApplicationDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
