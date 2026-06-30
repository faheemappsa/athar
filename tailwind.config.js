/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-bg": "#EAF6F3",
        "card-bg": "#FFFFFF",
        "primary-text": "#244A3F",
        "secondary-text": "#6F8F86",
        "accent": "#A8D5C2",
        "highlight": "#3BA77B",
        "action": "#2F9D75",
        "mint-soft": "#F4FBF8",
        "mint-glow": "#CFEADF",
        "mint-deep": "#1F7B5F"
      },
      borderRadius: {
        card: "28px"
      },
      fontFamily: {
        arabic: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
