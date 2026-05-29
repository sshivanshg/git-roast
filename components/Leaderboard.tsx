"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Users } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/leaderboard";

const BLUE   = "56, 189, 248";
const PURPLE = "168, 85, 247";

type Data = { entries: LeaderboardEntry[]; total: number; live: boolean };

// Score → accent color
function rowColor(score: number) {
  if (score >= 85) return `rgb(${PURPLE})`;
  if (score >= 60) return `rgb(${BLUE})`;
  return "rgb(148,163,184)";
}

// Top-3 rank badge
function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: "rgba(251,191,36,0.85)",  // gold
    2: "rgba(148,163,184,0.8)",  // silver
    3: "rgba(180,120,70,0.8)"    // bronze
  };
  if (rank <= 3) {
    return (
      <span
        className="font-mono text-[11px] font-bold w-5 text-center flex-shrink-0"
        style={{ color: colors[rank] }}
      >
        {rank === 1 ? "▲" : rank === 2 ? "▲" : "▲"}
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
}

export function Leaderboard({ onSelect, currentUsername }: Props) {
  const [data, setData] = useState<Data | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

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

  const PREVIEW_COUNT = 5;
  const visible = expanded ? data.entries : data.entries.slice(0, PREVIEW_COUNT);
  const hasMore = data.entries.length > PREVIEW_COUNT;

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
                  animation: "pulse 2s ease-in-out infinite"
                }}
              />
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-600">
                live
              </span>
            </span>
          )}
        </div>

        {data.total > 0 && (
          <div className="flex items-center gap-1.5 text-neutral-700">
            <Users size={11} strokeWidth={1.5} />
            <span className="font-mono text-[10px]">
              {data.total.toLocaleString("en-US")} roasted
            </span>
          </div>
        )}
      </div>

      {/* Rank list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        {/* Column headers */}
        <div
          className="flex items-center gap-3 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-700"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span className="w-5 text-center">#</span>
          <span className="w-7" />
          <span className="flex-1">developer</span>
          <span className="w-20 text-right hidden sm:block">commits</span>
          <span className="w-14 text-right">score</span>
        </div>

        {visible.map((entry, i) => {
          const rank = i + 1;
          const isCurrent = entry.username === currentUsername;
          return (
            <motion.button
              key={entry.username}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
              onClick={() => onSelect(entry.username)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 group"
              style={{
                borderBottom: i < visible.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                background: isCurrent ? `rgba(${BLUE},0.05)` : "transparent"
              }}
              onMouseEnter={e => {
                if (!isCurrent) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={e => {
                if (!isCurrent) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
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

              {/* Name + title */}
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
                <div className="font-mono text-[9px] text-neutral-600 truncate mt-px">
                  {entry.title}
                </div>
              </div>

              {/* Commit count */}
              <span className="font-mono text-[10px] text-neutral-700 w-20 text-right hidden sm:block flex-shrink-0">
                {entry.totalCommits > 0
                  ? entry.totalCommits.toLocaleString("en-US")
                  : "—"}
              </span>

              {/* Score + mini bar */}
              <div className="flex items-center gap-2 w-14 flex-shrink-0 justify-end">
                {/* Inline sparkbar */}
                <div
                  className="w-8 h-[3px] rounded-full overflow-hidden hidden xs:block"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${entry.score}%`,
                      background: rowColor(entry.score),
                      opacity: 0.7
                    }}
                  />
                </div>
                <span
                  className="font-mono text-[12px] font-bold tabular-nums"
                  style={{ color: rowColor(entry.score) }}
                >
                  {entry.score}
                </span>
              </div>
            </motion.button>
          );
        })}

        {/* Show more / less */}
        {hasMore && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full py-3 font-mono text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors flex items-center justify-center gap-1.5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <Zap size={9} strokeWidth={1.5} />
            {expanded
              ? "show less"
              : `show ${data.entries.length - PREVIEW_COUNT} more`}
          </button>
        )}
      </div>

      {!data.live && (
        <p className="mt-3 text-center font-mono text-[9px] text-neutral-800 tracking-wide">
          connect vercel kv to show real-time rankings
        </p>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </motion.section>
  );
}
