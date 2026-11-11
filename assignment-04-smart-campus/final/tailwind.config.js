/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        indigo: {
          950: '#1e1b4b',
        },
        teal: {
          950: '#043f3f',
        },
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(30, 27, 75, 0.18)',
        'soft-lg': '0 12px 40px -12px rgba(30, 27, 75, 0.22)',
      },
    },
  },
  plugins: [],
};
