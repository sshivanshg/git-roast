import type { Roast } from "@/lib/roast";

export type LeaderboardEntry = {
  username: string;
  avatar: string | null;
  score: number;
  title: string;
  totalCommits: number;
};

export type Stats = {
  /** total roasts run (every username search) */
  roasts: number;
  /** unique developers ever roasted */
  uniqueDevs: number;
  /** total page visits */
  visitors: number;
};

export type LeaderboardData = {
  entries: LeaderboardEntry[];
  total: number;
  stats: Stats;
  live: boolean;
};

const KV_KEY     = "git-wrapped:leaderboard";
const TOTAL_KEY  = "git-wrapped:total";   // total roasts run
const USERS_KEY  = "git-wrapped:users";   // SET of unique usernames
const VISITS_KEY = "git-wrapped:visits";  // total page visits
const MAX_SIZE   = 100;

/**
 * Resolve REST credentials from either naming scheme:
 *  - Legacy Vercel KV integration:    KV_REST_API_URL / KV_REST_API_TOKEN
 *  - Upstash Marketplace integration: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * The previous code only checked the first pair, so an Upstash-connected
 * project read as "not configured" and the leaderboard never went live.
 */
function kvCreds(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  return null;
}

export function isKVConfigured(): boolean {
  return kvCreds() !== null;
}

async function getKV() {
  const creds = kvCreds();
  if (!creds) return null;
  const { createClient } = await import("@vercel/kv");
  return createClient({ url: creds.url, token: creds.token });
}

/* ----------------------------------------------------------------------------
 * Local-dev fallback. When no Redis creds are present (e.g. `next dev` without
 * a pulled .env), keep an in-process store so the leaderboard + live counts
 * still work while developing. Not shared across serverless instances, so this
 * is only ever the local path — in production KV is always configured.
 * ------------------------------------------------------------------------- */
const mem = {
  entries: [] as LeaderboardEntry[],
  users: new Set<string>(),
  roasts: 0,
  visits: 0
};

export async function getLeaderboard(): Promise<LeaderboardData> {
  const kv = await getKV();

  if (!kv) {
    const entries = [...mem.entries].sort((a, b) => b.score - a.score);
    return {
      entries,
      total: mem.roasts || entries.length,
      stats: { roasts: mem.roasts, uniqueDevs: mem.users.size, visitors: mem.visits },
      live: false
    };
  }

  try {
    const [raw, roasts, uniqueDevs, visitors] = await Promise.all([
      kv.get<LeaderboardEntry[]>(KV_KEY),
      kv.get<number>(TOTAL_KEY),
      kv.scard(USERS_KEY),
      kv.get<number>(VISITS_KEY)
    ]);
    const entries = raw ?? [];
    return {
      entries,
      total: roasts ?? entries.length,
      stats: {
        roasts: roasts ?? entries.length,
        // The users SET is populated going forward; floor to the known unique
        // entries so pre-existing data never shows a misleading 0.
        uniqueDevs: Math.max(uniqueDevs ?? 0, entries.length),
        visitors: visitors ?? 0
      },
      live: true
    };
  } catch {
    return {
      entries: [],
      total: 0,
      stats: { roasts: 0, uniqueDevs: 0, visitors: 0 },
      live: false
    };
  }
}

export async function saveToLeaderboard(roast: Roast): Promise<void> {
  const kv = await getKV();

  const entry: LeaderboardEntry = {
    username:     roast.username,
    avatar:       roast.avatar,
    score:        roast.score,
    title:        roast.title,
    totalCommits: roast.totalCommits
  };

  if (!kv) {
    mem.entries = [entry, ...mem.entries.filter(e => e.username !== roast.username)]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SIZE);
    mem.users.add(roast.username.toLowerCase());
    mem.roasts += 1;
    return;
  }

  try {
    const existing = await kv.get<LeaderboardEntry[]>(KV_KEY);
    const prev = (existing ?? []).filter(e => e.username !== roast.username);
    const updated = [entry, ...prev]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SIZE);

    await Promise.all([
      kv.set(KV_KEY, updated),
      kv.incr(TOTAL_KEY),
      kv.sadd(USERS_KEY, roast.username.toLowerCase())
    ]);
  } catch {
    // Non-critical — silently ignore KV errors
  }
}

/** Record a page visit and return the running total. */
export async function recordVisit(): Promise<number> {
  const kv = await getKV();
  if (!kv) {
    mem.visits += 1;
    return mem.visits;
  }
  try {
    return await kv.incr(VISITS_KEY);
  } catch {
    return 0;
  }
}
