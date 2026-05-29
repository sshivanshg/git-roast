// Global leaderboard backed by Vercel KV (Upstash Redis).
// Falls back to SEED_DATA when KV env vars are absent (local dev / first deploy).

import type { Roast } from "@/lib/roast";

export type LeaderboardEntry = {
  username: string;
  avatar: string | null;
  score: number;
  title: string;
  totalCommits: number;
};

// Pre-seeded famous devs so the board is never empty
const SEED_DATA: LeaderboardEntry[] = [
  { username: "torvalds",      avatar: "https://avatars.githubusercontent.com/u/1024025",  score: 82, title: "Hostage of His Own Repo",              totalCommits: 18400 },
  { username: "gaearon",       avatar: "https://avatars.githubusercontent.com/u/810438",   score: 74, title: "Nocturnal Gremlin",                     totalCommits: 9200  },
  { username: "sindresorhus",  avatar: "https://avatars.githubusercontent.com/u/170270",   score: 68, title: "Commit Message Minimalist (Derogatory)", totalCommits: 31000 },
  { username: "yyx990803",     avatar: "https://avatars.githubusercontent.com/u/499550",   score: 61, title: "Touch-Grass Refusenik",                 totalCommits: 11600 },
  { username: "tj",            avatar: "https://avatars.githubusercontent.com/u/25254",    score: 57, title: "Professional 'fix' Typist",             totalCommits: 22100 },
  { username: "addyosmani",    avatar: "https://avatars.githubusercontent.com/u/110953",   score: 44, title: "Certified Open-Source Menace",          totalCommits: 7800  },
  { username: "dhh",           avatar: "https://avatars.githubusercontent.com/u/2741",     score: 38, title: "Force-Push Felon",                      totalCommits: 5300  },
  { username: "jashkenas",     avatar: "https://avatars.githubusercontent.com/u/4732",     score: 33, title: "Suspiciously Well-Adjusted (Boring)",   totalCommits: 6100  },
];

const KV_KEY   = "git-wrapped:leaderboard";
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

  if (!kv) {
    return { entries: SEED_DATA, total: SEED_DATA.length, live: false };
  }

  try {
    const [raw, total] = await Promise.all([
      kv.get<LeaderboardEntry[]>(KV_KEY),
      kv.get<number>("git-wrapped:total")
    ]);

    const entries = raw && raw.length > 0 ? raw : SEED_DATA;
    return { entries, total: total ?? entries.length, live: true };
  } catch {
    return { entries: SEED_DATA, total: SEED_DATA.length, live: false };
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

    const [existing] = await Promise.all([kv.get<LeaderboardEntry[]>(KV_KEY)]);
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
