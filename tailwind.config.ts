import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10150f",
        "ink-soft": "#1b231a",
        paper: "#f6f3ea",
        "paper-dim": "#ede7d7",
        brand: {
          green: "#1e6b3c",
          "green-deep": "#0f3d22",
          "green-soft": "#e3ecdf",
          amber: "#c1602c",
          "amber-deep": "#9c4a20",
        },
        steel: "#5c665b",
        "steel-light": "#a9b3a4",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
