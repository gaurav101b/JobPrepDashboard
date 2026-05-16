import { MessageSquare } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function BehavioralPage() {
  return (
    <>
      <TopBar title="Behavioral & Stories" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1600px] w-full mx-auto">
        <PageHeader title="Behavioral & Stories" />
        <ComingSoon
          icon={MessageSquare}
          title="Behavioral & Stories"
          description="STAR-format story bank seeded from your resume (CNI/eBPF patents, Cassandra optimization, GS Concert, RelayServer hackathon, Cloud-Native AOS) with competency tagging and per-company story plans."
          features={[
            "STAR-format with situation/task/action/result/reflection",
            "Tag by competency: leadership, conflict, ambiguity, scale, ownership",
            "Company values cheat sheet (Amazon LPs, Google, Meta, Stripe)",
            "Per-company story plan picker — which 5 stories to bring",
            "Pre-seeded with stories from your resume",
          ]}
          redirectHint={{ href: "/applications", label: "Applications" }}
        />
      </main>
    </>
  );
}
