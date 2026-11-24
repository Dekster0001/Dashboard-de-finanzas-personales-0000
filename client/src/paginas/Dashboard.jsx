import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import clienteApi from '../api/clienteApi.js';
import { useAuth } from '../contexto/ContextoAuth.jsx';
import { Link } from 'react-router-dom';

import TarjetaKpi from '../componentes/dashboard/TarjetaKpi.jsx';
import BarraProgresoPresupuesto from '../componentes/dashboard/BarraProgresoPresupuesto.jsx';
import GraficoBarras from '../componentes/dashboard/GraficoBarras.jsx';
import GraficoDona from '../componentes/dashboard/GraficoDona.jsx';
import GraficoLinea from '../componentes/dashboard/GraficoLinea.jsx';
import EstadoVacio from '../componentes/comunes/EstadoVacio.jsx';
import { formatearCentavosAMoneda } from '../utils/formato.js';

dayjs.locale('es');

/**
 * Pantalla Principal del Dashboard Financiero Ejecutivo (HU-08).
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Tarjetas blancas flotantes (#FFFFFF) con esquinas redondeadas (rounded-3xl),
 * sombras difusas sobre lienzo marfil (#F3EEE6) y Bento Grid analítico.
 */
export function Dashboard() {
  const { usuario } = useAuth();
  const [mes, setMes] = useState(dayjs().format('YYYY-MM'));

  // Estados de datos analíticos
  const [resumen, setResumen] = useState(null);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);
  const [tendenciaMensual, setTendenciaMensual] = useState([]);
  const [presupuesto, setPresupuesto] = useState(null);

  // Estados de interfaz
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  // Carga asíncrona de datos analíticos
  const cargarDatosDashboard = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga('');

      // Consultas concurrentes a los endpoints analíticos
      const [resResumen, resPorCategoria, resTendencia, resPresupuesto] = await Promise.all([
        clienteApi.get('/dashboard/resumen', { params: { mes } }),
        clienteApi.get('/dashboard/por-categoria', { params: { mes } }),
        clienteApi.get('/dashboard/tendencia-mensual', { params: { mes } }),
        clienteApi.get(`/presupuestos/${mes}`)
      ]);

      setResumen(resResumen.data.datos);
      setGastosPorCategoria(resPorCategoria.data.datos || []);
      setTendenciaMensual(resTendencia.data.datos || []);
      setPresupuesto(resPresupuesto.data.datos);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setErrorCarga(
        error.response?.data?.mensaje ||
          'No se pudo conectar con el servidor para obtener los datos del dashboard.'
      );
    } finally {
      setCargando(false);
    }
  }, [mes]);

  // Actualización reactiva al cambiar el selector de mes (HU-08 E2)
  useEffect(() => {
    cargarDatosDashboard();
  }, [cargarDatosDashboard]);

  // Detección de usuario nuevo sin datos (HU-08 E4)
  const esUsuarioNuevo =
    !cargando &&
    resumen &&
    resumen.ingresosEnCentavos === 0 &&
    resumen.gastosEnCentavos === 0 &&
    resumen.patrimonioTotalEnCentavos === 0 &&
    (!presupuesto || presupuesto.limiteEnCentavos === 0);

  return (
    <div className="space-y-6">
      {/* Cabecera Principal con Selector de Mes en Cápsula Flotante */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#102A43]">
              Resumen Ejecutivo
            </h1>
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-[#F3EEE6] text-[#102A43] border border-[#9FB3C8]/40 shadow-sm">
              SaaS Multiinquilino
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#627D98] mt-1 font-medium">
            Indicadores patrimoniales y comportamiento analítico para{' '}
            <span className="font-bold text-[#102A43] capitalize">
              {dayjs(mes).format('MMMM YYYY')}
            </span>
          </p>
        </div>

        {/* Selector de Mes Flotante estilo cápsula */}
        <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full shadow-flotante border border-white/90 self-start md:self-auto">
          <span className="text-xs font-black text-[#627D98] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#BFA37C]" />
            Mes:
          </span>
          <input
            id="selectorMes"
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="text-xs sm:text-sm font-black text-[#102A43] outline-none bg-transparent cursor-pointer font-mono"
          />
        </div>
      </div>

      {/* Manejo de Error con Botón Reintentar (HU-08 E3) */}
      {errorCarga ? (
        <div className="bg-white border border-rose-200 p-8 rounded-3xl text-center space-y-4 shadow-flotante">
          <div className="w-12 h-12 bg-rose-50 text-[#BE123C] rounded-2xl mx-auto flex items-center justify-center text-xl border border-rose-200">
            ⚠️
          </div>
          <h3 className="text-base font-bold text-[#102A43]">Error de Comunicación</h3>
          <p className="text-xs sm:text-sm text-[#627D98] max-w-md mx-auto font-medium">{errorCarga}</p>
          <div>
            <button
              type="button"
              onClick={cargarDatosDashboard}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all"
            >
              Reintentar Conexión
            </button>
          </div>
        </div>
      ) : esUsuarioNuevo ? (
        /* Estado Vacío para Usuario Nuevo (HU-08 E4) */
        <div className="space-y-6">
          <EstadoVacio
            titulo={`¡Bienvenido a tu Dashboard, ${usuario?.nombre || 'Usuario'}!`}
            mensaje="Aún no tienes movimientos registrados en este período. Comienza registrando tu primera cuenta o tu primer ingreso para activar las métricas y gráficos interactivos."
            icono={<span>🚀</span>}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Link
              to="/cuentas"
              className="p-6 bg-white rounded-3xl shadow-flotante border border-white/90 text-center hover:shadow-flotante-hover hover:-translate-y-1 transition-all group"
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">💳</span>
              <span className="text-sm font-bold text-[#102A43] block">1. Registrar Cuenta</span>
              <span className="text-xs text-[#627D98] mt-1 block font-medium">
                Define tus bancos (BCP, BBVA, Interbank), efectivo o billeteras (Yape/Plin).
              </span>
            </Link>

            <Link
              to="/movimientos"
              className="p-6 bg-white rounded-3xl shadow-flotante border border-white/90 text-center hover:shadow-flotante-hover hover:-translate-y-1 transition-all group"
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">📝</span>
              <span className="text-sm font-bold text-[#102A43] block">2. Registrar Movimiento</span>
              <span className="text-xs text-[#627D98] mt-1 block font-medium">
                Añade tus entradas y salidas de dinero con cálculo exacto en céntimos.
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Tarjetas KPI Flotantes (HU-08 E1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {cargando ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-36 bg-white rounded-3xl p-6 shadow-flotante animate-pulse" />
              ))
            ) : (
              <>
                <TarjetaKpi
                  titulo="Patrimonio Total"
                  valor={formatearCentavosAMoneda(resumen?.patrimonioTotalEnCentavos || 0)}
                  subtitulo="Total acumulado en bancos y billeteras"
                  variante="patrimonio"
                  icono={<span>🏦</span>}
                />

                <TarjetaKpi
                  titulo="Ingresos del Mes"
                  valor={formatearCentavosAMoneda(resumen?.ingresosEnCentavos || 0)}
                  subtitulo={`Entradas en ${dayjs(mes).format('MMMM')}`}
                  variante="ingreso"
                  icono={<span>📈</span>}
                />

                <TarjetaKpi
                  titulo="Gastos del Mes"
                  valor={formatearCentavosAMoneda(resumen?.gastosEnCentavos || 0)}
                  subtitulo={`Egresos en ${dayjs(mes).format('MMMM')}`}
                  variante="gasto"
                  icono={<span>📉</span>}
                />

                <TarjetaKpi
                  titulo="Balance Neto"
                  valor={formatearCentavosAMoneda(resumen?.balanceNetoEnCentavos || 0)}
                  subtitulo={
                    (resumen?.balanceNetoEnCentavos || 0) >= 0 ? 'Superávit mensual' : 'Déficit mensual'
                  }
                  variante="balance"
                  icono={<span>⚖️</span>}
                />

                <TarjetaKpi
                  titulo="Presupuesto"
                  valor={`${presupuesto?.porcentajeConsumido ?? 0} %`}
                  subtitulo={
                    presupuesto?.limiteEnCentavos > 0
                      ? `Límite: ${formatearCentavosAMoneda(presupuesto.limiteEnCentavos)}`
                      : 'Sin presupuesto fijado'
                  }
                  variante="presupuesto"
                  badge={presupuesto?.estado}
                  badgeClase={
                    presupuesto?.estado === 'EXCEDIDO'
                      ? 'bg-rose-50 text-[#BE123C] border-rose-200'
                      : presupuesto?.estado === 'ALERTA'
                      ? 'bg-amber-50 text-[#D97706] border-amber-200'
                      : 'bg-[#F3EEE6] text-[#102A43] border-[#9FB3C8]/40'
                  }
                  icono={<span>🎯</span>}
                />
              </>
            )}
          </div>

          {/* Medidor Radial y Telemetría de Presupuesto */}
          {!cargando && (
            <BarraProgresoPresupuesto presupuesto={presupuesto} mes={mes} />
          )}

          {/* Grilla de Visualizaciones con Chart.js en Bento Grid (HU-08 E1) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {cargando ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 bg-white rounded-3xl p-6 shadow-flotante animate-pulse" />
              ))
            ) : (
              <>
                {/* 1. Gráfico de Barras con puntas redondeadas */}
                <GraficoBarras
                  ingresosEnCentavos={resumen?.ingresosEnCentavos || 0}
                  gastosEnCentavos={resumen?.gastosEnCentavos || 0}
                />

                {/* 2. Gráfico de Dona con corte amplio */}
                <GraficoDona datos={gastosPorCategoria} />

                {/* 3. Gráfico de Línea Semestral */}
                <div className="lg:col-span-2">
                  <GraficoLinea datos={tendenciaMensual} />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
