import { BookOpen } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { ComingSoon } from "@/components/coming-soon";

export default function CsPage() {
  return (
    <>
      <TopBar title="CS Fundamentals" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1600px] w-full mx-auto">
        <PageHeader title="CS Fundamentals" />
        <ComingSoon
          icon={BookOpen}
          title="CS Fundamentals"
          description="OS, Networking, DBMS, Distributed Systems checklists with confidence ratings and quick-revision flashcards."
          features={[
            "OS: processes/threads, scheduling, sync primitives, memory mgmt, I/O",
            "Networking: TCP, TLS, HTTP/2/3, DNS, BGP, QUIC",
            "DBMS: B-tree/LSM, MVCC, isolation levels, query optimization",
            "DistSys: CAP/PACELC, consensus, vector clocks, gossip",
            "Talking points pulled from your Nutanix work per topic",
          ]}
          redirectHint={{ href: "/resources", label: "Resources" }}
        />
      </main>
    </>
  );
}
