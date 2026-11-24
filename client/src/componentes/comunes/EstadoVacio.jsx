import React from 'react';

/**
 * Componente para mostrar un estado vacío informativo cuando no hay registros.
 * Adaptado a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Fondo blanco, rounded-3xl, acento en oro noble (#BFA37C).
 * @param {{
 *   titulo?: string,
 *   mensaje?: string,
 *   icono?: React.ReactNode,
 *   accionBoton?: () => void,
 *   textoBoton?: string
 * }} props
 */
export function EstadoVacio({
  titulo = 'No hay datos disponibles',
  mensaje = 'No se encontraron registros para los criterios especificados.',
  icono,
  accionBoton,
  textoBoton
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl border border-dashed border-[#9FB3C8]/40 shadow-flotante">
      <div className="w-16 h-16 rounded-2xl bg-[#F3EEE6] text-[#BFA37C] flex items-center justify-center text-3xl mb-4 shadow-sm border border-[#9FB3C8]/30">
        {icono || (
          <svg className="w-8 h-8 text-[#BFA37C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-black text-[#102A43]">{titulo}</h3>
      <p className="mt-1.5 text-xs text-[#627D98] max-w-sm leading-relaxed font-medium">{mensaje}</p>

      {accionBoton && textoBoton && (
        <div className="mt-5">
          <button
            type="button"
            onClick={accionBoton}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all hover:shadow-lg"
          >
            <span>+</span>
            <span>{textoBoton}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default EstadoVacio;
