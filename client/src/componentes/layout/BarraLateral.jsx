import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexto/ContextoAuth.jsx';

/**
 * Barra lateral flotante (Floating Dock).
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Tarjeta blanca flotante sobre lienzo marfil (#F3EEE6), bordes rounded-3xl,
 * detalles en oro/bronce (#BFA37C) y azul tinta (#102A43).
 * @param {{ abierta: boolean, onCerrar: () => void }} props
 */
export function BarraLateral({ abierta, onCerrar }) {
  const { usuario } = useAuth();

  const enlaces = [
    {
      ruta: '/dashboard',
      nombre: 'Dashboard',
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      ruta: '/movimientos',
      nombre: 'Movimientos',
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      ruta: '/cuentas',
      nombre: 'Cuentas y Medios',
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      ruta: '/categorias',
      nombre: 'Categorías',
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      ruta: '/presupuesto',
      nombre: 'Presupuesto',
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  if (usuario?.rol === 'ADMIN') {
    enlaces.push({
      ruta: '/admin/usuarios',
      nombre: 'Usuarios (Admin)',
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    });
  }

  const inicial = usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Fondo de atenuación para vista móvil */}
      {abierta && (
        <div
          className="fixed inset-0 z-40 bg-[#102A43]/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      {/* Dock Lateral Flotante */}
      <aside
        className={`fixed top-4 bottom-4 left-4 z-50 w-64 lg:w-72 bg-white rounded-3xl shadow-flotante border border-white/90 p-5 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:h-full shrink-0 ${
          abierta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Cabecera de Marca */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#102A43] text-[#BFA37C] flex items-center justify-center font-bold text-lg shadow-md shadow-[#102A43]/20 ring-1 ring-[#BFA37C]/30">
                💎
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-[#102A43] block leading-tight">
                  Finanzas <span className="text-[#BFA37C]">Pro</span>
                </span>
                <span className="text-[10px] font-bold text-[#627D98] tracking-wider uppercase block">
                  Dashboard Personal
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onCerrar}
              className="p-1.5 text-[#627D98] hover:text-[#102A43] hover:bg-[#F3EEE6] rounded-xl lg:hidden"
              aria-label="Cerrar menú"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tarjeta de Usuario Integrada */}
          <div className="p-3.5 bg-[#F3EEE6]/60 rounded-2.5xl border border-[#9FB3C8]/30 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#102A43] text-[#BFA37C] font-black flex items-center justify-center text-sm shadow-sm ring-2 ring-white">
              {inicial}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#627D98] block leading-none mb-1">
                Bienvenido,
              </span>
              <h4 className="text-sm font-black text-[#102A43] truncate leading-tight">
                {usuario?.nombre || 'Usuario'}
              </h4>
              <span className="inline-block text-[10px] font-bold text-[#334E68] bg-white px-2.5 py-0.5 rounded-full border border-[#9FB3C8]/40 mt-1 shadow-sm">
                {usuario?.rol === 'ADMIN' ? 'Admin Global' : 'Inversionista'}
              </span>
            </div>
          </div>

          {/* Menú de Navegación Vertical en Cápsulas */}
          <nav className="space-y-1.5">
            <span className="text-[10px] font-black text-[#627D98] uppercase tracking-wider px-3 mb-1 block">
              Menú Principal
            </span>

            {enlaces.map((item) => (
              <NavLink
                key={item.ruta}
                to={item.ruta}
                onClick={onCerrar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#102A43] text-[#BFA37C] shadow-md shadow-[#102A43]/20 translate-x-1 ring-1 ring-[#BFA37C]/30'
                      : 'text-[#334E68] hover:text-[#102A43] hover:bg-[#F3EEE6]/70'
                  }`
                }
              >
                {item.icono}
                <span>{item.nombre}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Tarjeta de Estado del Sistema en el Fondo del Dock */}
        <div className="p-4 bg-[#F3EEE6]/70 rounded-2.5xl border border-[#9FB3C8]/30 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-[#102A43]">
              <span className="w-2 h-2 rounded-full bg-[#BFA37C] animate-pulse"></span>
              Moneda Oficial
            </span>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white text-[#102A43] border border-[#9FB3C8]/40 shadow-sm">
              Soles (S/.)
            </span>
          </div>
          <p className="text-[11px] text-[#627D98] leading-tight">
            Saldos protegidos en céntimos enteros auditables.
          </p>
        </div>
      </aside>
    </>
  );
}

export default BarraLateral;
