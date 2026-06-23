/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0F0A',
        panel: '#0D1410',
        crop: '#2ECC71',
        cropbright: '#3DDC84',
        lime: '#A8FF60',
      },
      fontFamily: {
        sans: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        sprout: {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pulsering: {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '70%': { transform: 'scale(1.8)', opacity: '0' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        dash: {
          to: { strokeDashoffset: '0' },
        },
        spinleaf: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        sprout: 'sprout 0.45s ease-out both',
        pulsering: 'pulsering 2s ease-out infinite',
        dash: 'dash 2.2s ease-out forwards',
        spinleaf: 'spinleaf 1s linear infinite',
      },
    },
  },
  plugins: [],
}
