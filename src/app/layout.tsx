import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/nav/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Prep · Dashboard",
  description:
    "Personal command center for SDE + HFT interview prep — DSA, system design, applications, time and goals.",
};

// Runs before hydration (no flicker on theme load).
// Stored value is "light" | "dark" | "sunset"; missing falls back to system.
const themeBootstrap = `
(function () {
  try {
    var t = localStorage.getItem("theme");
    if (t !== "light" && t !== "dark" && t !== "sunset") {
      t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark" : "light";
    }
    var cl = document.documentElement.classList;
    cl.toggle("dark", t === "dark" || t === "sunset");
    cl.toggle("sunset", t === "sunset");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <TooltipProvider delayDuration={150}>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col">{children}</div>
          </div>
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
