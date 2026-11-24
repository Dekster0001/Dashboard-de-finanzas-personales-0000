/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Ejecutiva Wealth Management & Soft Floating UI
        // Extraída directamente de la paleta de referencia (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6)
        lienzo: '#F3EEE6',          // Fondo general marfil cálido / alabastro suave descansado a la vista
        tarjeta: '#FFFFFF',         // Blanco puro para tarjetas flotantes de máximo descanso visual
        medianoche: '#102A43',      // Azul tinta profundo de alto contraste
        marino: '#102A43',          // Títulos principales y cifras financieras destacadas
        acero: '#334E68',           // Azul pizarra acero para encabezados secundarios y estados
        pizarra: '#9FB3C8',         // Gris azulado suave para bordes sutiles, iconos y separadores
        'pizarra-texto': '#627D98', // Texto secundario de alta legibilidad
        oro: {                      // Acento noble cálido / bronce dorado para botones CTA y estados activos
          DEFAULT: '#BFA37C',
          hover: '#A88C65',
          tenue: 'rgba(191, 163, 124, 0.14)',
          brillo: 'rgba(191, 163, 124, 0.28)'
        },
        electrico: {                // Mapeo armónico al acento dorado para compatibilidad
          DEFAULT: '#BFA37C',
          hover: '#A88C65',
          tenue: 'rgba(191, 163, 124, 0.14)',
          brillo: 'rgba(191, 163, 124, 0.28)'
        },
        esmeralda: {                // Indicador financiero de ingresos (verde bosque noble suave)
          DEFAULT: '#0D9488',
          tenue: 'rgba(13, 148, 136, 0.12)'
        },
        carmesi: {                  // Indicador financiero de gastos / alertas (vino tinto sobrio)
          DEFAULT: '#BE123C',
          tenue: 'rgba(190, 18, 60, 0.12)'
        },
        ambar: {                    // Alerta preventiva moderada
          DEFAULT: '#D97706',
          tenue: 'rgba(217, 119, 6, 0.12)'
        },

        // Escala primaria compatible
        primario: {
          50: '#fdfbf9',
          100: '#f8f4ed',
          200: '#edd8b8',
          300: '#dfc297',
          400: '#cfa87b',
          500: '#bfa37c',
          600: '#a88c65',
          700: '#8e7552',
          800: '#725e42',
          900: '#534430'
        }
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      },
      boxShadow: {
        // Sombras difusas cálidas (Ambient Elevation) basadas en #102A43 sobre lienzo #F3EEE6
        'flotante': '0 10px 30px -5px rgba(16, 42, 67, 0.05), 0 20px 40px -10px rgba(16, 42, 67, 0.03)',
        'flotante-hover': '0 20px 45px -8px rgba(16, 42, 67, 0.09), 0 10px 20px -4px rgba(16, 42, 67, 0.04)',
        'dock': '0 20px 50px -10px rgba(16, 42, 67, 0.07), 0 0 1px 1px rgba(255, 255, 255, 0.9) inset',
        'anillo': '0 0 0 4px rgba(191, 163, 124, 0.20)',
        'suave': '0 4px 20px -2px rgba(16, 42, 67, 0.04)'
      }
    },
  },
  plugins: [],
};
