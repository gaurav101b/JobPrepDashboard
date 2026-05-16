"use client";

import { useState, useTransition } from "react";
import { Download, Link2, ListPlus, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  bulkAddUdemyLectures,
  importUdemyFromUrl,
  setUdemyCourseUrl,
} from "@/lib/actions/udemy";

export function UdemyImport({
  initialUrl,
}: {
  initialUrl: string | null;
}) {
  const [pending, start] = useTransition();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [paste, setPaste] = useState("");

  const tryImport = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Paste a Udemy course URL first");
      return;
    }
    start(async () => {
      const result = await importUdemyFromUrl(trimmed);
      if (result.ok) {
        toast.success(`Imported ${result.imported} lectures`, {
          description: result.courseTitle ?? undefined,
        });
        setUrl(trimmed);
      } else {
        toast.error("Auto-import didn't find a curriculum", {
          description: result.error ?? "Use 'Paste curriculum' instead.",
        });
      }
    });
  };

  const saveUrlOnly = () => {
    start(async () => {
      await setUdemyCourseUrl(url);
      toast.success(url ? "Course URL saved" : "Course URL cleared");
    });
  };

  const submitPaste = () => {
    const lines = paste
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      toast.error("Paste one lecture per line");
      return;
    }
    start(async () => {
      const { added, skipped } = await bulkAddUdemyLectures(lines);
      toast.success(`Added ${added} lectures`, {
        description: skipped ? `Skipped ${skipped} duplicates` : undefined,
      });
      setPaste("");
      setPasteOpen(false);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label className="text-[10px] uppercase tracking-wider">
            Udemy course URL
          </Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.udemy.com/course/<slug>/"
            className="text-sm h-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={saveUrlOnly}
            disabled={pending}
            title="Save the URL so you can click through"
          >
            <Link2 className="size-3.5" /> Save
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={tryImport}
            disabled={pending || !url.trim()}
            title="Try auto-importing the curriculum (best-effort)"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Auto-import
          </Button>
          <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <ListPlus className="size-3.5" /> Paste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Paste curriculum</DialogTitle>
                <DialogDescription>
                  One lecture per line. Copy the lecture titles from the Udemy
                  Course content sidebar and paste them here. Duplicates are
                  skipped.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={12}
                placeholder={"Section 1: Intro\nWelcome\nWhy system design matters\n\nSection 2: Foundations\nClient-server model\nDNS basics"}
                className="text-xs font-mono"
              />
              <DialogFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPasteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={submitPaste}
                  disabled={pending || !paste.trim()}
                  className="gap-1.5"
                >
                  {pending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ListPlus className="size-3.5" />
                  )}
                  Add lectures
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {initialUrl ? (
        <a
          href={initialUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] underline underline-offset-2"
        >
          Open course on Udemy <ExternalLink className="size-3" />
        </a>
      ) : null}
      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
        Auto-import is best-effort — Udemy varies their markup. If it can&apos;t find
        the curriculum, paste it manually with the &quot;Paste&quot; button.
      </p>
    </div>
  );
}
