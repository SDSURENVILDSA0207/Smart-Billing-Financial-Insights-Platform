import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,css}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0c",
          2: "#0e0e11",
          3: "#131316",
          4: "#1a1a1f"
        },
        warm: {
          DEFAULT: "#e8e4dc",
          muted: "#9c9890",
          subtle: "#6b6760",
          faint: "#4a4845"
        },
        brass: {
          DEFAULT: "#b8923f",
          bright: "#d4b86a",
          muted: "#8a7539",
          dim: "#4a4020"
        },
        accent: "#b8923f"
      },
      fontFamily: {
        sans: ["var(--font-dm)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "ui-serif", "serif"]
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
        md: "6px"
      },
      boxShadow: {
        lift: "0 1px 0 0 rgba(232, 228, 220, 0.06) inset, 0 24px 48px -24px rgba(0, 0, 0, 0.65)"
      }
    }
  },
  plugins: []
};

export default config;
