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
          primary: {
            DEFAULT: "#E86F2C",     // برتقالي دافئ جريء
            50: "#FEF1E8",
            100: "#FCE0D0",
            200: "#F9C2A1",
            300: "#F6A373",
            400: "#F28545",
            500: "#E86F2C",
            600: "#C45A22",
            700: "#9E4518",
            800: "#783010",
            900: "#521D08",
          },
          secondary: {
            DEFAULT: "#2F9E79",     // أخضر نعناعي هادئ (دور ثانوي)
            50: "#E9F4F0",
            100: "#CEE8DF",
            200: "#9DD0BF",
            300: "#6CB99F",
            400: "#4AA882",
            500: "#2F9E79",
            600: "#267E60",
            700: "#1C5F47",
            800: "#133F2E",
            900: "#092015",
          },
          accent: {
            DEFAULT: "#F4A261",     // برتقالي فاتح مكمل
            50: "#FEF8F2",
            100: "#FDF0E4",
            200: "#FBE2C9",
            300: "#F9D3AF",
            400: "#F7C594",
            500: "#F4A261",
            600: "#E3862F",
            700: "#BF6920",
            800: "#9A4E15",
            900: "#75350A",
          },
          bg: {
            DEFAULT: "#FCF7F0",     // خلفية دافئة جدًا (بديل الكتان)
            50: "#FEFDFC",
            100: "#FCF7F0",
            200: "#F7EDE3",
            300: "#F0E3D6",
          },
          card: "#FFFFFF",
          text: {
            DEFAULT: "#2A241E",     // بني غامق دافئ
            light: "#E86F2C",       // برتقالي للنصوص الخفيفة
            muted: "#8F8A85",       // رمادي دافئ
          },
          charcoal: "#2C3E3A",
        },
      },
    },
  },
  plugins: [],
};
export default config;
