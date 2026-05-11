import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calendarOpportunities } from "@/lib/seed-data";

const querySchema = z.object({
  urgency: z.enum(["design now", "coming soon", "plan ahead"]).optional()
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

  const { urgency } = parsed.data;
  const results = urgency
    ? calendarOpportunities.filter((e) => e.urgency === urgency)
    : calendarOpportunities;

  return NextResponse.json(results);
}
