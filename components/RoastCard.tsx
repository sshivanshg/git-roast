"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { Roast } from "@/lib/roast";

const CYAN = "0, 240, 255";

export const RoastCard = forwardRef<HTMLDivElement, { roast: Roast }>(
  function RoastCard({ roast }, ref) {
    const tc = roast.tier.color; // tier accent, "r,g,b"
    return (
      <div
        ref={ref}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl"
        style={{
          background:
            "linear-gradient(160deg, rgba(20,20,28,0.92) 0%, rgba(8,8,12,0.95) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: `
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 0 0 1px rgba(${tc},0.18),
            0 30px 80px rgba(0,0,0,0.75),
            0 0 90px rgba(${tc},0.12)
          `
        }}
      >
        {/* Tier accent bar — the "rarity stripe" */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, transparent, rgb(${tc}), transparent)`,
            boxShadow: `0 0 16px rgba(${tc},0.7)`
          }}
        />

        {/* Holographic sheen */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(120% 60% at 0% 0%, rgba(${tc},0.08), transparent 55%), radial-gradient(120% 60% at 100% 0%, rgba(${CYAN},0.06), transparent 55%)`
          }}
        />

        {/* Terminal window chrome */}
        <div
          className="relative flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-[6px]">
            <div className="h-[11px] w-[11px] rounded-full bg-red-500/55" />
            <div className="h-[11px] w-[11px] rounded-full bg-yellow-400/55" />
            <div className="h-[11px] w-[11px] rounded-full bg-emerald-500/45" />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-neutral-600">
            <span>git-wrapped</span>
            <span className="text-neutral-700">~</span>
            <span>roast.sh</span>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="text-accent-glow"
            >
              ▋
            </motion.span>
          </div>
          <div className="w-12" />
        </div>

        {/* Card body */}
        <div className="relative p-5 sm:p-7">
          {/* Header: avatar + name on left, grade+score on right */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {roast.avatar && (
                <div className="relative flex-shrink-0">
                  {/* glowing rank ring */}
                  <div
                    className="absolute -inset-1 rounded-full blur-[6px]"
                    style={{ background: `rgba(${tc},0.45)` }}
                  />
                  <img
                    src={roast.avatar}
                    alt=""
                    crossOrigin="anonymous"
                    className="relative h-12 w-12 rounded-full sm:h-16 sm:w-16"
                    style={{
                      filter: "saturate(0.7) brightness(0.9)",
                      boxShadow: `0 0 0 2px rgba(${tc},0.85), 0 0 20px rgba(${tc},0.5)`
                    }}
                  />
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-mono text-[14px] font-semibold text-neutral-100 sm:text-[16px]">
                  @{roast.username}
                </div>
                <div
                  className="mt-1 truncate font-sans text-[11px] font-medium sm:text-[12px]"
                  style={{ color: `rgba(${tc},0.85)` }}
                >
                  {roast.title}
                </div>
              </div>
            </div>

            {/* Grade + score */}
            <div className="flex flex-shrink-0 items-center gap-2.5">
              <div
                className="flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 leading-none"
                style={{
                  background: `rgba(${tc},0.1)`,
                  border: `1px solid rgba(${tc},0.45)`,
                  boxShadow: `0 0 18px rgba(${tc},0.2), inset 0 0 12px rgba(${tc},0.08)`
                }}
              >
                <span
                  className="font-mono font-extrabold tracking-tight"
                  style={{
                    fontSize: "clamp(1rem, 4.5vw, 1.5rem)",
                    color: `rgb(${tc})`,
                    textShadow: `0 0 16px rgba(${tc},0.6)`
                  }}
                >
                  {roast.tier.grade}
                </span>
                <span className="mt-1 font-mono text-[7px] uppercase tracking-[0.18em] text-neutral-500">
                  rank
                </span>
              </div>

              {/* Score with aura */}
              <div className="relative text-right">
                <div
                  className="pointer-events-none absolute inset-0 -z-0 blur-2xl"
                  style={{ background: `radial-gradient(circle, rgba(${tc},0.45), transparent 70%)` }}
                />
                <div
                  className="relative font-mono font-bold leading-none"
                  style={{
                    fontSize: "clamp(2.2rem, 9vw, 3.25rem)",
                    color: `rgb(${tc})`,
                    textShadow: `0 0 26px rgba(${tc},0.6), 0 0 52px rgba(${tc},0.25)`
                  }}
                >
                  {roast.score}
                </div>
                <div className="relative mt-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-neutral-600 sm:text-[9px]">
                  chaos
                </div>
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div
            className="mt-5 h-[3px] w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${roast.score}%` }}
              transition={{ delay: 0.35, duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, rgba(${tc},0.45), rgb(${tc}))`,
                boxShadow: `0 0 10px rgba(${tc},0.8)`
              }}
            />
          </div>

          {/* Tier name + rarity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-2.5 flex items-center justify-between gap-2"
          >
            <span
              className="truncate font-mono text-[11px] font-bold uppercase tracking-[0.08em] sm:text-[12px]"
              style={{ color: `rgb(${tc})` }}
            >
              {roast.tier.name}
            </span>
            <span className="flex-shrink-0 font-mono text-[9px] text-neutral-500 sm:text-[10px]">
              {roast.tier.rarity}
            </span>
          </motion.div>

          {/* Roast lines — each in its own bounding box with a neon icon chip */}
          <ul className="mt-5 flex flex-col gap-2.5">
            {roast.lines.map((l, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.09, duration: 0.38, ease: "easeOut" }}
                className="flex items-start gap-3 rounded-xl p-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)"
                }}
              >
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[15px]"
                  style={{
                    background: `rgba(${CYAN},0.08)`,
                    border: `1px solid rgba(${CYAN},0.18)`,
                    boxShadow: `0 0 10px rgba(${CYAN},0.1)`
                  }}
                >
                  {l.emoji}
                </span>
                <span className="font-sans text-[12.5px] leading-relaxed text-neutral-300 sm:text-[13.5px]">
                  {l.text}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Footer stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 + roast.lines.length * 0.09 + 0.2, duration: 0.5 }}
            className="mt-6 flex flex-col items-start justify-between gap-1 pt-4 font-mono text-[10px] text-neutral-700 xs:flex-row xs:items-center sm:text-[11px]"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="tracking-widest" style={{ color: `rgba(${CYAN},0.4)` }}>
              git wrapped
            </span>
            <span className="text-right text-neutral-600">
              {roast.totalCommits.toLocaleString("en-US")} commits · {roast.publicRepos} repos
              {roast.topLanguage ? ` · ${roast.topLanguage}` : ""}
            </span>
          </motion.div>
        </div>

        {/* Scanline texture */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)"
          }}
        />
      </div>
    );
  }
);
