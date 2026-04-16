/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'Cascadia Code'", "'Fira Code'", "Consolas", "monospace"],
      },
      colors: {
        gold: {
          50:  "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          400: "#facc15",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "fade-in":   "fadeIn 0.2s ease-out",
        "slide-up":  "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { transform: "translateY(8px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
      },
    },
  },
  plugins: [],
};
