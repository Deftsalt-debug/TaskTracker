/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom palette from image
        gunmetal: '#4B4F55',
        smoke: '#7D8A96',
        sageMist: '#C8D1CC',
        paleGreen: '#A4B3A4',
        fog: '#8F9295',
        
        // Task category colors
        upcoming: '#A4B3A4',      // Pale Green
        inProgress: '#708238',    // Olive for In Progress
        priority: '#9a6b4f',      // Brown for Priority
        completed: '#556b2f',     // Dark Olive Green for Completed
        
        // Additional theme colors
        primary: {
          50: '#f0f9ff',
          500: '#708238',
          600: '#556b2f',
          700: '#4a5c28',
        }
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'fade-in': 'fadeIn 0.3s ease-in',
        'bounce-subtle': 'bounceSubtle 0.5s ease-in-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}
