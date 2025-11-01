/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f1e6",
        maroon: "#7e1c1c",
        forest: "#264d36",
        butter: "#f3e1a0"
      },
      fontFamily: {
        display: ['ui-serif', 'Georgia', 'serif'],
        body: ['ui-serif', 'Georgia', 'serif']
      },
      boxShadow: {
        paper: "0 2px 0 rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
};