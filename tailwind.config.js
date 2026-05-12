/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        shell: "#07111f",
        panel: "#0d1728",
        panelSoft: "#122039",
        line: "#25334c",
        accent: "#22c55e",
        accentSoft: "#163321",
        warning: "#f59e0b",
        danger: "#ef4444"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};
