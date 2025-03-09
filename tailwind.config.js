/* tailwind.config.js */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/index.css"],
  theme: {
    extend: {}, // might add custom colors later but the defaults are fine for now
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
