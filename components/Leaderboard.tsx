"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { tierForScore } from "@/lib/score";

const CYAN = "0, 240, 255";
const POLL_MS = 12_000;

type Stats = { roasts: number; uniqueDevs: number; visitors: number };
type Data = { entries: LeaderboardEntry[]; total: number; stats?: Stats; live: boolean };

const METAL: Record<number, { cls: string; ring: string }> = {
  1: { cls: "metallic-gold", ring: "251,191,36" },
  2: { cls: "metallic-silver", ring: "203,213,225" },
  3: { cls: "metallic-bronze", ring: "205,127,50" }
};

// commit volume → 0..100 on a log scale (50k commits ≈ full bar)
function volumePct(commits: number) {
  if (commits <= 0) return 0;
  return Math.max(4, Math.min(100, Math.round((Math.log10(commits + 1) / Math.log10(50000)) * 100)));
}

function RankBadge({ rank }: { rank: number }) {
  const medal: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  if (rank <= 3)
    return <span className="w-5 flex-shrink-0 text-center text-[14px] leading-none">{medal[rank]}</span>;
  return (
    <span className="w-5 flex-shrink-0 text-center font-mono text-[11px] text-neutral-700">
      {rank}
    </span>
  );
}

interface Props {
  onSelect: (username: string) => void;
  currentUsername?: string;
  refreshKey?: number;
}

export function Leaderboard({ onSelect, currentUsername, refreshKey = 0 }: Props) {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/leaderboard", { cache: "no-store" })
        .then(r => r.json())
        .then(d => { if (alive) setData(d); })
        .catch(() => {});
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [refreshKey]);

  if (!data) {
    return (
      <div className="mt-16 flex w-full max-w-2xl justify-center">
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-700">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-1 w-1 rounded-full bg-accent-glow"
          />
          loading rankings
        </div>
      </div>
    );
  }

  if (data.entries.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-16 w-full max-w-2xl"
      >
        <SectionHeader live={data.live} count={0} />
        <div
          className="flex flex-col items-center gap-3 rounded-2xl px-6 py-10 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Trophy size={22} strokeWidth={1} className="text-neutral-700" />
          <p className="font-mono text-xs text-neutral-600">no one has been roasted yet</p>
          <p className="font-mono text-[10px] text-neutral-700">
            enter a username above to claim the top spot
          </p>
        </div>
      </motion.section>
    );
  }

  const entries = data.entries;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mt-16 w-full max-w-2xl"
    >
      <SectionHeader live={data.live} count={entries.length} />

      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 50px rgba(${CYAN},0.05)`
        }}
      >
        {/* Column headers */}
        <div
          className="flex items-center gap-3 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-700"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="w-5 text-center">#</span>
          <span className="w-7" />
          <span className="flex-1">developer</span>
          <span className="hidden w-24 text-center sm:block">vol / chaos</span>
          <span className="w-9 text-center">rank</span>
          <span className="w-10 text-right">score</span>
        </div>

        {/* Scroll viewport */}
        <div className="lb-scroll overflow-y-auto" style={{ maxHeight: "22rem" }}>
          {entries.map((entry, i) => {
            const rank = i + 1;
            const isCurrent =
              !!currentUsername &&
              entry.username.toLowerCase() === currentUsername.toLowerCase();
            const tier = tierForScore(entry.score);
            const tc = tier.color;
            const metal = METAL[rank];
            const vol = volumePct(entry.totalCommits);
            return (
              <motion.button
                key={entry.username}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.035, duration: 0.3, ease: "easeOut" }}
                onClick={() => onSelect(entry.username)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150"
                style={{
                  borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.035)" : "none",
                  background: isCurrent
                    ? `rgba(${CYAN},0.07)`
                    : i % 2 === 1
                    ? "rgba(255,255,255,0.015)"
                    : "transparent"
                }}
                onMouseEnter={e => {
                  if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.045)";
                }}
                onMouseLeave={e => {
                  if (!isCurrent)
                    (e.currentTarget as HTMLElement).style.background = isCurrent
                      ? `rgba(${CYAN},0.07)`
                      : i % 2 === 1
                      ? "rgba(255,255,255,0.015)"
                      : "transparent";
                }}
              >
                <RankBadge rank={rank} />

                {/* Avatar (metallic ring for top 3) */}
                <div className="relative flex-shrink-0">
                  {entry.avatar ? (
                    <img
                      src={entry.avatar}
                      alt=""
                      className="h-7 w-7 rounded-full"
                      style={{
                        filter: "saturate(0.45) brightness(0.82)",
                        boxShadow: metal ? `0 0 0 1.5px rgba(${metal.ring},0.9), 0 0 12px rgba(${metal.ring},0.45)` : undefined
                      }}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-neutral-800" />
                  )}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 0 1.5px rgba(${CYAN},0.6)` }} />
                  )}
                </div>

                {/* Name + tier */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`truncate font-mono text-[12px] font-semibold ${metal ? metal.cls : ""}`}
                      style={metal ? undefined : isCurrent ? { color: `rgb(${CYAN})` } : { color: "rgb(212,212,212)" }}
                    >
                      @{entry.username}
                    </span>
                    {isCurrent && (
                      <span className="flex-shrink-0 font-mono text-[8px] uppercase tracking-widest" style={{ color: `rgba(${CYAN},0.6)` }}>
                        you
                      </span>
                    )}
                  </div>
                  <div className="mt-px truncate font-mono text-[8.5px] uppercase tracking-wider" style={{ color: `rgba(${tc},0.65)` }}>
                    {tier.name}
                  </div>
                </div>

                {/* Dual mini-meter: volume (top) vs chaos (bottom) */}
                <div className="hidden w-24 flex-shrink-0 flex-col gap-1 sm:flex">
                  <div className="h-[3px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${vol}%`, background: "rgba(148,163,184,0.7)" }} />
                  </div>
                  <div className="h-[3px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${entry.score}%`, background: `rgb(${tc})`, boxShadow: `0 0 6px rgba(${tc},0.6)` }} />
                  </div>
                </div>

                {/* Grade chip */}
                <span
                  className="w-9 flex-shrink-0 rounded-md px-1.5 py-0.5 text-center font-mono text-[10px] font-extrabold leading-none"
                  style={{ color: `rgb(${tc})`, background: `rgba(${tc},0.12)`, border: `1px solid rgba(${tc},0.3)` }}
                >
                  {tier.grade}
                </span>

                {/* Score */}
                <span className="w-10 flex-shrink-0 text-right font-mono text-[13px] font-bold tabular-nums" style={{ color: `rgb(${tc})` }}>
                  {entry.score}
                </span>
              </motion.button>
            );
          })}
        </div>

        {entries.length > 6 && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-2xl"
            style={{ background: "linear-gradient(to top, rgba(5,5,7,0.95), transparent)" }}
          />
        )}
      </div>

      {!data.live && (
        <p className="mt-3 text-center font-mono text-[9px] tracking-wide text-neutral-800">
          connect vercel kv to show real-time rankings
        </p>
      )}

      <style>{`
        @keyframes lb-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        .lb-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,240,255,0.25) transparent; }
        .lb-scroll::-webkit-scrollbar { width: 6px; }
        .lb-scroll::-webkit-scrollbar-track { background: transparent; }
        .lb-scroll::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.18); border-radius: 999px; }
        .lb-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,240,255,0.5); }
      `}</style>
    </motion.section>
  );
}

function SectionHeader({ live, count }: { live: boolean; count: number }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Trophy size={13} strokeWidth={1.5} className="text-accent-glow" />
        <span className="font-display text-[13px] font-bold uppercase tracking-[0.16em] text-neutral-200">
          chaos rankings
        </span>
        {live && (
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-glow" style={{ boxShadow: "0 0 6px rgba(0,240,255,0.9)", animation: "lb-pulse 2s ease-in-out infinite" }} />
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">live</span>
          </span>
        )}
      </div>
      {count > 0 && (
        <div className="flex items-center gap-1.5 text-neutral-600">
          <Users size={11} strokeWidth={1.5} />
          <span className="font-mono text-[10px]">{count.toLocaleString("en-US")} ranked</span>
        </div>
      )}
    </div>
  );
}
