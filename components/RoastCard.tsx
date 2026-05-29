"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { Roast } from "@/lib/roast";

const BLUE = "56, 189, 248";

export const RoastCard = forwardRef<HTMLDivElement, { roast: Roast }>(
  function RoastCard({ roast }, ref) {
    return (
      <div
        ref={ref}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.07),
            0 0 0 1px rgba(${BLUE},0.08),
            0 20px 60px rgba(0,0,0,0.6),
            0 0 80px rgba(${BLUE},0.05)
          `
        }}
      >
        {/* ── Terminal window chrome ── */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-[7px]">
            <div className="w-[11px] h-[11px] rounded-full bg-red-500/50" />
            <div className="w-[11px] h-[11px] rounded-full bg-yellow-400/50" />
            <div className="w-[11px] h-[11px] rounded-full bg-emerald-500/40" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-600 tracking-wide">
            <span>git-wrapped</span>
            <span className="text-neutral-700">~</span>
            <span>roast.sh</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="text-neutral-600"
            >
              ▋
            </motion.span>
          </div>
          <div className="w-16" />
        </div>

        {/* ── Card body ── */}
        <div className="p-6 sm:p-7">

          {/* User + Chaos Score row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {roast.avatar && (
                <div className="relative flex-shrink-0">
                  <img
                    src={roast.avatar}
                    alt=""
                    crossOrigin="anonymous"
                    className="h-14 w-14 rounded-full"
                    style={{ filter: "saturate(0.55) brightness(0.85)" }}
                  />
                  {/* avatar glow ring */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: `0 0 0 1.5px rgba(${BLUE},0.2), 0 0 14px rgba(${BLUE},0.12)`
                    }}
                  />
                </div>
              )}
              <div className="min-w-0">
                <div className="font-mono text-[15px] font-semibold text-neutral-100 truncate">
                  @{roast.username}
                </div>
                <div
                  className="mt-0.5 font-mono text-[11px] truncate leading-snug"
                  style={{ color: `rgba(${BLUE},0.7)` }}
                >
                  {roast.title}
                </div>
              </div>
            </div>

            {/* Chaos score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 220, damping: 18 }}
              className="flex-shrink-0 text-right"
            >
              <div
                className="font-mono font-bold leading-none"
                style={{
                  fontSize: "3rem",
                  color: `rgb(${BLUE})`,
                  textShadow: `0 0 24px rgba(${BLUE},0.55), 0 0 48px rgba(${BLUE},0.2)`
                }}
              >
                {roast.score}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-neutral-600">
                chaos index
              </div>
            </motion.div>
          </div>

          {/* Animated score bar */}
          <div
            className="mt-5 h-[3px] w-full rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${roast.score}%` }}
              transition={{ delay: 0.35, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, rgba(${BLUE},0.45) 0%, rgb(${BLUE}) 100%)`,
                boxShadow: `0 0 10px rgba(${BLUE},0.7)`
              }}
            />
          </div>

          {/* Roast lines — staggered reveal */}
          <ul className="mt-6 flex flex-col gap-[14px]">
            {roast.lines.map((l, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.38, ease: "easeOut" }}
                className="flex items-start gap-3"
              >
                <span className="flex-shrink-0 text-[15px] leading-snug mt-px">
                  {l.emoji}
                </span>
                <span className="text-[13.5px] leading-relaxed text-neutral-300 font-sans">
                  {l.text}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Footer stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + roast.lines.length * 0.1 + 0.2, duration: 0.5 }}
            className="mt-7 flex items-center justify-between pt-5 font-mono text-[11px] text-neutral-700"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span
              className="tracking-widest"
              style={{ color: `rgba(${BLUE},0.35)` }}
            >
              git wrapped
            </span>
            <span className="text-right">
              {roast.totalCommits.toLocaleString("en-US")} commits
              {" · "}
              {roast.publicRepos} repos
              {roast.topLanguage ? ` · ${roast.topLanguage}` : ""}
            </span>
          </motion.div>
        </div>

        {/* Subtle scanline texture */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)"
          }}
        />
      </div>
    );
  }
);
