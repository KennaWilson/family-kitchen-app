/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'french-blue': '#7B8FA1',
        'light-taupe': '#B5A99A',
        'dusty-rose': '#C9919C',
        'purple-ash': '#9B8BB4',
        'cream': '#F7F5F3',
        'cream-dark': '#EDE9E5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 24px 0 rgba(0,0,0,0.07)',
        'card': '0 2px 12px 0 rgba(0,0,0,0.08)',
      },
      keyframes: {
        starburst: {
          '0%':   { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '60%':  { transform: 'scale(1.4) rotate(20deg)', opacity: '1' },
          '100%': { transform: 'scale(0) rotate(40deg)', opacity: '0' },
        },
        floatUp: {
          '0%':   { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        tilt: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%':      { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        starburst: 'starburst 0.6s ease-out forwards',
        floatUp:   'floatUp 0.8s ease-out forwards',
        fadeIn:    'fadeIn 0.5s ease-out forwards',
        tilt:      'tilt 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}


