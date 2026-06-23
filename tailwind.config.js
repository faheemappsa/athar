export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#F0F4F8',
        'card-bg': '#FFFFFF',
        'primary-text': '#1A3B5C',
        'secondary-text': '#6B7280',
        'accent': '#D0E4F5',
        'highlight': '#4A90D9',
        'action': '#4A90D9',
      },
      borderRadius: {
        'card': '20px',
      },
      fontFamily: {
        'arabic': ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
