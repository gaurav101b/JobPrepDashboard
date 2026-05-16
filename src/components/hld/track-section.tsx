"use client";

import { useState, useTransition } from "react";
import { Trash2, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  setTopicConfidence,
  setTopicNotes,
  deleteTopic,
} from "@/lib/actions/topics";
import { cn } from "@/lib/utils";

type Row = {
  id: number;
  domain: string;
  name: string;
  confidence: number;
  notes: string | null;
};

const CONFIDENCE_LABELS = [
  "Untouched",
  "Read intro",
  "Skimmed",
  "Understood",
  "Implemented",
  "Can teach",
];

export function HldTrackSection({ rows }: { rows: Row[]; domain: string }) {
  if (rows.length === 0) {
    return (
      <div className="text-xs text-[hsl(var(--muted-foreground))] py-4 text-center">
        No topics yet — add one below.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-[hsl(var(--border))]">
      {rows.map((r) => (
        <TopicRow key={r.id} row={r} />
      ))}
    </ul>
  );
}

function TopicRow({ row }: { row: Row }) {
  const [pending, start] = useTransition();
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(row.notes ?? "");
  const [optimisticConfidence, setOptimisticConfidence] = useState(row.confidence);

  const setConf = (val: number) => {
    setOptimisticConfidence(val);
    start(async () => {
      try {
        await setTopicConfidence(row.id, val);
      } catch (e) {
        setOptimisticConfidence(row.confidence);
        toast.error("Failed to save: " + String(e));
      }
    });
  };

  const saveNotes = () => {
    start(async () => {
      try {
        await setTopicNotes(row.id, notes);
        toast.success("Notes saved");
      } catch (e) {
        toast.error("Failed to save: " + String(e));
      }
    });
  };

  const removeTopic = () => {
    if (!confirm(`Remove "${row.name}"?`)) return;
    start(async () => {
      try {
        await deleteTopic(row.id);
        toast.success("Topic removed");
      } catch (e) {
        toast.error("Failed to delete: " + String(e));
      }
    });
  };

  return (
    <li className="py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 shrink-0">
          {[0, 1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setConf(lvl)}
              disabled={pending}
              title={`${lvl} · ${CONFIDENCE_LABELS[lvl]}`}
              className={cn(
                "size-2.5 rounded-full transition-colors",
                lvl === 0
                  ? "border border-[hsl(var(--border))]"
                  : optimisticConfidence >= lvl
                  ? optimisticConfidence >= 4
                    ? "bg-emerald-500"
                    : optimisticConfidence >= 2
                    ? "bg-violet-500"
                    : "bg-amber-500"
                  : "bg-[hsl(var(--muted))]"
              )}
            />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">{row.name}</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
            {CONFIDENCE_LABELS[optimisticConfidence] ?? "Untouched"}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="size-7 p-0"
          onClick={() => setNotesOpen((v) => !v)}
          title="Toggle notes"
        >
          <NotebookPen className="size-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="size-7 p-0 text-[hsl(var(--muted-foreground))] hover:text-rose-500"
          onClick={removeTopic}
          title="Remove"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      {notesOpen ? (
        <div className="mt-2 ml-[88px] space-y-1.5">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Trade-offs, capacity estimates, key insights, page references..."
            className="text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setNotesOpen(false)}>
              Close
            </Button>
            <Button size="sm" onClick={saveNotes} disabled={pending}>
              Save notes
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
