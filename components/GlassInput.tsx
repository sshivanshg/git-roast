"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface GlassInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function GlassInput({
  placeholder,
  value,
  onChange,
  onSubmit,
  isLoading
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) onSubmit();
  };

  const showCursor = !value && !isFocused;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* Outer glow halo */}
      <div
        className="absolute -inset-px rounded-2xl blur-md transition-opacity duration-300"
        style={{
          opacity: isFocused ? 0.9 : 0.35,
          background:
            "linear-gradient(90deg, rgba(0,240,255,0.5), rgba(168,85,247,0.4), rgba(0,240,255,0.5))"
        }}
      />

      {/* Terminal command line */}
      <div
        className="relative rounded-2xl transition-all duration-300"
        style={{
          background: "rgba(8,8,12,0.92)",
          border: `1px solid ${isFocused ? "rgba(0,240,255,0.8)" : "rgba(0,240,255,0.32)"}`,
          boxShadow: isFocused
            ? "0 0 0 1px rgba(0,240,255,0.4), 0 0 38px rgba(0,240,255,0.28), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 0 22px rgba(0,240,255,0.1), inset 0 1px 0 rgba(255,255,255,0.04)"
        }}
      >
        {/* window chrome dots */}
        <div className="flex items-center gap-1.5 px-4 pt-3">
          <span className="h-2 w-2 rounded-full bg-red-500/60" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/50" />
          <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-600">
            roast.sh — zsh
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 pb-4 pt-2.5">
          {/* prompt */}
          <span className="select-none font-mono text-base sm:text-lg font-bold text-accent-glow">
            $
          </span>

          {/* input + fake cursor when empty/unfocused */}
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={showCursor ? "" : placeholder}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              disabled={isLoading}
              className="w-full bg-transparent font-mono text-base sm:text-lg text-white outline-none placeholder:text-neutral-600 disabled:opacity-50"
            />
            {showCursor && (
              <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 flex items-center font-mono text-base sm:text-lg text-neutral-600">
                {placeholder}
                <span className="ml-0.5 inline-block h-[1.1em] w-[2px] bg-accent-glow align-middle animate-blink shadow-[0_0_8px_rgba(0,240,255,0.9)]" />
              </span>
            )}
          </div>

          {/* roast button */}
          <motion.button
            onClick={onSubmit}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className="relative flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3.5 sm:px-5 py-2 font-mono text-sm font-bold uppercase tracking-wide transition-shadow duration-200"
            style={
              isLoading
                ? { background: "#1a1a1f", color: "#666" }
                : {
                    background: "#00F0FF",
                    color: "#000",
                    boxShadow: "0 0 22px rgba(0,240,255,0.5)"
                  }
            }
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="inline-block h-1 w-1 animate-blink rounded-full bg-neutral-500" />
                <span className="hidden sm:inline">compiling…</span>
                <span className="sm:hidden">…</span>
              </span>
            ) : (
              <>
                roast
                <ArrowRight size={15} strokeWidth={2.6} />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-3.5 text-center font-mono text-[11px] text-neutral-600"
      >
        try <span className="text-neutral-400">torvalds</span> ·{" "}
        <span className="text-neutral-400">sindresorhus</span> · or your own
      </motion.p>
    </motion.div>
  );
}
