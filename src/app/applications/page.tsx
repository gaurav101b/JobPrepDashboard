import { Send, AlarmClock, Trophy, IndianRupee } from "lucide-react";
import { TopBar } from "@/components/nav/topbar";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { LogApplicationButton } from "@/components/applications/log-app-button";
import {
  ApplicationsBoard,
} from "@/components/applications/applications-board";
import type { AppRow } from "@/components/applications/app-card";
import { TargetsStrip } from "@/components/applications/targets-strip";
import { getApplicationsList, getTargetCompanies } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const [list, targets] = await Promise.all([
    getApplicationsList(),
    getTargetCompanies(),
  ]);
  const apps: AppRow[] = list.map((a) => ({
    id: a.id,
    company: a.company,
    role: a.role,
    location: a.location,
    remote: a.remote,
    status: a.status,
    source: a.source,
    referral: a.referral,
    jdUrl: a.jdUrl,
    appliedAt: a.appliedAt,
    nextStepAt: a.nextStepAt,
    nextStepNote: a.nextStepNote,
    baseSalary: a.baseSalary,
    bonus: a.bonus,
    equity: a.equity,
    signOn: a.signOn,
    totalComp: a.totalComp,
    currency: a.currency,
    notes: a.notes,
    category: a.category,
    starred: !!a.starred,
  }));

  const total = apps.length;
  const inFlight = apps.filter((a) =>
    ["Applied", "OA", "Phone", "Onsite"].includes(a.status)
  ).length;
  const offers = apps.filter((a) => a.status === "Offer").length;
  const overdue = apps.filter(
    (a) =>
      a.nextStepAt &&
      a.nextStepAt.getTime() < Date.now() &&
      !["Offer", "Rejected", "Withdrawn", "Ghosted"].includes(a.status)
  ).length;
  const bestComp = apps.reduce(
    (m, a) => (a.totalComp && a.totalComp > m ? a.totalComp : m),
    0
  );

  return (
    <>
      <TopBar title="Applications" />
      <main className="flex-1 px-4 md:px-6 py-5 max-w-[1400px] w-full mx-auto">
        <PageHeader
          title="Applications"
          description="Pipeline + reach-outs + offers. Move with the chevron · ICS export for follow-ups."
          actions={<LogApplicationButton />}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard
            label="In flight"
            value={inFlight}
            icon={Send}
            hint={`${total} total`}
            accent="indigo"
          />
          <StatCard
            label="Overdue"
            value={overdue}
            icon={AlarmClock}
            hint="follow up now"
            accent="rose"
          />
          <StatCard
            label="Offers"
            value={offers}
            icon={Trophy}
            accent="emerald"
          />
          <StatCard
            label="Best TC"
            value={bestComp ? `${(bestComp / 100000).toFixed(1)}L` : "—"}
            icon={IndianRupee}
            hint={bestComp ? "highest logged" : "log offers"}
            accent="amber"
          />
        </div>

        <TargetsStrip
          targets={targets.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            focus: t.focus,
          }))}
          inPipeline={apps.map((a) => a.company)}
        />

        <ApplicationsBoard apps={apps} />
      </main>
    </>
  );
}
