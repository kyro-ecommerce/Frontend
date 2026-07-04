module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fade: 'fade 1s ease-in-out infinite',
      },
      fontFamily: {
        segoe: ["Segoe UI", "sans-serif"],
      },

    },
  },
  plugins: [],
};