"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickLogSessionDialog } from "@/components/quick/quick-log-session";

export function ManualLogButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-3.5" /> Manual entry
      </Button>
      <QuickLogSessionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
