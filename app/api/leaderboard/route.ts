import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";

export const runtime = "nodejs";
export const revalidate = 30; // ISR: refresh every 30 s

export async function GET() {
  const data = await getLeaderboard();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" }
  });
}
