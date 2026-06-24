import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
        // Editorial palette (landing page)
        paper: "#FAF7F2",
        ivory: "#F5F0E8",
        cream: "#EDE7D9",
        charcoal: "#1A1814",
        ink: "#2D2A26",
        muted: "#6B6560",
        "line-color": "rgba(26,24,20,0.12)",
        "accent-blue": "#0047FF",
        // School admin portal palette
        sp: {
          primary:  "#570000",  // deep crimson
          surface:  "#FFF8F6",  // warm off-white background
          card:     "#F0D5CE",  // rose blush border / card
          mid:      "#9B6060",  // muted rose secondary text
          light:    "#C4A89E",  // lightest muted rose
          accent:   "#FED65B",  // warm yellow CTA
          dark:     "#3D0000",  // near-black crimson headings
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "scroll-line": "scrollLine 2s ease-in-out infinite",
        pulse: "pulse 2s infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        scrollLine: {
          "0%, 100%": { transform: "scaleY(1)", opacity: "1" },
          "50%": { transform: "scaleY(0.5)", opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
