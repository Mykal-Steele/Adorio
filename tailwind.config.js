/* tailwind.config.js */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/views/**/*.{js,ts,jsx,tsx}',
    './src/Components/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts}',
  ],
  theme: {
    extend: {}, // might add custom colors later but the defaults are fine for now
  },
  plugins: [require('tailwind-scrollbar')({ nocompatible: true })],
};
