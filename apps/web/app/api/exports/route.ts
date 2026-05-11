export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trendSignals, calendarOpportunities, savedPrompts } from "@/lib/seed-data";

const querySchema = z.object({
  format: z.enum(["csv", "markdown"]),
  scope: z.enum(["trends", "calendar", "prompts"])
});

function trendsToCSV(): string {
  const header = "id,phrase,niche,temperature,score,momentum,competition,uploadWindow,action,platforms\n";
  const rows = trendSignals.map((t) =>
    [t.id, `"${t.phrase}"`, `"${t.niche}"`, t.temperature, t.score, t.momentum, `"${t.competition}"`, t.uploadWindow, t.action, `"${t.platforms.join("|")}"`].join(",")
  );
  return header + rows.join("\n");
}

function trendsToMarkdown(): string {
  const rows = trendSignals.map(
    (t) =>
      `| ${t.phrase} | ${t.niche} | ${t.temperature} | ${t.score} | ${t.momentum} | ${t.uploadWindow} | ${t.action} |`
  );
  return (
    "# Trend Export\n\n" +
    "| Phrase | Niche | Temp | Score | Momentum | Window | Action |\n" +
    "|---|---|---|---|---|---|---|\n" +
    rows.join("\n")
  );
}

function calendarToCSV(): string {
  const header = "id,title,date,daysAway,urgency,platform,uploadDeadline\n";
  const rows = calendarOpportunities.map((e) =>
    [e.id, `"${e.title}"`, e.date, e.daysAway, `"${e.urgency}"`, e.platform, e.uploadDeadline].join(",")
  );
  return header + rows.join("\n");
}

function calendarToMarkdown(): string {
  const rows = calendarOpportunities.map(
    (e) => `| ${e.title} | ${e.date} | ${e.daysAway}d | ${e.urgency} | ${e.platform} | ${e.uploadDeadline} |`
  );
  return (
    "# Calendar Export\n\n" +
    "| Event | Date | Days Away | Urgency | Platform | Deadline |\n" +
    "|---|---|---|---|---|---|\n" +
    rows.join("\n")
  );
}

function promptsToMarkdown(): string {
  return (
    "# Saved Prompts Export\n\n" +
    savedPrompts
      .map(
        (p) =>
          `## ${p.phrase} — ${p.style}\n\n${p.prompt}\n\n**Keywords:** ${p.keywords.join(", ")}\n`
      )
      .join("\n---\n\n")
  );
}

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query: format and scope are required" },
      { status: 400 }
    );
  }

  const { format, scope } = parsed.data;

  let content = "";
  let filename = "";
  let contentType = "";

  if (format === "csv") {
    contentType = "text/csv";
    filename = `trend-chaser-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    if (scope === "trends") content = trendsToCSV();
    else if (scope === "calendar") content = calendarToCSV();
    else content = "Not available in CSV format. Use markdown for prompts.";
  } else {
    contentType = "text/markdown";
    filename = `trend-chaser-${scope}-${new Date().toISOString().slice(0, 10)}.md`;
    if (scope === "trends") content = trendsToMarkdown();
    else if (scope === "calendar") content = calendarToMarkdown();
    else content = promptsToMarkdown();
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
