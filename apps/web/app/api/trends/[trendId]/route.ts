import { NextRequest, NextResponse } from "next/server";
import { getTrendById } from "@/lib/seed-data";

type Params = { params: Promise<{ trendId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { trendId } = await params;
  const trend = getTrendById(trendId);

  if (!trend) {
    return NextResponse.json({ error: "Trend not found" }, { status: 404 });
  }

  return NextResponse.json(trend);
}
