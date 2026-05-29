// Chaos scoring engine — deliberately HARD to max out.
//
// The old formula was a flat additive sum of raw counts, so anyone with a pile
// of "fix" commits instantly pinned 100. This version instead:
//   1. measures 8 chaos dimensions as RATES (share of commits), not raw counts,
//      so volume alone can't carry you;
//   2. blends a weighted average (rewards being chaotic across many axes) with
//      the single strongest axis (so a one-trick menace still scores);
//   3. pushes the result through a saturating power curve, making the top end
//      asymptotic — 90+ is rare, 96+ is legendary, 100 is basically mythical.
//
// Pure module: no network, no framework imports — safe to use on server AND
// client (so the leaderboard can derive a tier badge straight from a score).

export type ChaosTier = {
  grade: string;   // gamer-style rank: F … SSS, Ω for the mythic 100
  name: string;    // quirky title for the band
  rarity: string;  // shareable "how rare is this" blurb
  color: string;   // "r,g,b" accent for the UI badge
};

export type ChaosSignals = {
  sampleSize: number;     // commits actually analyzed (<= 100)
  totalCommits: number;   // lifetime indexed commits
  fixCount: number;
  lazyCount: number;
  oneWord: number;
  profanity: number;
  revertCount: number;
  mergeCount: number;
  lateNightPct: number;   // 0..100, already a percentage
  weekendPct: number;     // 0..100
  topRepoShare: number;   // 0..100, share going to the single busiest repo
  shortestLen: number | null;
};

export type ChaosResult = {
  score: number;          // 1..100
  tier: ChaosTier;
  breakdown: Record<string, number>; // 0..1 per dimension (debug / future UI)
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

// Score bands, highest first. Tuned against the curve below so each tier is
// progressively harder to reach.
const TIERS: { min: number; tier: ChaosTier }[] = [
  { min: 100, tier: { grade: "Ω",   name: "THE SINGULARITY",       rarity: "0.01% · this should not exist",  color: "255,255,255" } },
  { min: 95,  tier: { grade: "SSS", name: "ELDRITCH COMMITTER",    rarity: "top 1% · touched by the void",   color: "168,85,247"  } },
  { min: 87,  tier: { grade: "SS",  name: "GIT WAR CRIMINAL",      rarity: "top 4% most unhinged",           color: "236,72,153"  } },
  { min: 77,  tier: { grade: "S",   name: "CERTIFIED MENACE",      rarity: "top 11% · genuine hazard",       color: "248,113,113" } },
  { min: 65,  tier: { grade: "A",   name: "CHAOS GREMLIN",         rarity: "top 24% · feral energy",         color: "251,146,60"  } },
  { min: 51,  tier: { grade: "B",   name: "FERAL BUT FUNCTIONAL",  rarity: "above-average chaos",            color: "251,191,36"  } },
  { min: 37,  tier: { grade: "C",   name: "MILDLY UNHINGED",       rarity: "dead center of the bell curve",  color: "56,189,248"  } },
  { min: 23,  tier: { grade: "D",   name: "WEEKEND TINKERER",      rarity: "refreshingly stable",            color: "45,212,191"  } },
  { min: 11,  tier: { grade: "E",   name: "SUSPICIOUSLY ADJUSTED", rarity: "touch-grass tier",               color: "74,222,128"  } },
  { min: 0,   tier: { grade: "F",   name: "NPC ENERGY",            rarity: "do you even commit?",            color: "148,163,184" } }
];

export function tierForScore(score: number): ChaosTier {
  for (const t of TIERS) if (score >= t.min) return t.tier;
  return TIERS[TIERS.length - 1].tier;
}

export function chaosScore(s: ChaosSignals): ChaosResult {
  const rate = (n: number) => (s.sampleSize > 0 ? n / s.sampleSize : 0);

  // Each dimension is normalized to 0..1, where 1 = "as bad as it realistically
  // gets". The divisors are the saturation points (e.g. 45% "fix" commits = max).
  const dFix     = clamp01(rate(s.fixCount) / 0.45);
  const dLazy    = clamp01((rate(s.lazyCount) + rate(s.oneWord) * 0.5) / 0.6);
  const dNight   = clamp01(s.lateNightPct / 60);
  const dWeekend = clamp01(s.weekendPct / 70);
  const dRage    = clamp01(rate(s.profanity) / 0.12);
  const dUndo    = clamp01((rate(s.revertCount) * 1.4 + rate(s.mergeCount) * 0.8) / 0.4);
  const dTunnel  = clamp01((s.topRepoShare / 100) / 0.9);
  const dGrind   = clamp01(Math.log10(s.totalCommits + 1) / Math.log10(8000));
  const dShort   = s.shortestLen == null ? 0 : s.shortestLen <= 2 ? 0.5 : s.shortestLen <= 4 ? 0.25 : 0;

  // Weighted blend (weights sum to 1.0). Rewards broad, multi-axis chaos.
  const weighted =
    dFix * 0.19 +
    dLazy * 0.15 +
    dNight * 0.15 +
    dWeekend * 0.11 +
    dRage * 0.12 +
    dUndo * 0.08 +
    dTunnel * 0.06 +
    dGrind * 0.10 +
    dShort * 0.04;

  // Strongest *behavioral* axis — grind (raw volume) is intentionally excluded
  // so a prolific-but-tidy dev doesn't get carried by commit count alone.
  const maxDim = Math.max(dFix, dLazy, dNight, dWeekend, dRage, dUndo, dTunnel);

  const intensity = clamp01(0.58 * weighted + 0.42 * maxDim);

  // Saturating curve: exponent > 1 suppresses the mid/low range and makes the
  // ceiling asymptotic, so the last few points cost exponentially more.
  let score = Math.round(3 + 97 * Math.pow(intensity, 1.45));
  score = Math.max(1, Math.min(100, score));

  return {
    score,
    tier: tierForScore(score),
    breakdown: { dFix, dLazy, dNight, dWeekend, dRage, dUndo, dTunnel, dGrind, dShort }
  };
}
