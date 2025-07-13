/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'media', // or 'class' if you want a manual toggle
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'], // Example: Using Inter font
        },
        keyframes: {
          fadeIn: {
            'from': { opacity: '0', transform: 'translateY(10px)' },
            'to': { opacity: '1', transform: 'translateY(0)' },
          }
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-out',
        }
      },
    },
    plugins: [],
  }
  