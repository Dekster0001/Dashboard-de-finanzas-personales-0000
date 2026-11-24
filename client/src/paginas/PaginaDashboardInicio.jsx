import React from 'react';
import { useAuth } from '../contexto/ContextoAuth.jsx';
import { Link } from 'react-router-dom';

/**
 * Vista de Bienvenida del Dashboard.
 * Presenta el estado de autenticación y accesos directos al usuario.
 */
export function PaginaDashboardInicio() {
  const { usuario } = useAuth();

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md mb-3">
            ✨ Control Financiero Personal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ¡Hola, {usuario?.nombre || 'Usuario'}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Bienvenido a tu panel de control de finanzas personales. Aquí puedes organizar y monitorear tus ingresos,
            gastos, presupuestos y medios de pago en Soles (S/.) de forma fácil y segura.
          </p>
        </div>
      </div>

      {/* Tarjetas informativas de acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-3">
            💳
          </div>
          <h3 className="text-sm font-bold text-slate-800">Cuentas y Medios</h3>
          <p className="text-xs text-slate-500 mt-1">Registra bancos, efectivo y billeteras digitales.</p>
          <Link to="/cuentas" className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700">
            Gestionar Cuentas →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">
            🏷️
          </div>
          <h3 className="text-sm font-bold text-slate-800">Categorías</h3>
          <p className="text-xs text-slate-500 mt-1">Clasifica tus entradas y salidas con colores e iconos.</p>
          <Link to="/categorias" className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700">
            Ver Categorías →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg mb-3">
            📊
          </div>
          <h3 className="text-sm font-bold text-slate-800">Movimientos</h3>
          <p className="text-xs text-slate-500 mt-1">Historial filtrado por fechas, tipo y categorías.</p>
          <Link to="/movimientos" className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700">
            Historial de Gastos →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg mb-3">
            🎯
          </div>
          <h3 className="text-sm font-bold text-slate-800">Presupuesto</h3>
          <p className="text-xs text-slate-500 mt-1">Monitorea tu límite mensual con semáforo inteligente.</p>
          <Link to="/presupuesto" className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700">
            Monitorear Avance →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaginaDashboardInicio;
