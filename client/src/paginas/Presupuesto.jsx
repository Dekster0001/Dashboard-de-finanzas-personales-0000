import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import clienteApi from '../api/clienteApi.js';
import { toast } from 'react-toastify';
import Modal from '../componentes/comunes/Modal.jsx';
import CampoFormulario from '../componentes/comunes/CampoFormulario.jsx';
import AnilloProgresoRadial from '../componentes/dashboard/AnilloProgresoRadial.jsx';
import { formatearCentavosAMoneda, convertirDecimalACentavos } from '../utils/formato.js';

dayjs.locale('es');

/**
 * Pantalla de Control de Presupuesto Mensual y Semáforo Financiero (HU-07).
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Anillo circular radial SVG, tarjetas flotantes rounded-3xl sobre lienzo marfil (#F3EEE6),
 * acentos en oro noble (#BFA37C) y cifras en azul tinta (#102A43).
 */
export function Presupuesto() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mesParam = searchParams.get('mes');
  const [mesSeleccionado, setMesSeleccionado] = useState(
    mesParam && /^\d{4}-\d{2}$/.test(mesParam) ? mesParam : dayjs().format('YYYY-MM')
  );
  const [datosPresupuesto, setDatosPresupuesto] = useState(null);
  const [categoriasGasto, setCategoriasGasto] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal para fijar o modificar límite
  const [modalAbierto, setModalAbierto] = useState(false);
  const [montoDecimal, setMontoDecimal] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const cargarPresupuesto = async () => {
    try {
      setCargando(true);
      const [resPresupuesto, resCategorias] = await Promise.all([
        clienteApi.get(`/presupuestos/${mesSeleccionado}`),
        clienteApi.get('/dashboard/por-categoria', { params: { mes: mesSeleccionado } })
      ]);
      setDatosPresupuesto(resPresupuesto.data.datos);
      setCategoriasGasto(resCategorias.data.datos || []);
    } catch (error) {
      toast.error('Error al cargar la información del presupuesto.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setSearchParams({ mes: mesSeleccionado }, { replace: true });
    cargarPresupuesto();
  }, [mesSeleccionado]);

  const abrirModalPresupuesto = () => {
    if (datosPresupuesto && datosPresupuesto.limiteEnCentavos > 0) {
      setMontoDecimal((datosPresupuesto.limiteEnCentavos / 100).toFixed(2));
    } else {
      setMontoDecimal('2000.00');
    }
    setErrorModal('');
    setModalAbierto(true);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setErrorModal('');

    const montoLimiteEnCentavos = convertirDecimalACentavos(montoDecimal);

    if (montoLimiteEnCentavos <= 0) {
      setErrorModal('El monto límite debe ser mayor a 0.');
      return;
    }

    try {
      setGuardando(true);
      await clienteApi.put(`/presupuestos/${mesSeleccionado}`, {
        montoLimiteEnCentavos
      });
      toast.success('Presupuesto mensual actualizado exitosamente.');
      setModalAbierto(false);
      cargarPresupuesto();
    } catch (error) {
      setErrorModal(
        error.response?.data?.mensaje || 'Error al actualizar el presupuesto.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const porcentaje = datosPresupuesto?.porcentajeConsumido ?? 0;
  const estado = datosPresupuesto?.estado || 'SIN_PRESUPUESTO';
  const limite = datosPresupuesto?.limiteEnCentavos ?? 0;
  const gastado = datosPresupuesto?.gastadoEnCentavos ?? 0;
  const disponible = datosPresupuesto?.disponibleEnCentavos ?? 0;

  // Semáforo dinámico sobrio y elegante
  let colorPunto = 'bg-[#BFA37C]';
  let badgeClase = 'bg-[#F3EEE6] text-[#102A43] border-[#BFA37C]/40';
  let mensajeAlerta = null;

  if (estado === 'EXCEDIDO') {
    colorPunto = 'bg-[#BE123C]';
    badgeClase = 'bg-rose-50 text-[#BE123C] border-rose-200 animate-pulse';
    mensajeAlerta = '¡Alerta Crítica! Has superado el 100% del presupuesto asignado para este mes.';
  } else if (estado === 'ALERTA') {
    colorPunto = 'bg-[#D97706]';
    badgeClase = 'bg-amber-50 text-[#D97706] border-amber-200';
    mensajeAlerta = 'Atención: Has consumido el 80% o más de tu presupuesto mensual. Modera tus gastos.';
  } else if (estado === 'SIN_PRESUPUESTO') {
    colorPunto = 'bg-[#9FB3C8]';
    badgeClase = 'bg-slate-100 text-[#627D98] border-slate-200';
  }

  return (
    <div className="space-y-6">
      {/* Cabecera y Selector de Mes estilo Cápsula Flotante */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BFA37C] ring-4 ring-[#BFA37C]/20" />
            <span className="text-xs font-black uppercase tracking-wider text-[#627D98]">
              Control y Semáforo Presupuestario
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#102A43]">
            Presupuesto Mensual
          </h1>
          <p className="text-sm text-[#627D98] mt-0.5">
            Supervisa el avance de tus techos de gasto en Soles (S/.) con alertas preventivas.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-full shadow-flotante border border-white/90">
          <input
            type="month"
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="rounded-full border-none px-4 py-2 text-xs sm:text-sm text-[#102A43] outline-none bg-[#F3EEE6]/60 font-bold focus:ring-2 focus:ring-[#BFA37C]/20"
          />

          <button
            type="button"
            onClick={abrirModalPresupuesto}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all hover:shadow-lg"
          >
            {limite > 0 ? 'Modificar Límite' : 'Fijar Presupuesto'}
          </button>
        </div>
      </div>

      {/* Banner de Estado del Semáforo si hay alerta */}
      {mensajeAlerta && (
        <div
          className={`p-4 rounded-3xl border flex items-center gap-3.5 text-sm font-bold shadow-flotante ${
            estado === 'EXCEDIDO'
              ? 'bg-rose-50/90 text-[#BE123C] border-rose-200'
              : 'bg-amber-50/90 text-[#D97706] border-amber-200'
          }`}
        >
          <span className="text-2xl">⚠️</span>
          <span>{mensajeAlerta}</span>
        </div>
      )}

      {/* HERO CARD: Radial Gauge Ejecutivo */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-white/90 shadow-flotante relative overflow-hidden">
        {/* Glow sutil cálido de fondo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#BFA37C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Anillo Radial SVG con Porcentaje Centrado */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 bg-[#F3EEE6]/50 rounded-3xl border border-[#9FB3C8]/30 shadow-inner">
            <AnilloProgresoRadial
              porcentaje={porcentaje}
              tituloCentro={`${porcentaje}%`}
              subtituloCentro="del Límite"
              tamano={190}
              grosor={16}
              estado={estado}
            />
            <div className="mt-4 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${colorPunto} ring-4 ring-white`} />
              <span className={`text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-sm ${badgeClase}`}>
                Semáforo: {estado}
              </span>
            </div>
          </div>

          {/* Tres KPIs Flotantes */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#102A43]">
                  Resumen de Ejecución · {dayjs(mesSeleccionado).format('MMMM YYYY')}
                </h3>
                <p className="text-xs text-[#627D98]">
                  Cálculo basado en céntimos enteros auditables sin pérdida de precisión.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F3EEE6] text-[#334E68] border border-[#9FB3C8]/40 shadow-sm">
                Moneda: Sol Peruano (S/.)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Límite Planificado */}
              <div className="p-4 bg-[#F3EEE6]/60 rounded-2.5xl border border-[#9FB3C8]/30 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#BFA37C]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#627D98]">
                    Límite Asignado
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xl font-black font-mono text-[#102A43]">
                    {formatearCentavosAMoneda(limite)}
                  </span>
                  <span className="text-[11px] text-[#627D98] block mt-0.5">
                    Techo planificado
                  </span>
                </div>
              </div>

              {/* Gasto Acumulado */}
              <div className="p-4 bg-[#F3EEE6]/60 rounded-2.5xl border border-[#9FB3C8]/30 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#BE123C]" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#627D98]">
                    Gasto Consumido
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xl font-black font-mono text-[#BE123C]">
                    {formatearCentavosAMoneda(gastado)}
                  </span>
                  <span className="text-[11px] text-[#627D98] block mt-0.5">
                    Total egresos del mes
                  </span>
                </div>
              </div>

              {/* Saldo Disponible */}
              <div className="p-4 bg-[#F3EEE6]/60 rounded-2.5xl border border-[#9FB3C8]/30 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${disponible >= 0 ? 'bg-[#0D9488]' : 'bg-[#BE123C]'}`} />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#627D98]">
                    Margen Disponible
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className={`text-xl font-black font-mono ${
                      disponible >= 0 ? 'text-[#0D9488]' : 'text-[#BE123C]'
                    }`}
                  >
                    {formatearCentavosAMoneda(disponible)}
                  </span>
                  <span className="text-[11px] text-[#627D98] block mt-0.5">
                    {disponible >= 0 ? 'Remanente libre' : 'Déficit del mes'}
                  </span>
                </div>
              </div>
            </div>

            {/* Checklist de Estados Semáforo */}
            <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-[#334E68] font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BFA37C] ring-2 ring-[#BFA37C]/20" />
                <span>Consumo normal (&lt; 80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] ring-2 ring-amber-100" />
                <span>Alerta preventiva (80% a 100%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BE123C] ring-2 ring-rose-100" />
                <span>Límite excedido (&gt; 100%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose de Gastos que Consumen el Presupuesto */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-white/90 shadow-flotante space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-[#102A43]">
              Rubros que Consumen este Presupuesto
            </h3>
            <p className="text-xs text-[#627D98] mt-0.5">
              Impacto proporcional de cada categoría en el límite mensual de {dayjs(mesSeleccionado).format('MMMM YYYY')}.
            </p>
          </div>
          <Link
            to={`/movimientos?desde=${mesSeleccionado}-01&hasta=${dayjs(mesSeleccionado).endOf('month').format('YYYY-MM-DD')}&tipo=GASTO`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#102A43] hover:text-black bg-[#F3EEE6] hover:bg-[#EAE4DC] border border-[#9FB3C8]/40 px-4 py-2 rounded-full transition-all self-start sm:self-auto shadow-sm"
          >
            <span>Ver Movimientos en Historial</span>
            <span className="font-bold">→</span>
          </Link>
        </div>

        {categoriasGasto.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriasGasto.map((cat) => {
              const pctPresupuesto = limite > 0 ? ((cat.totalEnCentavos / limite) * 100).toFixed(1) : 0;
              return (
                <div
                  key={cat.categoriaId || cat.categoria}
                  className="p-4 bg-[#F3EEE6]/50 hover:bg-white rounded-2.5xl border border-[#9FB3C8]/30 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: cat.color || '#BFA37C' }}
                      />
                      <span className="text-xs font-bold text-[#102A43] truncate">
                        {cat.categoria}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-black text-[#102A43] flex-shrink-0">
                      {formatearCentavosAMoneda(cat.totalEnCentavos)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-full bg-[#9FB3C8]/20 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(cat.porcentaje, 100)}%`,
                          backgroundColor: cat.color || '#BFA37C'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#627D98] font-medium">
                      <span>{cat.porcentaje}% del total de gastos</span>
                      {limite > 0 && (
                        <span className="font-bold text-[#102A43]">
                          {pctPresupuesto}% del presupuesto
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#627D98] bg-[#F3EEE6]/40 rounded-2.5xl border border-dashed border-[#9FB3C8]/40">
            No hay gastos registrados en este mes todavía. Cuando registres transacciones de tipo GASTO, se mostrarán aquí y consumirán este presupuesto en tiempo real.
          </div>
        )}
      </div>

      {/* Modal para fijar o modificar límite */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={`Presupuesto en Soles para ${dayjs(mesSeleccionado).format('MMMM YYYY')}`}
      >
        <form onSubmit={manejarGuardar} className="space-y-4">
          {errorModal && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[#BE123C] text-xs font-semibold">
              {errorModal}
            </div>
          )}

          <CampoFormulario
            etiqueta="Monto Límite Mensual en Soles (S/.)"
            id="montoPresupuesto"
            tipo="number"
            step="0.01"
            min="0.01"
            requerido
            valor={montoDecimal}
            onChange={(e) => setMontoDecimal(e.target.value)}
            placeholder="Ej. 2500.00"
            ayuda="Define el monto máximo en Soles (S/.) que planeas gastar durante este mes."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#627D98] hover:text-[#102A43] hover:bg-[#F3EEE6] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar Presupuesto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Presupuesto;
