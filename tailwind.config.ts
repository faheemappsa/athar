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
      borderRadius: {
        "xs": "0.375rem",
        "sm": "0.5rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        "xs": "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "sm": "0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
        "md": "0 4px 8px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.04)",
        "lg": "0 8px 16px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -4px rgba(0, 0, 0, 0.04)",
        "xl": "0 12px 24px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04)",
        "2xl": "0 20px 40px -12px rgba(0, 0, 0, 0.12), 0 4px 16px -4px rgba(0, 0, 0, 0.06)",
      },
      colors: {
        athar: {
          // اللون الأساسي (ذهبي دافئ - من اختيارك)
          primary: {
            DEFAULT: "#D99A2B",     // الأساسي
            50: "#FDF8F0",
            100: "#F9E9D4",
            200: "#F2D1A8",
            300: "#EBB87C",
            400: "#E9A93A",         // درجتك الأولى
            500: "#D99A2B",         // درجتك الثانية
            600: "#C48720",         // درجتك الثالثة
            700: "#9E6918",
            800: "#784A10",
            900: "#522E08",
          },
          // اللون الثانوي (أخضر نعناعي)
          secondary: {
            DEFAULT: "#2F9E79",
            50: "#E9F4F0",
            100: "#CEE8DF",
            200: "#9DD0BF",
            300: "#6CB99F",
            400: "#2F9E79",
            500: "#267E60",
            600: "#1C5F47",
            700: "#133F2E",
            800: "#092015",
          },
          // خلفية Pi (Linen)
          bg: {
            DEFAULT: "#F9F3E8",
            50: "#FEFDFC",
            100: "#F9F3E8",
            200: "#F0E6D6",
            300: "#E5D6BF",
          },
          // البطاقات والعناصر البيضاء
          card: "#FFFFFF",
          // النصوص
          text: {
            DEFAULT: "#5C4B3A",    // بني دافئ
            muted: "#8F8A85",      // رمادي دافئ
          },
          charcoal: "#2C3E3A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
