/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta nude/beige principal
        nude: {
          50:  '#FDFAF7',
          100: '#F7F0E8',
          200: '#EDE0D0',
          300: '#DFCDB8',
          400: '#CEBDA3',
          500: '#B8A08A',
          600: '#9A8270',
          700: '#7D6759',
          800: '#604E44',
          900: '#433630',
        },
        // Acento cálido (reemplaza rose)
        warm: {
          50:  '#FBF6F1',
          100: '#F5EAE0',
          200: '#EAD3C0',
          300: '#DDB99A',
          400: '#CE9C76',
          500: '#B87E56',
          600: '#9A6642',
          700: '#7D5035',
          800: '#5F3C28',
          900: '#42291C',
        },
        // Verde salvia (reemplaza sage)
        sage: {
          50:  '#F3F6F1',
          100: '#E3EBE0',
          200: '#C6D6C0',
          300: '#A3BA9B',
          400: '#829E79',
          500: '#66845C',
          600: '#4F6B47',
          700: '#3D5337',
          800: '#2C3C28',
          900: '#1C261A',
        },
        // Dorado suave
        gold: {
          50:  '#FDF8EE',
          100: '#FAEFD4',
          200: '#F4D99A',
          300: '#ECBF60',
          400: '#D4A034',
          500: '#B08020',
          600: '#8A6318',
          700: '#664A12',
          800: '#45320C',
          900: '#2A1E07',
        },
        // Neutro oscuro (reemplaza ink)
        ink: {
          50:  '#F8F6F4',
          100: '#EDE8E3',
          200: '#D5CBC2',
          300: '#B8A99D',
          400: '#998779',
          500: '#7D6B5C',
          600: '#635548',
          700: '#4A3F37',
          800: '#322A25',
          900: '#1E1915',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans:  ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        xl:  '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
