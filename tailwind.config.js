/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#070b19",
        darkCard: "rgba(15, 23, 42, 0.75)",
        darkCardBorder: "rgba(255, 255, 255, 0.08)",
        electricBlue: "#00f0ff",
        blueGlow: "#00a2ff",
        vibrantOrange: "#ff5500",
        orangeGlow: "#ff7700",
      },
      boxShadow: {
        neonBlue: "0 0 20px rgba(0, 240, 255, 0.4)",
        neonOrange: "0 0 20px rgba(255, 85, 0, 0.4)",
        cardGlow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
