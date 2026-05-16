export const STUDY_CATEGORIES = [
  "DSA",
  "SysDesign",
  "LLD",
  "MiscTech",
  "Work",
] as const;

export type StudyCategory = (typeof STUDY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<StudyCategory, string> = {
  DSA: "DSA",
  SysDesign: "System Design",
  LLD: "LLD",
  MiscTech: "Misc Tech",
  Work: "Work",
};

export const CATEGORY_DESCRIPTIONS: Record<StudyCategory, string> = {
  DSA: "LeetCode + algorithms practice",
  SysDesign: "HLD case studies + book + course",
  LLD: "Object-oriented design + patterns",
  MiscTech: "HFT prep, OS/networking/DBMS revision, C++ deep-dives",
  Work: "Apps, outreach, resume tuning, behavioral prep",
};

export const CATEGORY_COLORS: Record<StudyCategory, string> = {
  DSA: "#6366f1",
  SysDesign: "#8b5cf6",
  LLD: "#ec4899",
  MiscTech: "#14b8a6",
  Work: "#f59e0b",
};

// Tailwind-class flavors of CATEGORY_COLORS for badges/borders/backgrounds.
// Used by tasks, goals, milestones — anything that carries a category tag.
export const CATEGORY_BADGE_CLASS: Record<StudyCategory, string> = {
  DSA: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40",
  SysDesign:
    "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/40",
  LLD: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/40",
  MiscTech:
    "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40",
  Work: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
};

export const CATEGORY_BORDER_CLASS: Record<StudyCategory, string> = {
  DSA: "border-l-indigo-500/70",
  SysDesign: "border-l-violet-500/70",
  LLD: "border-l-pink-500/70",
  MiscTech: "border-l-teal-500/70",
  Work: "border-l-amber-500/70",
};

// 0=Sun … 6=Sat (matches Date#getDay). Tints day cards with a calm rainbow
// so a week is visually scannable; today still wins with the accent ring.
export const WEEKDAY_COLOR_CLASS: Record<
  number,
  { text: string; border: string; bg: string }
> = {
  1: {
    text: "text-indigo-500",
    border: "border-l-indigo-500/60",
    bg: "bg-indigo-500/[0.04]",
  },
  2: {
    text: "text-sky-500",
    border: "border-l-sky-500/60",
    bg: "bg-sky-500/[0.04]",
  },
  3: {
    text: "text-cyan-500",
    border: "border-l-cyan-500/60",
    bg: "bg-cyan-500/[0.04]",
  },
  4: {
    text: "text-emerald-500",
    border: "border-l-emerald-500/60",
    bg: "bg-emerald-500/[0.04]",
  },
  5: {
    text: "text-amber-500",
    border: "border-l-amber-500/60",
    bg: "bg-amber-500/[0.04]",
  },
  6: {
    text: "text-rose-500",
    border: "border-l-rose-500/60",
    bg: "bg-rose-500/[0.04]",
  },
  0: {
    text: "text-violet-500",
    border: "border-l-violet-500/60",
    bg: "bg-violet-500/[0.04]",
  },
};

export const APPLICATION_STATUSES = [
  "Wishlist",
  "Researching",
  "Applied",
  "OA",
  "Phone",
  "Onsite",
  "Offer",
  "Rejected",
  "Withdrawn",
  "Ghosted",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Wishlist: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
  Researching: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  Applied: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  OA: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  Phone: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30",
  Onsite: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  Offer: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  Rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  Withdrawn: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
  Ghosted: "bg-stone-500/15 text-stone-700 dark:text-stone-400 border-stone-500/30",
};

export const PROBLEM_DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type ProblemDifficulty = (typeof PROBLEM_DIFFICULTIES)[number];

export const PROBLEM_STATUSES = ["Todo", "Solved", "Need Review"] as const;
export type ProblemStatus = (typeof PROBLEM_STATUSES)[number];

export const PROBLEM_KINDS = ["DSA", "Quant", "LLD", "HLD"] as const;
export type ProblemKind = (typeof PROBLEM_KINDS)[number];

export const RESOURCE_KINDS = [
  "Book",
  "Course",
  "Video",
  "Blog",
  "Paper",
  "Repo",
  "Other",
] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

export const RESOURCE_STATUSES = ["To-Read", "Reading", "Done"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

// Profile context: 4 YoE · current ~45L TC (35L base + 10L stocks) · target 60-70L+
// Companies grouped to companies that realistically clear that bar at a mid-senior SDE.
export const TARGET_COMPANIES = [
  // HFTs — Mumbai, Gurgaon, Bangalore, plus remote
  { name: "Optiver", category: "HFT", focus: "Mumbai · 80L–1.5Cr · Mental math + probability" },
  { name: "Tower Research", category: "HFT", focus: "Gurgaon · 90L–2Cr · Puzzles + C++" },
  { name: "Hudson River Trading", category: "HFT", focus: "SG/Remote · 100L+ · Puzzles + C++" },
  { name: "Jane Street", category: "HFT", focus: "HK/Remote · 90L–1.5Cr · Probability + OCaml" },
  { name: "Jump Trading", category: "HFT", focus: "SG/Remote · 80L–1.4Cr · C++ low-latency" },
  { name: "Citadel Securities", category: "HFT", focus: "SG/Remote · 100L+ · DSA + systems" },
  { name: "Da Vinci Derivatives", category: "HFT", focus: "Mumbai · 70–140L · Probability + trading" },
  { name: "Quadeye", category: "HFT", focus: "Gurgaon · 50–90L · DSA + probability" },
  { name: "Graviton Research", category: "HFT", focus: "Bangalore · 50–90L · DSA + C++" },
  { name: "WorldQuant", category: "HFT", focus: "Gurgaon · 50–90L · DSA + probability" },
  // FAANG India
  { name: "Google", category: "SDE", focus: "BLR/HYD · 60–100L · DSA + HLD" },
  { name: "Meta", category: "SDE", focus: "BLR · 70–120L · DSA + HLD" },
  { name: "Amazon", category: "SDE", focus: "BLR/HYD · 50–80L · DSA + LPs + HLD" },
  { name: "Apple", category: "SDE", focus: "BLR/HYD · 60–90L · DSA + systems" },
  { name: "Microsoft", category: "SDE", focus: "BLR/HYD · 60–90L · DSA + HLD" },
  // Tier-2 SaaS / Cloud / Distributed — strong fit for distributed-storage / eBPF / K8s profile
  { name: "Stripe", category: "SDE", focus: "BLR/Remote · 70–120L · Practical DSA + HLD" },
  { name: "Databricks", category: "SDE", focus: "BLR/Remote · 70–130L · Distributed systems (top fit)" },
  { name: "Snowflake", category: "SDE", focus: "BLR/Remote · 60–110L · Distributed storage (top fit)" },
  { name: "Confluent", category: "SDE", focus: "BLR/Remote · 60–100L · Streaming systems (top fit)" },
  { name: "HashiCorp", category: "SDE", focus: "Remote · 60–100L · Infra in Go (top fit)" },
  { name: "Datadog", category: "SDE", focus: "Remote · 60–100L · Observability infra (top fit)" },
  { name: "Cloudflare", category: "SDE", focus: "Remote · 50–90L · Networking / eBPF (top fit)" },
  { name: "Atlassian", category: "SDE", focus: "BLR · 60–90L · DSA + HLD" },
  { name: "Nvidia", category: "SDE", focus: "BLR · 60–100L · Low-level / CUDA" },
  { name: "Rubrik", category: "SDE", focus: "BLR · 60–100L · Distributed storage (Nutanix-adjacent, top fit)" },
  { name: "Cockroach Labs", category: "SDE", focus: "Remote · 70–120L · Distributed DB (top fit)" },
  // High-pay misc
  { name: "LinkedIn", category: "SDE", focus: "BLR · 60–90L · DSA + HLD" },
  { name: "Adobe", category: "SDE", focus: "BLR/NOIDA · 50–70L · DSA + HLD" },
  { name: "CRED", category: "SDE", focus: "BLR · 60–100L · Practical DSA" },
  { name: "Netflix", category: "SDE", focus: "Remote (rare) · 100L+ · DSA + HLD" },
] as const;

// System Design tracks: Alex Xu Vol 1 chapters + an empty Udemy course section
// you can populate as you progress through your course.
export const HLD_TRACKS: Record<string, string[]> = {
  "HLD-AlexXu-V1": [
    "Ch 1: Scale From Zero To Millions Of Users",
    "Ch 2: Back-of-the-envelope Estimation",
    "Ch 3: A Framework For System Design Interviews",
    "Ch 4: Design A Rate Limiter",
    "Ch 5: Design Consistent Hashing",
    "Ch 6: Design A Key-Value Store",
    "Ch 7: Design A Unique ID Generator",
    "Ch 8: Design A URL Shortener",
    "Ch 9: Design A Web Crawler",
    "Ch 10: Design A Notification System",
    "Ch 11: Design A News Feed System",
    "Ch 12: Design A Chat System",
    "Ch 13: Design A Search Autocomplete System",
    "Ch 14: Design YouTube",
    "Ch 15: Design Google Drive",
    "Ch 16: Real-world Designs",
  ],
  "HLD-Udemy": [],
};

export const HLD_DOMAIN_LABELS: Record<string, string> = {
  "HLD-AlexXu-V1": "Alex Xu — Vol 1",
  "HLD-Udemy": "Udemy Course",
  "HLD-Custom": "Custom Topics",
};

export const HLD_DOMAIN_HINTS: Record<string, string> = {
  "HLD-AlexXu-V1": "16 chapters · the canonical interview prep book",
  "HLD-Udemy": "Paste a Udemy course URL to import its curriculum, or add lectures manually",
  "HLD-Custom": "Anything outside the book / course",
};

export const HLD_DOMAINS_ORDER = [
  "HLD-AlexXu-V1",
  "HLD-Udemy",
  "HLD-Custom",
] as const;

// LeetCode tracking: this cycle starts May 1, 2026 (configurable via UI).
export const DEFAULT_LC_CYCLE_START = "2026-05-01";
export const DEFAULT_LC_CYCLE_LABEL = "May 2026 cycle";

export const NEETCODE_150_PREVIEW = [
  { title: "Two Sum", topic: "Arrays", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/" },
  { title: "Valid Anagram", topic: "Arrays", difficulty: "Easy", url: "https://leetcode.com/problems/valid-anagram/" },
  { title: "Group Anagrams", topic: "Arrays", difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/" },
  { title: "Top K Frequent Elements", topic: "Arrays", difficulty: "Medium", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
  { title: "Product of Array Except Self", topic: "Arrays", difficulty: "Medium", url: "https://leetcode.com/problems/product-of-array-except-self/" },
  { title: "Longest Consecutive Sequence", topic: "Arrays", difficulty: "Medium", url: "https://leetcode.com/problems/longest-consecutive-sequence/" },
  { title: "Valid Palindrome", topic: "Two Pointers", difficulty: "Easy", url: "https://leetcode.com/problems/valid-palindrome/" },
  { title: "3Sum", topic: "Two Pointers", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/" },
  { title: "Container With Most Water", topic: "Two Pointers", difficulty: "Medium", url: "https://leetcode.com/problems/container-with-most-water/" },
  { title: "Trapping Rain Water", topic: "Two Pointers", difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/" },
  { title: "Best Time to Buy And Sell Stock", topic: "Sliding Window", difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
  { title: "Longest Substring Without Repeating Characters", topic: "Sliding Window", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { title: "Longest Repeating Character Replacement", topic: "Sliding Window", difficulty: "Medium", url: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
  { title: "Minimum Window Substring", topic: "Sliding Window", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-window-substring/" },
  { title: "Valid Parentheses", topic: "Stack", difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/" },
  { title: "Min Stack", topic: "Stack", difficulty: "Medium", url: "https://leetcode.com/problems/min-stack/" },
  { title: "Daily Temperatures", topic: "Stack", difficulty: "Medium", url: "https://leetcode.com/problems/daily-temperatures/" },
  { title: "Largest Rectangle In Histogram", topic: "Stack", difficulty: "Hard", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
  { title: "Binary Search", topic: "Binary Search", difficulty: "Easy", url: "https://leetcode.com/problems/binary-search/" },
  { title: "Search In Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
  { title: "Find Minimum In Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
  { title: "Median of Two Sorted Arrays", topic: "Binary Search", difficulty: "Hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
  { title: "Reverse Linked List", topic: "Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/" },
  { title: "Merge Two Sorted Lists", topic: "Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { title: "Linked List Cycle", topic: "Linked List", difficulty: "Easy", url: "https://leetcode.com/problems/linked-list-cycle/" },
  { title: "Reorder List", topic: "Linked List", difficulty: "Medium", url: "https://leetcode.com/problems/reorder-list/" },
  { title: "Remove Nth Node From End of List", topic: "Linked List", difficulty: "Medium", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
  { title: "Copy List With Random Pointer", topic: "Linked List", difficulty: "Medium", url: "https://leetcode.com/problems/copy-list-with-random-pointer/" },
  { title: "Add Two Numbers", topic: "Linked List", difficulty: "Medium", url: "https://leetcode.com/problems/add-two-numbers/" },
  { title: "LRU Cache", topic: "Linked List", difficulty: "Medium", url: "https://leetcode.com/problems/lru-cache/" },
  { title: "Merge K Sorted Lists", topic: "Linked List", difficulty: "Hard", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
  { title: "Invert Binary Tree", topic: "Trees", difficulty: "Easy", url: "https://leetcode.com/problems/invert-binary-tree/" },
  { title: "Maximum Depth of Binary Tree", topic: "Trees", difficulty: "Easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
  { title: "Same Tree", topic: "Trees", difficulty: "Easy", url: "https://leetcode.com/problems/same-tree/" },
  { title: "Subtree of Another Tree", topic: "Trees", difficulty: "Easy", url: "https://leetcode.com/problems/subtree-of-another-tree/" },
  { title: "Lowest Common Ancestor of a Binary Search Tree", topic: "Trees", difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
  { title: "Binary Tree Level Order Traversal", topic: "Trees", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
  { title: "Validate Binary Search Tree", topic: "Trees", difficulty: "Medium", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
  { title: "Kth Smallest Element In a BST", topic: "Trees", difficulty: "Medium", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
  { title: "Binary Tree Maximum Path Sum", topic: "Trees", difficulty: "Hard", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
  { title: "Serialize And Deserialize Binary Tree", topic: "Trees", difficulty: "Hard", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },
  { title: "Number of Islands", topic: "Graphs", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/" },
  { title: "Clone Graph", topic: "Graphs", difficulty: "Medium", url: "https://leetcode.com/problems/clone-graph/" },
  { title: "Pacific Atlantic Water Flow", topic: "Graphs", difficulty: "Medium", url: "https://leetcode.com/problems/pacific-atlantic-water-flow/" },
  { title: "Course Schedule", topic: "Graphs", difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule/" },
  { title: "Word Ladder", topic: "Graphs", difficulty: "Hard", url: "https://leetcode.com/problems/word-ladder/" },
  { title: "Climbing Stairs", topic: "DP", difficulty: "Easy", url: "https://leetcode.com/problems/climbing-stairs/" },
  { title: "House Robber", topic: "DP", difficulty: "Medium", url: "https://leetcode.com/problems/house-robber/" },
  { title: "Coin Change", topic: "DP", difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/" },
  { title: "Longest Increasing Subsequence", topic: "DP", difficulty: "Medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
  { title: "Edit Distance", topic: "DP", difficulty: "Medium", url: "https://leetcode.com/problems/edit-distance/" },
  { title: "Maximum Subarray", topic: "Greedy", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/" },
  { title: "Jump Game", topic: "Greedy", difficulty: "Medium", url: "https://leetcode.com/problems/jump-game/" },
] as const;

export const RESOURCES_SEED = [
  { title: "Designing Data-Intensive Applications", kind: "Book", url: "https://dataintensive.net/", topic: "SysDesign" },
  { title: "System Design Interview Vol 1 — Alex Xu", kind: "Book", url: "https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF", topic: "SysDesign" },
  { title: "System Design Interview Vol 2 — Alex Xu", kind: "Book", url: "https://www.amazon.com/System-Design-Interview-Insiders-Guide/dp/1736049119", topic: "SysDesign" },
  { title: "Designing Distributed Systems — Burns", kind: "Book", url: "https://azure.microsoft.com/resources/designing-distributed-systems/", topic: "SysDesign" },
  { title: "Effective Modern C++ — Meyers", kind: "Book", url: "https://www.oreilly.com/library/view/effective-modern-c/9781491908419/", topic: "MiscTech" },
  { title: "C++ Concurrency in Action — Williams", kind: "Book", url: "https://www.manning.com/books/c-plus-plus-concurrency-in-action-second-edition", topic: "MiscTech" },
  { title: "Heard on the Street — Crack the HFT puzzle interview", kind: "Book", url: "https://www.amazon.com/Heard-Street-Quantitative-Questions-Interviews/dp/0970055293", topic: "MiscTech" },
  { title: "A Practical Guide to Quantitative Finance Interviews — Xinfeng Zhou", kind: "Book", url: "https://www.amazon.com/Practical-Guide-Quantitative-Finance-Interviews/dp/1438236662", topic: "MiscTech" },
  { title: "50 Challenging Problems in Probability — Mosteller", kind: "Book", url: "https://www.amazon.com/Fifty-Challenging-Problems-Probability-Solutions/dp/0486653552", topic: "MiscTech" },
  { title: "NeetCode 150", kind: "Course", url: "https://neetcode.io/practice", topic: "DSA" },
  { title: "System Design Primer", kind: "Repo", url: "https://github.com/donnemartin/system-design-primer", topic: "SysDesign" },
  { title: "Grokking the System Design Interview (DesignGurus)", kind: "Course", url: "https://www.designgurus.io/course/grokking-the-system-design-interview", topic: "SysDesign" },
  { title: "interviewing.io — paid mocks", kind: "Course", url: "https://interviewing.io/", topic: "Work" },
  { title: "Levels.fyi — TC research", kind: "Blog", url: "https://levels.fyi/", topic: "Work" },
  { title: "Pragmatic Engineer Newsletter", kind: "Blog", url: "https://newsletter.pragmaticengineer.com/", topic: "Work" },
  { title: "STAR method — behavioral framing", kind: "Blog", url: "https://www.themuse.com/advice/star-interview-method", topic: "Work" },
] as const;
