import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/leaderboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const visitors = await recordVisit();
  return NextResponse.json(
    { visitors },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
