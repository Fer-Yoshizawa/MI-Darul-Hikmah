/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0f7a55', hover: '#0b6546' },
        sidebar: '#0b3b2c',
        surface: '#f1f7f4',
        line: '#dfe9e4',
        muted: '#6b7b74',
      },
    },
  },
  plugins: [],
}
