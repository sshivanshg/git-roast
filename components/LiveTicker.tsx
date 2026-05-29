"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { tierForScore } from "@/lib/score";

const POLL_MS = 15_000;

interface Props {
  refreshKey?: number;
  onSelect: (username: string) => void;
}

export function LiveTicker({ refreshKey = 0, onSelect }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/leaderboard", { cache: "no-store" })
        .then(r => r.json())
        .then(d => { if (alive && Array.isArray(d?.entries)) setEntries(d.entries); })
        .catch(() => {});
    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [refreshKey]);

  if (entries.length === 0) return null;

  // Duplicate the list so the marquee can loop seamlessly at -50%.
  const loop = [...entries, ...entries];
  // Slower scroll for shorter lists so it never feels frantic.
  const duration = Math.max(22, Math.min(60, entries.length * 4));

  return (
    <div className="relative w-full max-w-3xl">
      {/* edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-black to-transparent" />

      <div
        className="marquee-mask overflow-hidden rounded-full py-2"
        style={{
          background: "rgba(10,10,14,0.6)",
          border: "1px solid rgba(255,255,255,0.07)"
        }}
      >
        <div
          className="marquee-track flex w-max items-center gap-2"
          style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
        >
          {loop.map((e, i) => {
            const tier = tierForScore(e.score);
            const tc = tier.color;
            return (
              <button
                key={`${e.username}-${i}`}
                onClick={() => onSelect(e.username)}
                className="group flex flex-shrink-0 items-center gap-2 rounded-full px-2.5 py-1 transition-colors hover:bg-white/5"
                title={`Roast @${e.username}`}
              >
                {e.avatar ? (
                  <img
                    src={e.avatar}
                    alt=""
                    className="h-5 w-5 rounded-full"
                    style={{ filter: "saturate(0.6) brightness(0.85)" }}
                  />
                ) : (
                  <span className="h-5 w-5 rounded-full bg-neutral-800" />
                )}
                <span className="font-mono text-[11px] text-neutral-400">
                  <span className="text-neutral-200 group-hover:text-accent-glow">
                    @{e.username}
                  </span>{" "}
                  scored
                </span>
                <span
                  className="font-mono text-[11px] font-bold tabular-nums"
                  style={{ color: `rgb(${tc})` }}
                >
                  {e.score}
                </span>
                <Flame size={11} className="text-orange-400/80" />
                <span className="mx-1 text-neutral-700">·</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
