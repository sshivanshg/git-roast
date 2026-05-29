"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { RoastCard } from "@/components/RoastCard";
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
    // reflect in URL so the result is shareable + gets the OG image
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

  // auto-run if the page is opened with ?u=
  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get("u");
    if (u) {
      setUsername(u);
      run(u);
    }
  }, [run]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(username);
  };

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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center px-5 py-16 sm:py-24">
      {/* wordmark */}
      <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-[2.5rem]">
        git <span className="text-neutral-500">wrapped</span>
      </h1>
      <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-neutral-500">
        Paste a GitHub username. Get roasted by your own commit history.
        No login, no nonsense.
      </p>

      {/* input */}
      <form onSubmit={onSubmit} className="mt-8 w-full max-w-md">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 transition-colors focus-within:border-neutral-600">
          <span className="select-none text-neutral-600">$</span>
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-neutral-600"
          />
          <button
            type="submit"
            disabled={state.status === "loading"}
            className="rounded-lg bg-neutral-100 px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white active:scale-95 disabled:opacity-40"
          >
            {state.status === "loading" ? "…" : "roast"}
          </button>
        </div>
      </form>

      {/* result area */}
      <div className="mt-10 flex w-full flex-col items-center">
        {state.status === "loading" && (
          <p className="animate-pulse text-sm text-neutral-500">
            reading commits<span className="animate-blink">_</span>
          </p>
        )}

        {state.status === "error" && (
          <p className="text-sm text-neutral-400">{state.message}</p>
        )}

        {state.status === "done" && (
          <div className="flex w-full flex-col items-center gap-5 animate-rise">
            <RoastCard ref={cardRef} roast={state.roast} />

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={tweet}
                className="rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100"
              >
                share on X
              </button>
              <button
                onClick={download}
                className="rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100"
              >
                download png
              </button>
              <button
                onClick={copyLink}
                className="rounded-lg border border-line bg-panel px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100"
              >
                {copied ? "copied ✓" : "copy link"}
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              based on {state.roast.sampleSize} recent commits · affectionate, not accurate
            </p>
          </div>
        )}
      </div>

      <footer className="mt-auto pt-16 text-center text-xs text-neutral-700">
        public data only · built with Next.js on Vercel ·{" "}
        <a
          href="https://www.linkedin.com/in/connect-shivansh/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-600 hover:text-neutral-500 transition-colors"
        >
          connect
        </a>
      </footer>
    </main>
  );
}
