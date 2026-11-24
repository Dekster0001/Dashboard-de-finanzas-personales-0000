import dayjs from 'dayjs';
import 'dayjs/locale/es.js';

dayjs.locale('es');

/**
 * Convierte un monto entero en céntimos (centavos) a formato en Soles Peruanos (S/.) legible.
 * Ejemplo: 1050 -> "S/. 10.50", 125000 -> "S/. 1,250.00"
 * @param {number} centavos - Monto en céntimos
 * @param {string} [moneda='S/.'] - Símbolo monetario oficial (por defecto Soles Peruanos)
 * @returns {string}
 */
export function formatearCentavosAMoneda(centavos = 0, moneda = 'S/.') {
  if (typeof centavos !== 'number' || isNaN(centavos)) {
    return `${moneda} 0.00`;
  }
  const valorDecimal = centavos / 100;
  return `${moneda} ${valorDecimal.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Convierte un valor decimal ingresado por el usuario a número entero de centavos.
 * Ejemplo: "10.50" -> 1050
 * @param {string|number} valorDecimal
 * @returns {number}
 */
export function convertirDecimalACentavos(valorDecimal) {
  if (!valorDecimal) return 0;
  const limpio = String(valorDecimal).replace(',', '.');
  const flotante = parseFloat(limpio);
  if (isNaN(flotante) || flotante < 0) return 0;
  return Math.round(flotante * 100);
}

/**
 * Formatea una fecha ISO o Date a cadena legible en español.
 * @param {string|Date} fecha
 * @param {string} [formato='DD/MM/YYYY']
 * @returns {string}
 */
export function formatearFecha(fecha, formato = 'DD/MM/YYYY') {
  if (!fecha) return '-';
  return dayjs(fecha).format(formato);
}
