export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { trendSignals } from "@/lib/seed-data";

const querySchema = z.object({
  temperature: z.enum(["hot", "warm", "cold"]).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { temperature, limit = 50 } = parsed.data;

  let results = trendSignals;
  if (temperature) results = results.filter((t) => t.temperature === temperature);
  results = results.slice(0, limit);

  return NextResponse.json(results);
}
