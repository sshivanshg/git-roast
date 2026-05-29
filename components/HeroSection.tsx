"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-7 sm:mb-10"
    >
      {/* eyebrow pill */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
        style={{
          background: "rgba(0,240,255,0.06)",
          border: "1px solid rgba(0,240,255,0.22)",
          boxShadow: "0 0 22px rgba(0,240,255,0.12)"
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent-glow animate-glow-pulse" />
        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-accent-glow/90">
          your commits are about to suffer
        </span>
      </motion.div>

      {/* Massive title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
        className="font-display font-bold tracking-tighter leading-[0.9] text-[3.4rem] sm:text-8xl lg:text-9xl"
      >
        <span className="text-white drop-shadow-[0_2px_24px_rgba(255,255,255,0.18)]">
          git
        </span>{" "}
        <span className="text-glow-cyan">wrapped</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mx-auto mt-5 max-w-xl px-2 font-sans text-sm sm:text-lg leading-relaxed text-neutral-400"
      >
        Drop a GitHub username. Get{" "}
        <span className="font-semibold text-accent-glow">roasted</span> by your own
        commit history, ranked, and immortalised on the leaderboard.
      </motion.p>

      {/* Decorative neon line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mx-auto mt-7 h-px w-16"
        style={{
          background: "linear-gradient(to right, transparent, #00F0FF, transparent)",
          boxShadow: "0 0 12px rgba(0,240,255,0.8)"
        }}
      />
    </motion.header>
  );
}
