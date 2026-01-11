/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#0B1D51",
        electric: "#1E90FF",
        crimson: "#DC143C",
        gold: "#FFD700",
        charcoal: "#2F2F2F",
        deepPurple: "#5B2C6F",
      },
    },
  },
  plugins: [],
}
