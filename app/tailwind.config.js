/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        handlee: ['"Handlee"', 'cursive', 'sans-serif'],
        gloria: ['"Gloria Hallelujah"', 'cursive', 'sans-serif'],
      },
      colors: {
        marche: {
          sujet: '#FFE885',
          sujetBorder: '#B45309',
          mode1Bg: '#157A9E',
          mode1Card: '#1B63E9',
          mode2Bg: '#0E8345',
          mode2Card: '#D4E157',
          mode3Bg: '#5B2C6F',
          mode3Card: '#8E44AD',
        },
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(-8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        modalBackdropFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalSlideDown: {
          '0%': { opacity: '0', transform: 'translate3d(0, -25%, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        shake: 'shake 0.45s ease-in-out',
        popIn: 'popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        float: 'float 2.2s ease-in-out infinite',
        modalBackdropFade: 'modalBackdropFade 0.15s linear forwards',
        modalSlideDown: 'modalSlideDown 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
