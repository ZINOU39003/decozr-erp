/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#059669',
        warning: '#D97706',
        danger: '#DC2626',
        neutral: '#64748B',
      },
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
