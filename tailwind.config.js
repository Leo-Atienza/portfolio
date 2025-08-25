/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/views/**/*.ejs", "./src/**/*.js"],
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
daisyui: { themes: ["cupcake", "business"] }
};
