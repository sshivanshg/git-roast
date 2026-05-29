"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import { RoastCard } from "@/components/RoastCard";
import { HeroSection } from "@/components/HeroSection";
import { GlassInput } from "@/components/GlassInput";
import { BackgroundAtmosphere } from "@/components/BackgroundAtmosphere";
import { RecentVictimsTicker } from "@/components/RecentVictimsTicker";
import { Download, Share2, Copy, Check } from "lucide-react";
import type { Roast } from "@/lib/roast";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; roast: Roast };

const PLACEHOLDERS = ["torvalds", "sindresorhus", "gaearon", "yyx990803", "tj"];

export default function RoastApp() {
  const [username, setUsername] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const placeholder = PLACEHOLDERS[username.length % PLACEHOLDERS.length];

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
      setState({ status: "done", roast: data as Roast });
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
        backgroundColor: "#0a0a0b"
      });
      const a = document.createElement("a");
      const name = state.status === "done" ? state.roast.username : "git-wrapped";
      a.download = `git-wrapped-${name}.png`;
      a.href = dataUrl;
      a.click();
    } catch {
      /* ignore */
    }
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
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <>
      <BackgroundAtmosphere />

      <main className="relative z-20 mx-auto flex min-h-screen max-w-5xl flex-col items-center px-5 py-16 sm:py-24 lg:py-32 pb-24">
        {/* Hero Section */}
        <HeroSection />

        {/* Input Section */}
        <GlassInput
          placeholder={placeholder}
          value={username}
          onChange={setUsername}
          onSubmit={() => run(username)}
          isLoading={state.status === "loading"}
        />

        {/* Result Area */}
        <div className="mt-16 w-full flex flex-col items-center">
          {state.status === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-accent-glow border-transparent border-t-accent-glow rounded-full"
              />
              <p className="text-sm text-neutral-400 font-mono">
                analyzing commit history<span className="animate-blink">_</span>
              </p>
            </motion.div>
          )}

          {state.status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400/80 font-mono bg-red-500/5 px-6 py-4 rounded-lg border border-red-500/20"
            >
              {state.message}
            </motion.div>
          )}

          {state.status === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center gap-8"
            >
              {/* Roast Card */}
              <div className="w-full flex justify-center">
                <RoastCard ref={cardRef} roast={state.roast} />
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                {[
                  { icon: Share2, label: "share on X", onClick: tweet },
                  { icon: Download, label: "download png", onClick: download },
                  {
                    icon: copied ? Check : Copy,
                    label: copied ? "copied ✓" : "copy link",
                    onClick: copyLink
                  }
                ].map((btn, idx) => (
                  <motion.button
                    key={idx}
                    onClick={btn.onClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg
                      border font-mono text-sm
                      transition-all duration-200
                      ${
                        copied && btn.label.includes("copy")
                          ? "border-accent-glow/60 bg-accent-glow/10 text-accent-glow"
                          : "border-neutral-700/50 bg-white/5 text-neutral-400 hover:border-neutral-600/80 hover:bg-white/10"
                      }
                    `}
                  >
                    <btn.icon size={16} />
                    <span className="text-xs sm:text-sm">{btn.label}</span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Info Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-neutral-600 font-mono text-center"
              >
                based on {state.roast.sampleSize} recent commits · affectionate, not accurate
              </motion.p>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-auto pt-16"
        >
          <a
            href="https://www.linkedin.com/in/connect-shivansh/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-700 hover:text-accent-glow transition-colors duration-200 font-mono"
          >
            connect
          </a>
        </motion.footer>
      </main>

      {/* Ticker */}
      <RecentVictimsTicker />
    </>
  );
}
