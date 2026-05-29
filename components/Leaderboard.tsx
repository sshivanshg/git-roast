"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { tierForScore } from "@/lib/score";

const BLUE = "56, 189, 248";

type Stats = { roasts: number; uniqueDevs: number; visitors: number };
type Data = { entries: LeaderboardEntry[]; total: number; stats?: Stats; live: boolean };

// Top-3 medal, otherwise a muted rank number.
function RankBadge({ rank }: { rank: number }) {
  const medal: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
  if (rank <= 3) {
    return (
      <span className="w-5 text-center text-[13px] flex-shrink-0 leading-none">
        {medal[rank]}
      </span>
    );
  }
  return (
    <span className="font-mono text-[11px] text-neutral-700 w-5 text-center flex-shrink-0">
      {rank}
    </span>
  );
}

interface Props {
  onSelect: (username: string) => void;
  currentUsername?: string;
  /** bump this after a roast completes to force an immediate refetch */
  refreshKey?: number;
}

const POLL_MS = 12_000;

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
      <div className="w-full max-w-2xl mt-16 flex justify-center">
        <div className="flex items-center gap-2 text-neutral-700 font-mono text-xs">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-neutral-700"
          />
          loading rankings
        </div>
      </div>
    );
  }

  // Empty state — no real roasts yet
  if (data.entries.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mt-16"
      >
        <div className="flex items-center gap-2.5 mb-5">
          <Trophy size={13} strokeWidth={1.5} style={{ color: `rgb(${BLUE})` }} />
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-neutral-400">
            chaos rankings
          </span>
        </div>
        <div
          className="rounded-2xl px-6 py-10 flex flex-col items-center gap-3 text-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
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
      className="w-full max-w-2xl mt-16"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Trophy size={13} strokeWidth={1.5} style={{ color: `rgb(${BLUE})` }} />
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-neutral-400">
            chaos rankings
          </span>
          {data.live && (
            <span className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: `rgb(${BLUE})`,
                  boxShadow: `0 0 6px rgba(${BLUE},0.8)`,
                  animation: "lb-pulse 2s ease-in-out infinite"
                }}
              />
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">
                live
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-neutral-600">
          <Users size={11} strokeWidth={1.5} />
          <span className="font-mono text-[10px]">
            {entries.length.toLocaleString("en-US")} ranked
          </span>
        </div>
      </div>

      {/* Rank list — scrolls inside the box, no "show more" */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)"
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
          <span className="w-9 text-center">rank</span>
          <span className="w-16 text-right hidden sm:block">commits</span>
          <span className="w-12 text-right">score</span>
        </div>

        {/* Scroll viewport */}
        <div className="lb-scroll overflow-y-auto" style={{ maxHeight: "21rem" }}>
          {entries.map((entry, i) => {
            const rank = i + 1;
            const isCurrent =
              currentUsername &&
              entry.username.toLowerCase() === currentUsername.toLowerCase();
            const tier = tierForScore(entry.score);
            const tc = tier.color;
            return (
              <motion.button
                key={entry.username}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.035, duration: 0.3, ease: "easeOut" }}
                onClick={() => onSelect(entry.username)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150"
                style={{
                  borderBottom: i < entries.length - 1 ? "1px solid rgba(255,255,255,0.035)" : "none",
                  background: isCurrent ? `rgba(${BLUE},0.06)` : "transparent"
                }}
                onMouseEnter={e => {
                  if (!isCurrent)
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.035)";
                }}
                onMouseLeave={e => {
                  if (!isCurrent)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {/* Rank */}
                <RankBadge rank={rank} />

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {entry.avatar ? (
                    <img
                      src={entry.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full"
                      style={{ filter: "saturate(0.4) brightness(0.8)" }}
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-neutral-800" />
                  )}
                  {isCurrent && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: `0 0 0 1.5px rgba(${BLUE},0.5)` }}
                    />
                  )}
                </div>

                {/* Name + tier name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-mono text-[12px] font-medium truncate"
                      style={isCurrent ? { color: `rgb(${BLUE})` } : { color: "rgb(212,212,212)" }}
                    >
                      @{entry.username}
                    </span>
                    {isCurrent && (
                      <span
                        className="font-mono text-[8px] uppercase tracking-widest flex-shrink-0"
                        style={{ color: `rgba(${BLUE},0.6)` }}
                      >
                        you
                      </span>
                    )}
                  </div>
                  <div
                    className="font-mono text-[8.5px] uppercase tracking-wider truncate mt-px"
                    style={{ color: `rgba(${tc},0.65)` }}
                  >
                    {tier.name}
                  </div>
                </div>

                {/* Grade chip */}
                <span
                  className="font-mono text-[10px] font-extrabold rounded-md px-1.5 py-0.5 w-9 text-center flex-shrink-0 leading-none"
                  style={{
                    color: `rgb(${tc})`,
                    background: `rgba(${tc},0.12)`,
                    border: `1px solid rgba(${tc},0.3)`
                  }}
                >
                  {tier.grade}
                </span>

                {/* Commit count */}
                <span className="font-mono text-[10px] text-neutral-700 w-16 text-right hidden sm:block flex-shrink-0">
                  {entry.totalCommits > 0 ? entry.totalCommits.toLocaleString("en-US") : "—"}
                </span>

                {/* Score */}
                <span
                  className="font-mono text-[13px] font-bold tabular-nums w-12 text-right flex-shrink-0"
                  style={{ color: `rgb(${tc})` }}
                >
                  {entry.score}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Fade hint at the bottom when there's more to scroll */}
        {entries.length > 6 && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-2xl"
            style={{ background: "linear-gradient(to top, rgba(10,10,10,0.9), transparent)" }}
          />
        )}
      </div>

      {!data.live && (
        <p className="mt-3 text-center font-mono text-[9px] text-neutral-800 tracking-wide">
          connect vercel kv to show real-time rankings
        </p>
      )}

      <style>{`
        @keyframes lb-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .lb-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.15) transparent;
        }
        .lb-scroll::-webkit-scrollbar { width: 6px; }
        .lb-scroll::-webkit-scrollbar-track { background: transparent; }
        .lb-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
        }
        .lb-scroll::-webkit-scrollbar-thumb:hover { background: rgba(${BLUE},0.45); }
      `}</style>
    </motion.section>
  );
}
