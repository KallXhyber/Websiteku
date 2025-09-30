/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
       colors: {
        'discord-dark': '#2c2f33',
        'discord-darker': '#23272a',
        'discord-light': '#ffffff',
        'discord-blurple': '#5865f2',
        // WARNA INI KITA BUAT LEBIH TERANG
        'discord-gray': '#adb5bd', 
      },
    },
  },
  plugins: [],
}