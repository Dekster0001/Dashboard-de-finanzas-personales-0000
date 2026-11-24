import React from 'react';

/**
 * Control de paginación adaptado a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Fondo blanco, bordes en #9FB3C8/30, números en #102A43 y botones redondeados.
 * @param {{
 *   paginaActual: number,
 *   totalPaginas: number,
 *   totalRegistros: number,
 *   onCambiarPagina: (nuevaPagina: number) => void
 * }} props
 */
export function Paginacion({
  paginaActual = 1,
  totalPaginas = 1,
  totalRegistros = 0,
  onCambiarPagina
}) {
  if (totalPaginas <= 1 && totalRegistros <= 10) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-white border border-[#9FB3C8]/30 rounded-2xl shadow-flotante text-xs sm:text-sm">
      <div className="text-[#627D98] font-medium">
        Mostrando página <span className="font-bold text-[#102A43]">{paginaActual}</span> de{' '}
        <span className="font-bold text-[#102A43]">{totalPaginas}</span> ({totalRegistros} registros)
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={paginaActual <= 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          className="px-4 py-2 rounded-xl border border-[#9FB3C8]/40 text-[#102A43] hover:border-[#BFA37C] hover:text-[#BFA37C] hover:bg-[#F3EEE6] disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all shadow-sm"
        >
          ← Anterior
        </button>

        <button
          type="button"
          disabled={paginaActual >= totalPaginas}
          onClick={() => onCambiarPagina(paginaActual + 1)}
          className="px-4 py-2 rounded-xl border border-[#9FB3C8]/40 text-[#102A43] hover:border-[#BFA37C] hover:text-[#BFA37C] hover:bg-[#F3EEE6] disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all shadow-sm"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

export default Paginacion;
