/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.jsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        'mono': ['Inter', 'system-ui', 'monospace'],
      },
      colors: {
        'base': '#0a0a0a',
        'surface': '#141414',
        'muted': '#2d2d2d',
        'subtle': '#555555',
        'text-primary': '#e0e0e0',
        'text-secondary': '#a0a0e0',
        'primary': '#00d936',
        'primary-hover': '#00c731'
      }
    }
  },
  plugins: [],
}