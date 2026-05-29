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
    if (e.key === "Enter" && !isLoading) {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* Glow effect on focus */}
      {isFocused && (
        <motion.div
          layoutId="input-glow"
          className="absolute inset-0 rounded-2xl bg-accent-glow/5 blur-xl -z-10"
          animate={{
            boxShadow: [
              "0 0 20px rgba(0, 255, 136, 0.2), 0 0 40px rgba(0, 255, 136, 0.1)",
              "0 0 40px rgba(0, 255, 136, 0.3), 0 0 80px rgba(0, 255, 136, 0.15)",
              "0 0 20px rgba(0, 255, 136, 0.2), 0 0 40px rgba(0, 255, 136, 0.1)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Glass container */}
      <div
        className={`
          relative group
          rounded-2xl border
          bg-white/5 backdrop-blur-xl
          transition-all duration-300
          ${
            isFocused
              ? "border-accent-glow/60 shadow-glow-lg"
              : "border-neutral-700/30 shadow-glass-lg hover:border-neutral-600/50"
          }
        `}
      >
        {/* Inner shine */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative flex items-center gap-3 px-6 py-4 sm:py-5">
          {/* Terminal $ symbol */}
          <span className="text-neutral-600 font-mono text-lg select-none">
            $
          </span>

          {/* Input field */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            disabled={isLoading}
            className={`
              flex-1 bg-transparent
              font-mono text-lg outline-none
              placeholder:text-neutral-600
              text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
          />

          {/* Submit button */}
          <motion.button
            onClick={onSubmit}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className={`
              relative flex-shrink-0
              px-5 py-2 rounded-lg
              font-semibold font-mono text-sm
              transition-all duration-200
              flex items-center gap-2
              ${
                isLoading
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-accent-glow text-black hover:shadow-glow"
              }
            `}
          >
            {isLoading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <span className="inline-block w-1 h-1 bg-neutral-600 rounded-full animate-blink" />
                compiling...
              </motion.span>
            ) : (
              <>
                roast
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={16} />
                </motion.div>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Hint text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-4 text-center text-xs text-neutral-600"
      >
        try: torvalds, sindresorhus, or your own username
      </motion.p>
    </motion.div>
  );
}
