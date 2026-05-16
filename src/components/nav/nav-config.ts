import {
  LayoutDashboard,
  Code2,
  Network,
  Boxes,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Briefcase,
  Mic,
  Timer,
  Target,
  Library,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  group: "Daily" | "Prep" | "Pipeline" | "Meta";
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    short: "Home",
    icon: LayoutDashboard,
    group: "Daily",
    description: "Today's focus, streaks, heatmap",
  },
  {
    href: "/time",
    label: "Time Tracker",
    short: "Time",
    icon: Timer,
    group: "Daily",
    description: "Pomodoro + study log",
  },
  {
    href: "/goals",
    label: "Goals & Roadmap",
    short: "Goals",
    icon: Target,
    group: "Daily",
    description: "Weekly goals + milestones",
  },
  {
    href: "/dsa",
    label: "DSA / LeetCode",
    short: "DSA",
    icon: Code2,
    group: "Prep",
    description: "Problems, revision, company tracks",
  },
  {
    href: "/hld",
    label: "System Design",
    short: "HLD",
    icon: Network,
    group: "Prep",
    description: "HLD topics + case studies",
  },
  {
    href: "/lld",
    label: "Low-Level Design",
    short: "LLD",
    icon: Boxes,
    group: "Prep",
    description: "Patterns + LLD problems",
  },
  {
    href: "/hft",
    label: "HFT Prep",
    short: "HFT",
    icon: TrendingUp,
    group: "Prep",
    description: "Quant, mental math, C++",
  },
  {
    href: "/cs",
    label: "CS Fundamentals",
    short: "CS",
    icon: BookOpen,
    group: "Prep",
    description: "OS, Networking, DBMS, DistSys",
  },
  {
    href: "/behavioral",
    label: "Behavioral Stories",
    short: "Beh",
    icon: MessageSquare,
    group: "Prep",
    description: "STAR story bank",
  },
  {
    href: "/applications",
    label: "Applications",
    short: "Apps",
    icon: Briefcase,
    group: "Pipeline",
    description: "Pipeline + comp tracker",
  },
  {
    href: "/mocks",
    label: "Mock Interviews",
    short: "Mocks",
    icon: Mic,
    group: "Pipeline",
    description: "Mock log + analytics",
  },
  {
    href: "/resources",
    label: "Resources",
    short: "Res",
    icon: Library,
    group: "Meta",
    description: "Books, courses, blogs",
  },
];

export const NAV_GROUPS: Array<NavItem["group"]> = ["Daily", "Prep", "Pipeline", "Meta"];
