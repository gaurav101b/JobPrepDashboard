import { TrendingUp } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function HftPage() {
  return (
    <>
      <TopBar title="HFT Prep" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1600px] w-full mx-auto">
        <PageHeader title="HFT Prep" />
        <ComingSoon
          icon={TrendingUp}
          title="HFT Prep"
          description="Quant/probability problem log (Heard on the Street, Xinfeng Zhou green book, 50 Challenging Problems), mental-math drill tracker, C++ low-latency checklist, and market microstructure topics."
          features={[
            "Quant problem log: source, topic, difficulty, time, solution, lesson",
            "Mental-math drills: type (×/÷/%/log/fraction), accuracy %, speed, trend",
            "C++ low-latency checklist (memory model, cache lines, lock-free, SIMD)",
            "Market microstructure: order book, matching engine, FIX, ITCH/OUCH",
            "Linked external trainers (Optiver-style timed drills, RankYourBrain)",
            "Pulls from Quant rows already in your problems table",
          ]}
          redirectHint={{ href: "/dsa", label: "DSA / Quant problems" }}
        />
      </main>
    </>
  );
}
