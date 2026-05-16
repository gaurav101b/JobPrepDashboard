"use client";

import { useState, useTransition, useRef } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addTask } from "@/lib/actions/tasks";
import { STUDY_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

export function QuickAddTask({
  date,
  placeholder = "Add a task…",
  defaultCategory,
}: {
  date: string;
  placeholder?: string;
  defaultCategory?: string | null;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | "none">(
    defaultCategory ?? "none"
  );
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    start(async () => {
      await addTask({
        date,
        title: t,
        category: category === "none" ? null : category,
      });
      setTitle("");
      inputRef.current?.focus();
    });
  };

  return (
    <div className="flex items-center gap-2 pt-1">
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="h-8 w-[110px] text-xs">
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No tag</SelectItem>
          {STUDY_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        onClick={submit}
        disabled={pending || !title.trim()}
        className="h-8"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
