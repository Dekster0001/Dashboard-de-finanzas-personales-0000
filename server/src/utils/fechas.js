import dayjs from 'dayjs';

/**
 * Valida si una cadena cumple con el formato de mes AAAA-MM.
 * @param {string} mes
 * @returns {boolean}
 */
export function esMesValido(mes) {
  if (typeof mes !== 'string') return false;
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(mes.trim());
}

/**
 * Obtiene la fecha inicial y final en UTC para un mes en formato AAAA-MM.
 * @param {string} mesStr - Ej: '2026-11'
 * @returns {{ inicioMes: Date, finMes: Date, mesNormalizado: string }}
 */
export function obtenerRangoMesUTC(mesStr) {
  let mes = mesStr;
  if (!mes || !esMesValido(mes)) {
    mes = dayjs().format('YYYY-MM');
  }

  const [anio, numMes] = mes.split('-').map(Number);
  const inicioMes = new Date(Date.UTC(anio, numMes - 1, 1, 0, 0, 0, 0));
  const finMes = new Date(Date.UTC(anio, numMes, 0, 23, 59, 59, 999));

  return { inicioMes, finMes, mesNormalizado: mes };
}

/**
 * Genera la secuencia cronológica de los últimos 6 meses (incluyendo el mes base).
 * @param {string} [mesBase] - Formato AAAA-MM (por defecto el mes actual)
 * @returns {{ meses: string[], inicioRango: Date, finRango: Date }}
 */
export function obtenerUltimos6Meses(mesBase) {
  let base = mesBase;
  if (!base || !esMesValido(base)) {
    base = dayjs().format('YYYY-MM');
  }

  const [anioBase, numMesBase] = base.split('-').map(Number);
  const meses = [];

  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(Date.UTC(anioBase, numMesBase - 1 - i, 1));
    const anio = fecha.getUTCFullYear();
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    meses.push(`${anio}-${mes}`);
  }

  const { inicioMes: inicioRango } = obtenerRangoMesUTC(meses[0]);
  const { finMes: finRango } = obtenerRangoMesUTC(meses[meses.length - 1]);

  return { meses, inicioRango, finRango };
}
