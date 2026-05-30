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
      fontFamily: {
        thmanyah: ["Thmanyah", "sans-serif"],
      },
      fontSize: { /* كما هو */ },
      spacing: { /* كما هو */ },
      borderRadius: { /* كما هو */ },
      boxShadow: { /* كما هو */ },
      colors: {
        athar: {
          // البرتقالي الأساسي (من الصورة)
          primary: {
            DEFAULT: "#FBB44A",
            50: "#FEF7E6",
            100: "#FEECCD",
            200: "#FDE09B",
            300: "#FCD069",
            400: "#FBC137",
            500: "#FBB44A",
            600: "#E09D2E",
            700: "#C47E1A",
            800: "#A3610E",
            900: "#834B08",
          },
          // الأخضر النعناعي (من الصورة)
          secondary: {
            DEFAULT: "#3E9F7C",
            50: "#E6F4EF",
            100: "#CCE9DF",
            200: "#99D3C0",
            300: "#66BEA0",
            400: "#3E9F7C",
            500: "#2F7C60",
            600: "#205A44",
            700: "#103828",
            800: "#07160F",
          },
          // خلفية Pi (من الصورة)
          bg: {
            DEFAULT: "#F9F3E8",
            50: "#FEFDFC",
            100: "#F9F3E8",
            200: "#F0E6D6",
            300: "#E5D6BF",
          },
          card: "#FFFFFF",
          text: {
            DEFAULT: "#5C4B3A",   // بني دافئ
            muted: "#8F8A85",     // رمادي دافئ
          },
          charcoal: "#2C3E3A",
        },
      },
    },
  },
  plugins: [],
};
export default config;
