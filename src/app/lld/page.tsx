import { Boxes } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function LldPage() {
  return (
    <>
      <TopBar title="Low-Level Design" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1600px] w-full mx-auto">
        <PageHeader title="Low-Level Design (LLD)" />
        <ComingSoon
          icon={Boxes}
          title="Low-Level Design"
          description="Design patterns checklist, LLD problems (parking lot, Splitwise, rate limiter, LRU/LFU, order matching engine, market data feed handler), each with class diagram + repo link."
          features={[
            "GoF patterns checklist with confidence rating",
            "Classic LLD problems + HFT-relevant ones (matching engine, feed handler)",
            "Per-problem: requirements, class diagram link, repo link, time-to-design",
            "Notes on trade-offs and code-review-style follow-ups",
          ]}
          redirectHint={{ href: "/dsa", label: "DSA / LeetCode" }}
        />
      </main>
    </>
  );
}
