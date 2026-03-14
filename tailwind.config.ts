import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        input: "var(--input)",
        ring: "var(--ring)",
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-soft)",
          dark: "var(--gold-deep)",
        },
        luxury: {
          dark: "var(--ink)",
          card: "var(--card)",
          elevated: "var(--elevated)",
          border: "var(--border)",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Playfair Display", "serif"],
        body: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },
      fontSize: {
        "display": ["clamp(2.5rem, 8vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(1.75rem, 4vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        "widest-tight": "-0.02em",
        "nav": "0.12em",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-in-up": "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        "float": "float 5s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      boxShadow: {
        "luxury": "0 24px 48px -12px rgba(0, 0, 0, 0.5)",
        "gold": "0 0 48px rgba(201, 162, 39, 0.25)",
        "card-hover": "0 32px 64px -16px rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        "800": "800ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
