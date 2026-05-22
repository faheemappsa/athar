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
