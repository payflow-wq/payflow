import type { Config } from "tailwindcss";

// PayFlow design tokens.
// Palette rationale: deep emerald reads as "money / growth / trust" without
// leaning on a generic fintech blue-purple gradient. Ink is a warm near-black
// (not pure #000) for a slightly less clinical feel. Amber is reserved for
// reminders/warnings so it stays meaningful rather than decorative.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F6F7F5",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#12181B",
          muted: "#5B6764",
          faint: "#8A938F",
        },
        border: {
          DEFAULT: "#E3E7E4",
          strong: "#CBD2CD",
        },
        brand: {
          50: "#EAF5F0",
          100: "#CDE9DC",
          300: "#6FBB9A",
          500: "#0B6E4F",
          600: "#085A41",
          700: "#064533",
        },
        amber: {
          100: "#F6E9D6",
          500: "#B5792B",
          600: "#8F5E1F",
        },
        danger: {
          100: "#F6E1DF",
          500: "#B3261E",
          600: "#8C1D17",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(18 24 27 / 0.04), 0 1px 6px -2px rgb(18 24 27 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
