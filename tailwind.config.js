/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',   // <-- add this line (or false if you don't want dark mode at all)
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6C3CE1",
        secondary: "#FF8A65",
        accent: "#00C853",
        background: "#F8F9FA",
        surface: "#FFFFFF",
        error: "#FF3B30",
        warning: "#FF9500",
      },
    },
  },
  plugins: [],
};