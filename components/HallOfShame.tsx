"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { tierForScore } from "@/lib/score";

export type HallEntry = {
  username: string;
  avatar: string | null;
  score: number;
  title: string;
};

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
      className="w-full max-w-2xl mt-16 mb-4"
    >
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="h-px flex-1"
          style={{
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.07))"
          }}
        />
        <div className="flex items-center gap-1.5 text-neutral-600">
          <Flame size={11} strokeWidth={1.5} />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
            hall of shame
          </span>
        </div>
        <div
          className="h-px flex-1"
          style={{
            background: "linear-gradient(to left, transparent, rgba(255,255,255,0.07))"
          }}
        />
      </div>

      {/* Grid of mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {entries.map((entry, i) => {
          const tier = tierForScore(entry.score);
          const tc = tier.color; // "r,g,b"
          return (
            <motion.button
              key={entry.username}
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: "easeOut" }}
              onClick={() => onSelect(entry.username)}
              className="group relative flex flex-col items-center gap-2.5 rounded-xl p-4 text-center
                         transition-all duration-200 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `rgba(${tc},0.05)`;
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(${tc},0.25)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              {/* Avatar + grade badge */}
              <div className="relative">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full transition-all duration-200"
                    style={{ filter: "saturate(0.4) brightness(0.8)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.filter = "saturate(0.7) brightness(0.95)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.filter = "saturate(0.4) brightness(0.8)";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-800" />
                )}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-200"
                  style={{ boxShadow: `0 0 0 1px rgba(${tc},0.25)` }}
                />
                {/* Grade sticker */}
                <span
                  className="absolute -top-1.5 -right-1.5 font-mono text-[8px] font-extrabold rounded-md px-1 py-0.5 leading-none"
                  style={{
                    color: `rgb(${tc})`,
                    background: "rgba(10,10,10,0.92)",
                    border: `1px solid rgba(${tc},0.45)`,
                    boxShadow: `0 0 8px rgba(${tc},0.25)`
                  }}
                >
                  {tier.grade}
                </span>
              </div>

              {/* Username + tier name */}
              <div className="w-full">
                <div className="font-mono text-[11px] text-neutral-400 truncate">
                  @{entry.username}
                </div>
                <div
                  className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wider truncate leading-snug"
                  style={{ color: `rgba(${tc},0.7)` }}
                >
                  {tier.name}
                </div>
              </div>

              {/* Score badge */}
              <div
                className="font-mono text-xs font-bold tabular-nums"
                style={{ color: `rgb(${tc})` }}
              >
                {entry.score}
                <span className="text-neutral-700 font-normal">/100</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
