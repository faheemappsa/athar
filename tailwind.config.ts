import type { Config } from “tailwindcss”;

const config: Config = {
darkMode: “class”,
content: [
“./src/pages//*.{js,ts,jsx,tsx,mdx}”,
“./src/components//.{js,ts,jsx,tsx,mdx}”,
“./src/app/**/.{js,ts,jsx,tsx,mdx}”,
],
theme: {
extend: {
fontFamily: {
thmanyah: [“Thmanyah”, “sans-serif”],
},
fontSize: {
xs: [“0.75rem”, { lineHeight: “1rem”, fontWeight: “400” }],
sm: [“0.875rem”, { lineHeight: “1.5rem”, fontWeight: “400” }],
base: [“1rem”, { lineHeight: “1.75rem”, fontWeight: “400” }],
lg: [“1.125rem”, { lineHeight: “2rem”, fontWeight: “500” }],
xl: [“1.25rem”, { lineHeight: “2rem”, fontWeight: “500” }],
“2xl”: [“1.5rem”, { lineHeight: “2.25rem”, fontWeight: “700” }],
“3xl”: [“2rem”, { lineHeight: “2.5rem”, fontWeight: “700” }],
},
spacing: {
“18”: “4.5rem”,
“22”: “5.5rem”,
“26”: “6.5rem”,
“30”: “7.5rem”,
},
borderRadius: {
xs: “0.375rem”,
sm: “0.5rem”,
md: “0.75rem”,
lg: “1rem”,
xl: “1.25rem”,
“2xl”: “1.5rem”,
“3xl”: “2rem”,
},
boxShadow: {
xs: “0 1px 2px 0 rgba(0, 0, 0, 0.03)”,
sm: “0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)”,
md: “0 4px 8px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.04)”,
lg: “0 8px 16px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -4px rgba(0, 0, 0, 0.04)”,
xl: “0 12px 24px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04)”,
“2xl”: “0 20px 40px -12px rgba(0, 0, 0, 0.12), 0 4px 16px -4px rgba(0, 0, 0, 0.06)”,
},
colors: {
athar: {
primary: {
DEFAULT: “#0F4D2F”,
50: “#EAF3EE”,
100: “#D4E8DD”,
200: “#A9D1BB”,
300: “#7DB998”,
400: “#529F76”,
500: “#0F4D2F”,
600: “#0C4027”,
700: “#09331F”,
800: “#062617”,
900: “#03190F”,
},
secondary: {
DEFAULT: “#1B6A45”,
50: “#EDF6F1”,
100: “#DBEDE3”,
200: “#B7DBC7”,
300: “#93C9AB”,
400: “#4A9A72”,
500: “#1B6A45”,
600: “#155438”,
700: “#103E2A”,
800: “#0A281C”,
},
accent: {
DEFAULT: “#1B6A45”,
50: “#EDF6F1”,
100: “#DBEDE3”,
200: “#B7DBC7”,
300: “#93C9AB”,
400: “#4A9A72”,
500: “#1B6A45”,
600: “#155438”,
700: “#103E2A”,
800: “#0A281C”,
},
bg: {
DEFAULT: “#F6F1E8”,
50: “#FFFCF8”,
100: “#F6F1E8”,
200: “#EEE6DA”,
300: “#E5DACB”,
},
card: “#FFFCF8”,
text: {
DEFAULT: “#3E342C”,
light: “#6A5A4E”,
muted: “#8C8177”,
},
charcoal: “#1F2A24”,
},
},
},
},
plugins: [],
};

export default config;
