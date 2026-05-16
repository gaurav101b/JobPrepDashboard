function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toICSDate(d: Date, allDay = false): string {
  if (allDay) {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
  }
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(
    d.getUTCDate()
  )}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export type ICalEvent = {
  uid: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  url?: string;
  location?: string;
};

export function buildICS(events: ICalEvent[], calName = "Job Prep"): string {
  const now = new Date();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Job Prep Dashboard//EN",
    `X-WR-CALNAME:${escapeText(calName)}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const ev of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${toICSDate(now)}`);
    if (ev.allDay) {
      const start = ev.start;
      const end = ev.end ?? new Date(start.getTime() + 24 * 60 * 60 * 1000);
      lines.push(`DTSTART;VALUE=DATE:${toICSDate(start, true)}`);
      lines.push(`DTEND;VALUE=DATE:${toICSDate(end, true)}`);
    } else {
      const start = ev.start;
      const end = ev.end ?? new Date(start.getTime() + 30 * 60 * 1000);
      lines.push(`DTSTART:${toICSDate(start)}`);
      lines.push(`DTEND:${toICSDate(end)}`);
    }
    lines.push(`SUMMARY:${escapeText(ev.title)}`);
    if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
    if (ev.location) lines.push(`LOCATION:${escapeText(ev.location)}`);
    if (ev.url) lines.push(`URL:${escapeText(ev.url)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
