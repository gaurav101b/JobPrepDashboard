import { Mic } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function MocksPage() {
  return (
    <>
      <TopBar title="Mock Interviews" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1600px] w-full mx-auto">
        <PageHeader title="Mock Interviews" />
        <ComingSoon
          icon={Mic}
          title="Mock Interviews"
          description="Log every mock with type, problem, score, what went well, what to fix. Aggregates into trends so you can see if your DSA / HLD / behavioral are improving."
          features={[
            "Log: date, type, platform, problem, 1–5 score, went well / to fix / follow-up",
            "Trend chart per type (DSA / HLD / LLD / Behavioral / HFT-Quant)",
            "Auto-link to applications and behavioral stories",
            "Pre-fills follow-up actions into your weekly goals",
          ]}
          redirectHint={{ href: "/goals", label: "Goals" }}
        />
      </main>
    </>
  );
}
