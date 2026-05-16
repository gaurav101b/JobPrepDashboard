"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTopic } from "@/lib/actions/topics";

export function HldAddCustom({ domain }: { domain: string }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    start(async () => {
      try {
        await addTopic(domain, trimmed);
        setName("");
        setOpen(false);
        toast.success("Topic added");
      } catch (e) {
        toast.error("Failed: " + String(e));
      }
    });
  };

  return (
    <div className="pt-3">
      {open ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder="e.g. Ch 17: Custom case study"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") setOpen(false);
            }}
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={submit} disabled={pending || !name.trim()}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="text-[hsl(var(--muted-foreground))] gap-1.5 h-7"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-3.5" /> Add a topic
        </Button>
      )}
    </div>
  );
}
