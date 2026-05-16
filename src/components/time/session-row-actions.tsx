"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSession } from "@/lib/actions/sessions";
import { toast } from "sonner";

export function DeleteSessionButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-7"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this session?")) return;
        start(async () => {
          try {
            await deleteSession(id);
            toast.success("Deleted");
          } catch (e) {
            toast.error("Failed: " + String(e));
          }
        });
      }}
      aria-label="Delete session"
    >
      <Trash2 className="size-3.5 text-rose-400" />
    </Button>
  );
}
