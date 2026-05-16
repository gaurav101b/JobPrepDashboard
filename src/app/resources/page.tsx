import { Library, BookOpen, Eye, CheckCircle2 } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ResourcesList, type ResRow } from "@/components/resources/resources-list";
import { getResources } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const list = await getResources();
  const rows: ResRow[] = list.map((r) => ({
    id: r.id,
    title: r.title,
    kind: r.kind,
    url: r.url,
    topic: r.topic,
    status: r.status,
    rating: r.rating,
    notes: r.notes,
  }));

  const total = rows.length;
  const reading = rows.filter((r) => r.status === "Reading").length;
  const done = rows.filter((r) => r.status === "Done").length;
  const todo = rows.filter((r) => r.status === "To-Read").length;

  return (
    <>
      <TopBar title="Resources" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1600px] w-full mx-auto">
        <PageHeader
          title="Resources"
          description="Books, courses, blogs, repos. One source of truth for what to consume."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="Total" value={total} icon={Library} accent="indigo" />
          <StatCard
            label="To-read"
            value={todo}
            icon={BookOpen}
            accent="amber"
          />
          <StatCard
            label="Reading"
            value={reading}
            icon={Eye}
            accent="sky"
          />
          <StatCard
            label="Done"
            value={done}
            icon={CheckCircle2}
            accent="emerald"
          />
        </div>
        <ResourcesList rows={rows} />
      </main>
    </>
  );
}
