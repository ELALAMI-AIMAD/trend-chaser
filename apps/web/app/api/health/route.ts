export async function GET() {
  return Response.json({
    ok: true,
    service: "trend-chaser-web",
    checkedAt: new Date().toISOString()
  });
}
