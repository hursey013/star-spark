/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-sky': {
          50: '#f2fbff',
          100: '#def5ff',
          200: '#b9eaff',
          300: '#82daff',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0285c7',
          700: '#03699c',
          800: '#065683',
          900: '#0b3b5a'
        },
        'brand-slate': '#0b1120'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'var(--font-sans)', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(14, 165, 233, 0.6)'
      }
    }
  },
  plugins: []
};
