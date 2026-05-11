import { runDailyScan } from "@trend-chaser/jobs"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 })
  }

  try {
    const result = await runDailyScan({ trigger: "daily-cron", dryRun: false })
    return Response.json({
      ok: true,
      status: result.scanRun.status,
      candidateCount: result.scanRun.candidateCount,
      enrichedCount: result.scanRun.enrichedCount,
      durationMs: result.scanRun.durationMs,
      errorCount: result.scanRun.errorCount,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return POST(req)
}
