"use client";

import { motion } from "framer-motion";

const victims = [
  { username: "torvalds", crime: "pushing straight to main" },
  { username: "sindresorhus", crime: "1000+ open source projects" },
  { username: "gaearon", crime: "inventing hooks at 2am" },
  { username: "yyx990803", crime: "building Vue in isolation" },
  { username: "tj", crime: "creating 400 npm packages" },
  { username: "dhh", crime: "monolithic architecture takes" },
  { username: "jashkenas", crime: "coffeescript commits" },
  { username: "addyosmani", crime: "performance obsession" }
];

export function RecentVictimsTicker() {
  // Duplicate array for seamless loop
  const extendedVictims = [...victims, ...victims];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/40 to-transparent backdrop-blur-sm border-t border-neutral-800/30">
      <div className="overflow-hidden py-3">
        <motion.div
          className="flex gap-8 whitespace-nowrap px-4"
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {extendedVictims.map((victim, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 font-mono text-xs text-neutral-500 hover:text-accent-glow transition-colors cursor-pointer"
            >
              <span className="text-neutral-700">$</span>{" "}
              <span className="text-accent-glow">@{victim.username}</span> was
              roasted for <span className="italic text-neutral-600">{victim.crime}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
