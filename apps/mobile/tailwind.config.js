/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#14233B",
        artisan: "#E58A42",
        cream: "#FFF8EF",
        teal: "#168C88",
      },
    },
  },
  plugins: [],
};
