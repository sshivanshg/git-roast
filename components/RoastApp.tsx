"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import { RoastCard } from "@/components/RoastCard";
import { HeroSection } from "@/components/HeroSection";
import { GlassInput } from "@/components/GlassInput";
import { BackgroundAtmosphere } from "@/components/BackgroundAtmosphere";
import { HallOfShame, type HallEntry } from "@/components/HallOfShame";
import { Leaderboard } from "@/components/Leaderboard";
import { LiveCount } from "@/components/LiveCount";
import { Download, Share2, Copy, Check } from "lucide-react";
import type { Roast } from "@/lib/roast";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; roast: Roast };

const PLACEHOLDERS = ["torvalds", "sindresorhus", "gaearon", "yyx990803", "tj"];
const HALL_KEY = "git-wrapped-hall";
const HALL_MAX = 6;
const BLUE = "56, 189, 248";

function loadHall(): HallEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HALL_KEY) || "[]");
  } catch {
    return [];
  }
}

function pushToHall(roast: Roast): HallEntry[] {
  const prev = loadHall().filter(e => e.username !== roast.username);
  const next: HallEntry[] = [
    { username: roast.username, avatar: roast.avatar, score: roast.score, title: roast.title },
    ...prev
  ].slice(0, HALL_MAX);
  localStorage.setItem(HALL_KEY, JSON.stringify(next));
  return next;
}

export default function RoastApp() {
  const [username, setUsername] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const [hall, setHall] = useState<HallEntry[]>([]);
  const [statsKey, setStatsKey] = useState(0); // bump → live counters refetch
  const cardRef = useRef<HTMLDivElement>(null);
  const placeholder = PLACEHOLDERS[username.length % PLACEHOLDERS.length];

  // Load hall from localStorage once on mount
  useEffect(() => {
    setHall(loadHall());
  }, []);

  // Count this visit once per session, then refresh the live counter
  useEffect(() => {
    if (sessionStorage.getItem("gw-visited")) return;
    sessionStorage.setItem("gw-visited", "1");
    fetch("/api/visit", { method: "POST", cache: "no-store" })
      .then(() => setStatsKey(k => k + 1))
      .catch(() => {});
  }, []);

  const run = useCallback(async (name: string) => {
    const clean = name.trim().replace(/^@/, "");
    if (!clean) return;
    setState({ status: "loading" });
    setCopied(false);
    window.history.replaceState(null, "", `/?u=${encodeURIComponent(clean)}`);
    try {
      const res = await fetch(`/api/roast?u=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) {
        setState({ status: "error", message: data.error || "Something broke." });
        return;
      }
      const roast = data as Roast;
      setState({ status: "done", roast });
      setHall(pushToHall(roast));
      setStatsKey(k => k + 1); // a new roast landed → refresh live counts + ranking
    } catch {
      setState({ status: "error", message: "Network error. Try again." });
    }
  }, []);

  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get("u");
    if (u) {
      setUsername(u);
      run(u);
    }
  }, [run]);

  const download = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0a0a0a"
      });
      const a = document.createElement("a");
      const name = state.status === "done" ? state.roast.username : "git-wrapped";
      a.download = `git-wrapped-${name}.png`;
      a.href = dataUrl;
      a.click();
    } catch { /* ignore */ }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const tweet = () => {
    if (state.status !== "done") return;
    const r = state.roast;
    const text = `I'm "${r.title}" with a chaos score of ${r.score}/100 😅\n\nGet roasted by your own GitHub commits:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  // Hall entries: exclude the currently displayed user to avoid duplication
  const hallEntries =
    state.status === "done"
      ? hall.filter(e => e.username !== state.roast.username)
      : hall;

  return (
    <>
      <BackgroundAtmosphere />

      <main className="relative z-20 mx-auto flex min-h-screen max-w-5xl flex-col items-center px-4 sm:px-5 py-10 sm:py-20 lg:py-28 pb-16">

        <HeroSection />

        {/* Live activity counter */}
        <div className="mb-7 sm:mb-9 flex justify-center">
          <LiveCount refreshKey={statsKey} />
        </div>

        <GlassInput
          placeholder={placeholder}
          value={username}
          onChange={setUsername}
          onSubmit={() => run(username)}
          isLoading={state.status === "loading"}
        />

        {/* ── Result area ── */}
        <div className="mt-10 sm:mt-14 w-full flex flex-col items-center">

          {state.status === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className="w-8 h-8 rounded-full border-2"
                style={{
                  borderColor: `rgba(${BLUE},0.15)`,
                  borderTopColor: `rgb(${BLUE})`,
                  animation: "spin 1s linear infinite"
                }}
              />
              <p className="text-sm text-neutral-500 font-mono">
                analyzing commit history
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                >_</motion.span>
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </motion.div>
          )}

          {state.status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-sm text-red-400/80 px-6 py-4 rounded-xl"
              style={{
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.15)"
              }}
            >
              {state.message}
            </motion.div>
          )}

          {state.status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="w-full flex flex-col items-center gap-6 sm:gap-8"
            >
              {/* Roast card */}
              <div className="w-full flex justify-center">
                <RoastCard ref={cardRef} roast={state.roast} />
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {[
                  { icon: Share2,  label: "share on X",   onClick: tweet,     active: false },
                  { icon: Download, label: "download png", onClick: download,  active: false },
                  { icon: copied ? Check : Copy, label: copied ? "copied!" : "copy link", onClick: copyLink, active: copied }
                ].map((btn, i) => (
                  <motion.button
                    key={i}
                    onClick={btn.onClick}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200"
                    style={
                      btn.active
                        ? {
                            background: `rgba(${BLUE},0.1)`,
                            border: `1px solid rgba(${BLUE},0.4)`,
                            color: `rgb(${BLUE})`
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgb(163,163,163)"
                          }
                    }
                    onMouseEnter={e => {
                      if (!btn.active) {
                        (e.currentTarget as HTMLElement).style.borderColor = `rgba(${BLUE},0.3)`;
                        (e.currentTarget as HTMLElement).style.color = `rgb(${BLUE})`;
                        (e.currentTarget as HTMLElement).style.background = `rgba(${BLUE},0.06)`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!btn.active) {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLElement).style.color = "rgb(163,163,163)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      }
                    }}
                  >
                    <btn.icon size={14} strokeWidth={1.5} />
                    <span className="text-xs sm:text-sm">{btn.label}</span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Metadata line */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-mono text-xs text-neutral-700 text-center"
              >
                based on {state.roast.sampleSize} recent commits · affectionate, not accurate
              </motion.p>
            </motion.div>
          )}
        </div>

        {/* ── Global leaderboard ── always visible except while loading */}
        {state.status !== "loading" && (
          <Leaderboard
            onSelect={name => { setUsername(name); run(name); }}
            currentUsername={state.status === "done" ? state.roast.username : undefined}
            refreshKey={statsKey}
          />
        )}

        {/* ── Hall of Shame (local recent history) ── */}
        {state.status !== "loading" && hallEntries.length > 0 && (
          <HallOfShame
            entries={hallEntries}
            onSelect={name => {
              setUsername(name);
              run(name);
            }}
          />
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-auto pt-16"
        >
          <a
            href="https://www.linkedin.com/in/connect-shivansh/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-neutral-700 transition-colors duration-200"
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = `rgb(${BLUE})`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "rgb(64,64,64)";
            }}
          >
            connect
          </a>
        </motion.footer>
      </main>
    </>
  );
}
