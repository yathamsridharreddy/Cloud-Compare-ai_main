/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          blue:   '#0070f3',
          lightblue: '#00d2ff',
          purple: '#8a2be2',
          pink:   '#ff2d9b',
          cyan:   '#00fff7',
        },
        dark: {
          900: '#06060c', // Deepest background
          800: '#0e0e16', // Sidebar/Cards
          700: '#14141f', // Hover states
          600: '#1c1c28',
          500: '#2a2a3a',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'glow-pulse':    'glowPulse 2s ease-in-out infinite alternate',
        'float':         'float 6s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'slide-up':      'slideUp 0.5s cubic-bezier(0.23,1,0.32,1) both',
        'fade-in':       'fadeIn 0.4s ease both',
        'border-rotate': 'borderRotate 4s linear infinite',
      },
      keyframes: {
        glowPulse:    { '0%': { boxShadow: '0 0 20px rgba(0,210,255,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(138,43,226,0.6)' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        slideUp:      { from: { opacity: 0, transform: 'translateY(30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        borderRotate: { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
