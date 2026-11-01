/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '400px',
      'sm': '600px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      colors: {
        porcelain: '#F5F2EC',   // Primary background
        ivory: '#EAE5DB',       // Secondary background
        cream: '#FCFAF6',       // Main surface
        espresso: '#29251F',    // Primary text
        'warm-grey': '#817A70', // Secondary text
        stone: '#A49B8F',       // Muted text
        olive: {
          DEFAULT: '#465344',   // Primary brand interaction
          hover: '#384337',
          subtle: 'rgba(70, 83, 68, 0.08)',
          light: '#5B6B59',
          border: 'rgba(70, 83, 68, 0.25)',
        },
        brass: {
          DEFAULT: '#A88A58',   // Secondary accent
          subtle: 'rgba(168, 138, 88, 0.12)',
          dark: '#8C7245',
          border: 'rgba(168, 138, 88, 0.3)',
        },
        taupe: {
          DEFAULT: '#DED8CE',   // Fine borders
          subtle: 'rgba(222, 216, 206, 0.55)',
          light: '#EDE8DF',
        },
        forest: {
          DEFAULT: '#47745A',   // Success
          subtle: 'rgba(71, 116, 90, 0.12)',
        },
        burgundy: {
          DEFAULT: '#A94B47',   // Error
          subtle: 'rgba(169, 75, 71, 0.12)',
        },
        // Retain semantic mappings if any legacy code refers to aura
        aura: {
          bg: '#F5F2EC',
          secondary: '#EAE5DB',
          elevated: '#FCFAF6',
          text: '#29251F',
          subtext: '#817A70',
          muted: '#A49B8F',
          amber: '#A88A58',
          orange: '#465344',
          emerald: '#47745A',
          crimson: '#A94B47',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(41, 37, 31, 0.04), 0 1px 2px -1px rgba(41, 37, 31, 0.04)',
        'card': '0 4px 20px -2px rgba(41, 37, 31, 0.05), 0 2px 6px -1px rgba(41, 37, 31, 0.03)',
        'elevated': '0 14px 34px -4px rgba(41, 37, 31, 0.08), 0 4px 12px -2px rgba(41, 37, 31, 0.04)',
        'dock': '0 18px 44px -8px rgba(41, 37, 31, 0.14), 0 6px 16px -2px rgba(41, 37, 31, 0.06)',
      },
      borderRadius: {
        'control': '8px',
        'button': '10px',
        'image': '14px',
        'sheet': '20px',
        'drawer': '24px',
      }
    },
  },
  plugins: [],
}
