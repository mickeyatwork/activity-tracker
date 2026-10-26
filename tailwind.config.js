/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-emerald-500',
    'bg-indigo-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-sky-500',
    'bg-purple-500',
  ],
  theme: {
    extend: {
      padding: {
        'safe': 'env(safe-area-inset-bottom, 0.75rem)',
      },
    },
  },
  plugins: [],
}
