import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        thmanyah: ["Thmanyah", "sans-serif"],
      },
      fontSize: {
        "xs": ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
        "sm": ["0.875rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "base": ["1rem", { lineHeight: "1.75rem", fontWeight: "400" }],
        "lg": ["1.125rem", { lineHeight: "2rem", fontWeight: "500" }],
        "xl": ["1.25rem", { lineHeight: "2rem", fontWeight: "500" }],
        "2xl": ["1.5rem", { lineHeight: "2.25rem", fontWeight: "700" }],
        "3xl": ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
      colors: {
        athar: {
          primary: "#2D6A4F",
          secondary: "#40916C",
          accent: "#D4A373",
          bg: "#F5F5F0",
          card: "#FFFFFF",
          text: "#1B4332",
          muted: "#74C69D",
        },
      },
    },
  },
  plugins: [],
};
export default config;
