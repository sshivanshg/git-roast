import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "480px"
      },
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace"
        ],
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Space Grotesk"', "-apple-system", "BlinkMacSystemFont", "sans-serif"]
      },
      colors: {
        ink: "#050507",
        panel: "#0b0b0f",
        line: "#1c1c22",
        accent: {
          // Neon cyan — primary
          glow: "#00F0FF",
          // Magenta — contrast / danger
          magenta: "#FF2BD6",
          purple: "#A855F7",
          dark: "#0b0b0f"
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 240, 255, 0.35), 0 0 40px rgba(0, 240, 255, 0.12)",
        "glow-lg": "0 0 45px rgba(0, 240, 255, 0.45), 0 0 90px rgba(0, 240, 255, 0.2)",
        "glow-magenta": "0 0 22px rgba(255, 43, 214, 0.4), 0 0 44px rgba(255, 43, 214, 0.15)",
        glass: "inset 0 1px 2px rgba(255, 255, 255, 0.06)",
        "glass-lg":
          "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 28px rgba(255,255,255,0.02), 0 30px 80px rgba(0,0,0,0.7)"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
      },
      keyframes: {
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        rise: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,240,255,0.3), 0 0 40px rgba(0,240,255,0.1)" },
          "50%": { boxShadow: "0 0 34px rgba(0,240,255,0.55), 0 0 68px rgba(0,240,255,0.22)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        },
        "grid-pan": {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "44px 44px" }
        },
        aurora: {
          "0%, 100%": { transform: "translate(0,0) scale(1)", opacity: "0.5" },
          "50%": { transform: "translate(4%, -3%) scale(1.12)", opacity: "0.8" }
        }
      },
      animation: {
        blink: "blink 1.05s step-end infinite",
        rise: "rise 0.45s ease-out both",
        "glow-pulse": "glow-pulse 2.4s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        marquee: "marquee var(--marquee-duration, 32s) linear infinite",
        "grid-pan": "grid-pan 16s linear infinite",
        aurora: "aurora 14s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
