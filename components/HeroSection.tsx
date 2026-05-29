"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-12 sm:mb-16"
    >
      {/* Main title with accent */}
      <motion.h1
        className="text-5xl sm:text-7xl lg:text-8xl font-mono font-bold tracking-tighter mb-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
      >
        <span className="text-white">git</span>{" "}
        <motion.span
          className="relative inline-block"
          animate={{
            textShadow: [
              "0 0 20px rgba(0, 255, 136, 0.3)",
              "0 0 40px rgba(0, 255, 136, 0.5)",
              "0 0 20px rgba(0, 255, 136, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-accent-glow">wrapped</span>
        </motion.span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed"
      >
        Paste a GitHub username. Get <span className="text-accent-glow font-semibold">roasted</span> by your
        own commit history. No login, no nonsense.
      </motion.p>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="w-12 h-px bg-gradient-to-r from-transparent via-accent-glow to-transparent mx-auto mt-8"
      />
    </motion.header>
  );
}
