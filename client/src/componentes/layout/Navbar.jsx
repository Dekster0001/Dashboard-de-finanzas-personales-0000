import React from 'react';
import { useAuth } from '../../contexto/ContextoAuth.jsx';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

/**
 * Barra superior de navegación flotante tipo cápsula.
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Tarjeta blanca flotante con esquinas rounded-3xl, detalles en oro (#BFA37C)
 * y botón de acción directa en cápsula dorada.
 * @param {{ onToggleBarraLateral: () => void }} props
 */
export function Navbar({ onToggleBarraLateral }) {
  const { usuario, cerrarSesion } = useAuth();

  const handleCerrarSesion = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tendrás que iniciar sesión nuevamente para acceder a tus finanzas.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#102A43',
      cancelButtonColor: '#9FB3C8',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full font-bold px-5 py-2.5',
        cancelButton: 'rounded-full font-bold px-5 py-2.5'
      }
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        cerrarSesion();
      }
    });
  };

  return (
    <header className="bg-white rounded-3xl shadow-flotante border border-white/90 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 mb-6 transition-all">
      {/* Lado izquierdo: Botón hamburguesa móvil + Contexto */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleBarraLateral}
          className="p-2 text-[#334E68] hover:text-[#102A43] hover:bg-[#F3EEE6] rounded-2xl lg:hidden focus:outline-none transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EEE6]/70 border border-[#9FB3C8]/40">
            <span className="w-2 h-2 rounded-full bg-[#BFA37C] animate-ping"></span>
            <span className="text-xs font-bold text-[#102A43]">Panel Patrimonial</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#F3EEE6] text-[#334E68] border border-[#9FB3C8]/40">
            🇵🇪 Soles (S/.)
          </span>
        </div>
      </div>

      {/* Lado derecho: Acceso directo rápido + Botón Salir */}
      <div className="flex items-center gap-3">
        {/* Botón flotante para registrar movimiento directamente */}
        <Link
          to="/movimientos"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all hover:shadow-lg"
        >
          <span className="text-base leading-none">+</span>
          <span className="hidden sm:inline">Movimiento</span>
        </Link>

        {/* Botón Cerrar Sesión */}
        <button
          type="button"
          onClick={handleCerrarSesion}
          className="p-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-[#BE123C] bg-rose-50/50 hover:bg-rose-100/70 rounded-full border border-rose-200/60 transition-all flex items-center gap-1.5"
          title="Cerrar sesión"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
