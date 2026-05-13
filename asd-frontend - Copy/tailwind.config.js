/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          blue: '#2563eb',
          alert: '#ef4444',
          safe: '#22c55e',
          bg: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}