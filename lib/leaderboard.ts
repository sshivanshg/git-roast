import type { Roast } from "@/lib/roast";

export type LeaderboardEntry = {
  username: string;
  avatar: string | null;
  score: number;
  title: string;
  totalCommits: number;
};

const KV_KEY  = "git-wrapped:leaderboard";
const MAX_SIZE = 100;

function isKVConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKV() {
  if (!isKVConfigured()) return null;
  const { kv } = await import("@vercel/kv");
  return kv;
}

export async function getLeaderboard(): Promise<{ entries: LeaderboardEntry[]; total: number; live: boolean }> {
  const kv = await getKV();
  if (!kv) return { entries: [], total: 0, live: false };

  try {
    const [raw, total] = await Promise.all([
      kv.get<LeaderboardEntry[]>(KV_KEY),
      kv.get<number>("git-wrapped:total")
    ]);
    const entries = raw ?? [];
    return { entries, total: total ?? entries.length, live: true };
  } catch {
    return { entries: [], total: 0, live: false };
  }
}

export async function saveToLeaderboard(roast: Roast): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  try {
    const entry: LeaderboardEntry = {
      username:     roast.username,
      avatar:       roast.avatar,
      score:        roast.score,
      title:        roast.title,
      totalCommits: roast.totalCommits
    };

    const existing = await kv.get<LeaderboardEntry[]>(KV_KEY);
    const prev = (existing ?? []).filter(e => e.username !== roast.username);
    const updated = [entry, ...prev]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SIZE);

    await Promise.all([
      kv.set(KV_KEY, updated),
      kv.incr("git-wrapped:total")
    ]);
  } catch {
    // Non-critical — silently ignore KV errors
  }
}
