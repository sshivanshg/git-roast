"use client";

import { forwardRef } from "react";
import type { Roast } from "@/lib/roast";

export const RoastCard = forwardRef<HTMLDivElement, { roast: Roast }>(
  function RoastCard({ roast }, ref) {
    return (
      <div
        ref={ref}
        className="w-full max-w-xl rounded-2xl border border-line bg-panel p-7"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {roast.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={roast.avatar}
                alt=""
                crossOrigin="anonymous"
                className="h-12 w-12 rounded-full border border-line grayscale"
              />
            ) : null}
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-neutral-100">
                @{roast.username}
              </div>
              <div className="truncate text-sm text-neutral-500">{roast.title}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold leading-none text-neutral-100">
              {roast.score}
              <span className="text-base text-neutral-600">/100</span>
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600">
              chaos
            </div>
          </div>
        </div>

        {/* monochrome score meter */}
        <div className="mt-4 h-px w-full bg-line">
          <div
            className="h-px bg-neutral-300"
            style={{ width: `${roast.score}%` }}
          />
        </div>

        {/* roast lines */}
        <ul className="mt-6 flex flex-col gap-3.5">
          {roast.lines.map((l, i) => (
            <li key={i} className="flex items-start gap-3 text-[14.5px] leading-snug">
              <span className="shrink-0 opacity-80">{l.emoji}</span>
              <span className="text-neutral-300">{l.text}</span>
            </li>
          ))}
        </ul>

        {/* footer */}
        <div className="mt-7 flex items-center justify-between border-t border-line pt-4 text-[11px] text-neutral-600">
          <span className="tracking-wide">git wrapped</span>
          <span>
            {roast.totalCommits.toLocaleString("en-US")} commits · {roast.publicRepos} repos
          </span>
        </div>
      </div>
    );
  }
);
