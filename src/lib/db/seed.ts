import "server-only";
import { sqlite } from "./index";
import { ensureMigrated } from "./migrate";
import {
  TARGET_COMPANIES,
  HLD_TRACKS,
  NEETCODE_150_PREVIEW,
  RESOURCES_SEED,
  DEFAULT_LC_CYCLE_START,
} from "@/lib/constants";

let seeded = false;

const SEED_VERSION = "v3";

const CATEGORY_MIGRATION: Record<string, string> = {
  HLD: "SysDesign",
  HFT: "MiscTech",
  CS: "MiscTech",
  Mocks: "Work",
  Reading: "Work",
  Other: "Work",
  Apps: "Work",
  Behavioral: "Work",
};

export function ensureSeeded() {
  if (seeded) return;
  ensureMigrated();

  const flag = sqlite
    .prepare<[], { value: string }>("SELECT value FROM settings WHERE key = 'seeded'")
    .get();
  const currentVersion = flag?.value ?? null;

  if (currentVersion === SEED_VERSION) {
    seeded = true;
    return;
  }

  const tx = sqlite.transaction(() => {
    if (currentVersion === null) {
      seedFresh();
    }
    if (currentVersion === null || currentVersion === "v1") {
      migrateToV2();
    }
    if (currentVersion === null || currentVersion === "v1" || currentVersion === "v2") {
      migrateToV3();
    }
    sqlite
      .prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded', ?)")
      .run(SEED_VERSION);
  });

  tx();
  seeded = true;
}

function seedFresh() {
  const insertProblem = sqlite.prepare(
    "INSERT INTO problems (kind, title, url, platform, difficulty, topics, source) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const problemCount = sqlite
    .prepare<[], { c: number }>("SELECT COUNT(*) as c FROM problems")
    .get();
  if (!problemCount || problemCount.c === 0) {
    for (const p of NEETCODE_150_PREVIEW) {
      insertProblem.run(
        "DSA",
        p.title,
        p.url,
        "LeetCode",
        p.difficulty,
        JSON.stringify([p.topic]),
        "NeetCode 150"
      );
    }
  }

  const insertResource = sqlite.prepare(
    "INSERT INTO resources (title, kind, url, topic) VALUES (?, ?, ?, ?)"
  );
  const resourceCount = sqlite
    .prepare<[], { c: number }>("SELECT COUNT(*) as c FROM resources")
    .get();
  if (!resourceCount || resourceCount.c === 0) {
    for (const r of RESOURCES_SEED) {
      insertResource.run(r.title, r.kind, r.url, r.topic);
    }
  }

  const insertStory = sqlite.prepare(
    "INSERT INTO stories (title, competencies, situation, task, action, result, reflection) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const storyCount = sqlite
    .prepare<[], { c: number }>("SELECT COUNT(*) as c FROM stories")
    .get();
  if (!storyCount || storyCount.c === 0) {
    const stories = [
      {
        title: "CNI Plugin & eBPF Underlay (Patent)",
        competencies: ["Innovation", "Ownership", "Scale"],
        situation: "Cloud-Native AOS needed isolated pod networking with low overhead.",
        task: "Design a CNI plugin that supports underlay data paths and runtime IP assignment for pods.",
        action: "Built CNI plugin in Go with eBPF data path; designed runtime IP assignment workflows; co-invented two patents.",
        result: "Pods get external reachability with low overhead; two patents filed.",
        reflection: "Anchor the story on the trade-off between overlay simplicity and underlay performance.",
      },
      {
        title: "Cassandra Metadata Store Optimization",
        competencies: ["Scale", "Customer Impact", "Ownership"],
        situation: "Storage control plane on Nutanix relied on a Cassandra-backed metadata store with consistency hot-spots.",
        task: "Improve consistency and tail latency for control-plane operations.",
        action: "Profiled hotspots, redesigned schemas, tuned consistency levels; rolled out behind a flag.",
        result: "Reduced tail latency and consistency anomalies for storage control plane.",
        reflection: "Always quantify impact (p99, error rates) before-and-after.",
      },
      {
        title: "Goldman Sachs — Concert Service Reuse",
        competencies: ["Collaboration", "Ownership"],
        situation: "Front-office trading workflows needed reusable transactional data services.",
        task: "Generalize the ORM layer and Spring Boot REST services for reuse across PWM, FI, OPMS.",
        action: "Refactored ORM to a generic mapping layer; added reconciliation between Geode cache and Sybase IQ.",
        result: "Adopted by multiple desks; reduced per-team integration cost.",
        reflection: "Trade-off between abstraction and team-specific performance asks.",
      },
      {
        title: "RelayServer Hackathon Win",
        competencies: ["Innovation", "Bias for Action"],
        situation: "Distributed endpoints needed secure connectivity without inbound ports.",
        task: "Design and demo a secure relay layer in 24h.",
        action: "Built persistent outbound TCP channels with mTLS, signed certs, packet construction/reconstruction.",
        result: "Won the hackathon; solution generalizable to NAT-traversal scenarios.",
        reflection: "Bias for action: ship the smallest credible end-to-end demo first.",
      },
      {
        title: "Cloud-Native AOS Containerization",
        competencies: ["Ambiguity", "Leadership"],
        situation: "AOS operating system was not built for k8s; team needed a path to a cloud-native footprint.",
        task: "Containerize AOS and integrate natively with Kubernetes.",
        action: "Built operators for service orchestration; defined image layering; co-designed lifecycle workflows.",
        result: "Working k8s-native AOS path enabling new deployment models.",
        reflection: "When the brief is ambiguous, force-rank the unknowns and de-risk the top one in week 1.",
      },
    ];
    for (const s of stories) {
      insertStory.run(
        s.title,
        JSON.stringify(s.competencies),
        s.situation,
        s.task,
        s.action,
        s.result,
        s.reflection
      );
    }
  }
}

function migrateToV2() {
  // 1) Migrate session categories (HFT/CS -> MiscTech, Mocks/Reading/Other/Apps/Behavioral -> Work)
  const updateCategory = sqlite.prepare(
    "UPDATE study_sessions SET category = ? WHERE category = ?"
  );
  for (const [oldCat, newCat] of Object.entries(CATEGORY_MIGRATION)) {
    updateCategory.run(newCat, oldCat);
  }

  // 2) Re-seed companies: nuke + insert new high-pay-focused list.
  sqlite.prepare("DELETE FROM companies").run();
  const insertCompany = sqlite.prepare(
    "INSERT OR IGNORE INTO companies (name, category, focus) VALUES (?, ?, ?)"
  );
  for (const c of TARGET_COMPANIES) insertCompany.run(c.name, c.category, c.focus);

  // 3) Re-seed system design topics: nuke old HLD/HFT/CS topic seeds, install Alex Xu V1+V2.
  sqlite
    .prepare(
      "DELETE FROM topics WHERE domain LIKE 'HLD%' OR domain LIKE 'CS-%' OR domain LIKE 'HFT-%' OR domain = 'LLD-Pattern' OR domain = 'LLD-Problem' OR domain = 'HLD-Case'"
    )
    .run();
  const insertTopic = sqlite.prepare(
    "INSERT INTO topics (domain, name, confidence) VALUES (?, ?, 0)"
  );
  for (const [domain, names] of Object.entries(HLD_TRACKS)) {
    for (const name of names) insertTopic.run(domain, name);
  }

  // 4) Default LeetCode cycle start = May 1, 2026
  sqlite
    .prepare(
      "INSERT INTO settings (key, value) VALUES ('leetcode.cycle_start', ?) ON CONFLICT(key) DO NOTHING"
    )
    .run(DEFAULT_LC_CYCLE_START);
}

function migrateToV3() {
  // Drop Alex Xu Vol 2 topics (book is no longer in scope per user feedback).
  sqlite.prepare("DELETE FROM topics WHERE domain = 'HLD-AlexXu-V2'").run();

  // Rename Coursera track -> Udemy. Existing user-added Coursera topics carry over.
  sqlite
    .prepare("UPDATE topics SET domain = 'HLD-Udemy' WHERE domain = 'HLD-Coursera'")
    .run();

  // Re-seed Alex Xu V1 chapters if they're missing (idempotent).
  const v1Names = HLD_TRACKS["HLD-AlexXu-V1"] ?? [];
  const insertTopic = sqlite.prepare(
    "INSERT INTO topics (domain, name, confidence) VALUES (?, ?, 0)"
  );
  const existing = sqlite
    .prepare<[], { name: string }>(
      "SELECT name FROM topics WHERE domain = 'HLD-AlexXu-V1'"
    )
    .all() as Array<{ name: string }>;
  const existingSet = new Set(existing.map((r) => r.name));
  for (const name of v1Names) {
    if (!existingSet.has(name)) insertTopic.run("HLD-AlexXu-V1", name);
  }
}
