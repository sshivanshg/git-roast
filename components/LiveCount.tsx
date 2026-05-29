"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Users, Eye } from "lucide-react";

const BLUE = "56, 189, 248";
const POLL_MS = 10_000;

type Stats = { roasts: number; uniqueDevs: number; visitors: number };

/** Smoothly counts from the previous value to the next when stats refresh. */
function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    let raf = 0;
    const tick = (t: number) => {
      if (!startRef.current) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        startRef.current = 0;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function Stat({
  icon: Icon,
  value,
  label
}: {
  icon: typeof Flame;
  value: number;
  label: string;
}) {
  const display = useCountUp(value);
  return (
    <div className="flex items-center gap-2">
      <Icon size={13} strokeWidth={1.5} style={{ color: `rgb(${BLUE})` }} />
      <span className="font-mono text-[13px] font-bold tabular-nums text-neutral-200">
        {display.toLocaleString("en-US")}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-600">
        {label}
      </span>
    </div>
  );
}

interface Props {
  /** bump after a roast to refresh immediately instead of waiting for the poll */
  refreshKey?: number;
}

export function LiveCount({ refreshKey = 0 }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/leaderboard", { cache: "no-store" })
        .then(r => r.json())
        .then(d => { if (alive && d?.stats) setStats(d.stats); })
        .catch(() => {});

    load();
    const id = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(id); };
  }, [refreshKey]);

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full px-5 py-2.5"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      {/* live dot */}
      <span className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: `rgb(${BLUE})`,
            boxShadow: `0 0 6px rgba(${BLUE},0.8)`,
            animation: "lc-pulse 2s ease-in-out infinite"
          }}
        />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
          live
        </span>
      </span>

      <Stat icon={Flame} value={stats.roasts} label="roasts" />
      <Stat icon={Users} value={stats.uniqueDevs} label="devs" />
      <Stat icon={Eye} value={stats.visitors} label="visits" />

      <style>{`
        @keyframes lc-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </motion.div>
  );
}
