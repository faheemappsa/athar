/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-bg": "#F5F0E8",
        "card-bg": "#FFFFFF",
        "primary-text": "#3E4A3C",
        "secondary-text": "#8A8A8A",
        "accent": "#5B6E5A",
        "highlight": "#A67C52",
        "action": "#3E4A3C",
      },
      borderRadius: {
        card: "20px",
      },
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
