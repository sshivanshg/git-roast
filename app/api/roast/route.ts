import { NextRequest, NextResponse } from "next/server";
import { computeRoast, RoastError } from "@/lib/roast";

export const runtime = "nodejs";

const MESSAGES: Record<string, string> = {
  invalid_username: "That doesn't look like a GitHub username.",
  not_found: "No GitHub user by that name. Typo, maybe?",
  rate_limited:
    "GitHub rate-limited us (it happens at scale). Try again in a minute.",
  forbidden: "GitHub blocked the request. Try again shortly."
};

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("u");
  if (!username) {
    return NextResponse.json({ error: "Missing ?u=username" }, { status: 400 });
  }

  try {
    const roast = await computeRoast(username);
    return NextResponse.json(roast, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" }
    });
  } catch (err) {
    if (err instanceof RoastError) {
      return NextResponse.json(
        { error: MESSAGES[err.message] || "Something went sideways." },
        { status: err.status }
      );
    }
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
