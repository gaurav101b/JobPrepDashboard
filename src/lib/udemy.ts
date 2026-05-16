import "server-only";

const UDEMY_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
};

export type UdemyCurriculum = {
  courseTitle: string | null;
  lectures: string[];
};

export function isUdemyCourseUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /udemy\.com$/i.test(u.hostname) && u.pathname.includes("/course/");
  } catch {
    return false;
  }
}

function decodeHtml(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function uniq(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    const t = x.trim();
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/**
 * Best-effort scrape of a public Udemy course's curriculum from the marketing page.
 * Udemy renders much of the curriculum on the server, but they obfuscate class
 * names heavily. We probe a few stable hooks and fall back to nothing if none match.
 *
 * If this fails, the user can paste the lecture list manually.
 */
export async function scrapeUdemyCurriculum(
  rawUrl: string
): Promise<UdemyCurriculum> {
  const url = rawUrl.trim();
  if (!isUdemyCourseUrl(url)) {
    throw new Error("Not a recognised Udemy course URL");
  }
  const res = await fetch(url, { headers: UDEMY_HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`Udemy responded ${res.status}`);
  const html = await res.text();

  let courseTitle: string | null = null;
  const titleMatch =
    html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ??
    html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) courseTitle = decodeHtml(titleMatch[1]).replace(/\s*\|\s*Udemy\s*$/i, "");

  const candidates: string[] = [];

  // 1) Stable Udemy data-purpose hooks
  const reItemTitle =
    /data-purpose="item-title"[^>]*>([^<]{2,200})</g;
  let m: RegExpExecArray | null;
  while ((m = reItemTitle.exec(html)) !== null) {
    candidates.push(decodeHtml(m[1]));
  }

  // 2) Some courses use aria-label on curriculum items
  const reAria = /aria-label="([^"]{2,200})"\s+data-purpose="curriculum-item-link"/g;
  while ((m = reAria.exec(html)) !== null) {
    candidates.push(decodeHtml(m[1]));
  }

  // 3) JSON-LD blob sometimes carries hasPart / itemListElement
  const reJsonLd = /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g;
  while ((m = reJsonLd.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const visit = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        const obj = node as Record<string, unknown>;
        if (typeof obj.name === "string" && obj.name.length > 2) {
          candidates.push(obj.name);
        }
        for (const v of Object.values(obj)) {
          if (Array.isArray(v)) v.forEach(visit);
          else if (v && typeof v === "object") visit(v);
        }
      };
      visit(data);
    } catch {
      // ignore JSON parse errors
    }
  }

  return {
    courseTitle,
    lectures: uniq(candidates),
  };
}
