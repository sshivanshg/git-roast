import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";

export const runtime = "nodejs";
// Always read fresh from Redis — the client polls this for the live leaderboard,
// so edge-caching it would make rankings look frozen.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const data = await getLeaderboard();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}
