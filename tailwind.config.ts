import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace"
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif"
        ]
      },
      colors: {
        ink: "#0a0a0a",
        panel: "#0e0e0e",
        line: "#222222",
        accent: {
          // Electric blue — cyberpunk, high contrast, premium
          glow: "#38bdf8",
          purple: "#a855f7",
          dark: "#111111"
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(56, 189, 248, 0.3), 0 0 40px rgba(56, 189, 248, 0.1)",
        "glow-lg": "0 0 40px rgba(56, 189, 248, 0.4), 0 0 80px rgba(56, 189, 248, 0.2)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(168, 85, 247, 0.1)",
        glass: "inset 0 1px 2px rgba(255, 255, 255, 0.05)",
        "glass-lg": "inset 0 1px 3px rgba(255, 255, 255, 0.08), 0 0 30px rgba(0, 0, 0, 0.4)"
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(56, 189, 248, 0.3), 0 0 40px rgba(56, 189, 248, 0.1)" },
          "50%": { boxShadow: "0 0 30px rgba(56, 189, 248, 0.5), 0 0 60px rgba(56, 189, 248, 0.2)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        blink: "blink 1.1s step-end infinite",
        rise: "rise 0.45s ease-out both",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
