import React, { useEffect } from 'react';

/**
 * Componente de diálogo modal accesible y responsivo.
 * Adaptado a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Fondo blanco puro (#FFFFFF), esquinas rounded-3xl, acento en oro (#BFA37C)
 * y superposición suave en azul tinta (#102A43).
 * @param {{
 *   abierto: boolean,
 *   onCerrar: () => void,
 *   titulo: string,
 *   children: React.ReactNode,
 *   anchoMaximo?: string
 * }} props
 */
export function Modal({ abierto, onCerrar, titulo, children, anchoMaximo = 'max-w-lg' }) {
  // Cerrar modal al presionar Escape
  useEffect(() => {
    const manejarTeclaEscape = (e) => {
      if (e.key === 'Escape' && abierto) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', manejarTeclaEscape);
    return () => window.removeEventListener('keydown', manejarTeclaEscape);
  }, [abierto, onCerrar]);

  // Bloquear scroll del fondo cuando el modal esté abierto
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fondo oscuro suave con desenfoque de cristal basado en #102A43 */}
      <div
        className="fixed inset-0 bg-[#102A43]/55 backdrop-blur-md transition-opacity duration-300"
        onClick={onCerrar}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div
          className={`relative transform overflow-hidden rounded-3xl bg-white text-left shadow-flotante transition-all sm:my-8 w-full ${anchoMaximo} border border-white/90 ring-1 ring-[#9FB3C8]/30`}
        >
          {/* Cabecera del modal */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-[#F3EEE6]/50">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BFA37C] ring-4 ring-[#BFA37C]/20" />
              <h3 className="text-base sm:text-lg font-black tracking-tight text-[#102A43]">{titulo}</h3>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-full w-8 h-8 flex items-center justify-center text-[#627D98] hover:bg-white hover:text-[#102A43] transition-colors border border-[#9FB3C8]/30 shadow-sm"
              aria-label="Cerrar modal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cuerpo del modal con espacio generoso */}
          <div className="p-6 sm:p-7 bg-white">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
