"use client";

/**
 * Ambient backdrop: deep-black base, an animated panning neon grid, and two
 * slow-drifting radial "aurora" blobs (cyan + purple) anchored in opposite
 * corners to give the page atmospheric, floating-over-the-matrix depth.
 */
export function BackgroundAtmosphere() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* base void */}
      <div className="absolute inset-0 bg-black" />

      {/* animated neon grid */}
      <div className="absolute inset-0 neon-grid" />

      {/* aurora — cyan, top-left */}
      <div
        className="absolute -top-1/3 -left-1/4 h-[70vh] w-[70vh] rounded-full blur-[120px] animate-aurora"
        style={{ background: "radial-gradient(circle, rgba(0,240,255,0.16), transparent 65%)" }}
      />
      {/* aurora — magenta/purple, bottom-right */}
      <div
        className="absolute -bottom-1/3 -right-1/4 h-[75vh] w-[75vh] rounded-full blur-[130px] animate-aurora"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.16), transparent 65%)",
          animationDelay: "-7s"
        }}
      />
      {/* faint center cyan lift */}
      <div
        className="absolute left-1/2 top-[34%] h-[55vh] w-[80vw] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: "radial-gradient(ellipse, rgba(0,240,255,0.07), transparent 70%)" }}
      />

      {/* vignette so content pops off the matrix */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 30%, transparent 40%, rgba(0,0,0,0.55) 100%)"
        }}
      />
    </div>
  );
}
