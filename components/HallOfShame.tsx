"use client";

import { motion } from "framer-motion";
import { Flame, Skull } from "lucide-react";
import { tierForScore } from "@/lib/score";

export type HallEntry = {
  username: string;
  avatar: string | null;
  score: number;
  title: string;
};

const RED = "248, 113, 113";
const ORANGE = "251, 146, 60";

interface Props {
  entries: HallEntry[];
  onSelect: (username: string) => void;
}

export function HallOfShame({ entries, onSelect }: Props) {
  if (entries.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="mb-4 mt-16 w-full max-w-2xl"
    >
      {/* Section label */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, rgba(${RED},0.4))` }} />
        <div className="flex items-center gap-1.5" style={{ color: `rgb(${RED})` }}>
          <Skull size={12} strokeWidth={1.5} />
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em]">
            hall of shame
          </span>
        </div>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, rgba(${RED},0.4))` }} />
      </div>

      {/* Wanted posters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {entries.map((entry, i) => {
          const tier = tierForScore(entry.score);
          return (
            <motion.button
              key={entry.username}
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: "easeOut" }}
              onClick={() => onSelect(entry.username)}
              className="glitch-card group relative flex cursor-pointer flex-col items-center gap-2 overflow-hidden rounded-lg p-4 pt-6 text-center transition-shadow duration-200"
              style={{
                background: "linear-gradient(160deg, rgba(30,12,12,0.6), rgba(8,8,10,0.85))",
                border: `1px solid rgba(${RED},0.32)`,
                boxShadow: `inset 0 0 24px rgba(${RED},0.06)`
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(${RED},0.7)`;
                (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 24px rgba(${RED},0.12), 0 0 26px rgba(${RED},0.25)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(${RED},0.32)`;
                (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 0 24px rgba(${RED},0.06)`;
              }}
            >
              {/* WANTED banner */}
              <span
                className="absolute left-0 right-0 top-0 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.3em]"
                style={{ background: `rgba(${RED},0.14)`, color: `rgb(${RED})`, borderBottom: `1px solid rgba(${RED},0.25)` }}
              >
                wanted
              </span>

              {/* corner ticks */}
              <span className="absolute left-1.5 top-5 h-2 w-2 border-l border-t" style={{ borderColor: `rgba(${ORANGE},0.6)` }} />
              <span className="absolute right-1.5 top-5 h-2 w-2 border-r border-t" style={{ borderColor: `rgba(${ORANGE},0.6)` }} />
              <span className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l" style={{ borderColor: `rgba(${ORANGE},0.6)` }} />
              <span className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r" style={{ borderColor: `rgba(${ORANGE},0.6)` }} />

              {/* Mugshot */}
              <div className="relative">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt=""
                    className="h-11 w-11 rounded-md"
                    style={{ filter: "grayscale(0.7) contrast(1.1) sepia(0.25) hue-rotate(-20deg) brightness(0.9)" }}
                  />
                ) : (
                  <div className="h-11 w-11 rounded-md bg-neutral-800" />
                )}
                <span
                  className="absolute -bottom-1.5 -right-1.5 rounded px-1 py-0.5 font-mono text-[8px] font-extrabold leading-none"
                  style={{ color: `rgb(${tier.color})`, background: "rgba(8,8,10,0.95)", border: `1px solid rgba(${tier.color},0.5)` }}
                >
                  {tier.grade}
                </span>
              </div>

              {/* Username */}
              <div className="w-full">
                <div className="glitch-text truncate font-mono text-[11px] text-neutral-300">
                  @{entry.username}
                </div>
                <div className="mt-0.5 truncate font-mono text-[8px] uppercase tracking-wider" style={{ color: `rgba(${ORANGE},0.7)` }}>
                  {tier.name}
                </div>
              </div>

              {/* Chaos score */}
              <div className="flex items-center gap-1 font-mono text-xs font-bold tabular-nums" style={{ color: `rgb(${RED})` }}>
                <Flame size={11} className="text-orange-400" />
                {entry.score}
                <span className="font-normal text-neutral-700">/100</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
