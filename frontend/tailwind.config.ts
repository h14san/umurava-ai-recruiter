import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "var(--background)",
          surface: "var(--surface)",
          panel: "var(--surface-muted)",
          border: "var(--border)",
          text: "var(--text-primary)",
          muted: "var(--text-secondary)",
        },
        ink: {
          bg: "#121212",
          surface: "#1E1E1E",
          border: "#2A2A2A",
          text: "#F1F1F1",
          muted: "#9CA3AF",
          panel: "#0F0F0F",
        },
        paper: {
          bg: "#F8F9FB",
          surface: "#FFFFFF",
          border: "#E5E7EB",
          text: "#111827",
          muted: "#6B7280",
          panel: "#F0F2F5",
        },
        accent: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          light: "#4F46E5",
          lightHover: "#4338CA",
          soft: "rgba(99,102,241,0.15)",
        },
        tier: {
          strong: "#10B981",
          strongLight: "#059669",
          partial: "#F59E0B",
          partialLight: "#D97706",
          weak: "#EF4444",
          weakLight: "#DC2626",
        },
        umurava: {
          green: "#1D9E75",
          dark: "#04342C",
        },
        // legacy "brand" alias so existing classes don't die
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#6366F1",
          700: "#4F46E5",
          900: "#312E81",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "DM Sans",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        panel: "0 4px 16px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(12px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "translate-card": {
          "0%": { transform: "translateY(4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "score-bar": {
          "0%": { width: "0%" },
          "100%": { width: "var(--score, 0%)" },
        },
        "pulse-ring": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(99,102,241,0.6)" },
          "50%": { boxShadow: "0 0 0 6px rgba(99,102,241,0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-in-right": "slide-in-right 200ms ease-out",
        "translate-card": "translate-card 200ms ease-out",
        "score-bar": "score-bar 600ms ease-out forwards",
        "pulse-ring": "pulse-ring 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
