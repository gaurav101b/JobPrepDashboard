"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalFormDialog } from "./goal-form-dialog";

export function NewGoalButton({ kind }: { kind?: "weekly" | "milestone" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-3.5" /> New {kind ?? "goal"}
      </Button>
      <GoalFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
