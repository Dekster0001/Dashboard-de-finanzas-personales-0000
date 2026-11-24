import React from 'react';
import { formatearCentavosAMoneda } from '../../utils/formato.js';
import { Link } from 'react-router-dom';
import AnilloProgresoRadial from './AnilloProgresoRadial.jsx';

/**
 * Control y Telemetría de Presupuesto con Anillo Radial.
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Anillo Radial SVG con porcentaje central, semáforo en oro/bronce (#BFA37C),
 * cifras en azul tinta (#102A43) y viñetas de control financiero.
 * @param {{
 *   presupuesto?: {
 *     limiteEnCentavos: number,
 *     gastadoEnCentavos: number,
 *     disponibleEnCentavos: number,
 *     porcentajeConsumido: number,
 *     estado: string
 *   },
 *   mes: string
 * }} props
 */
export function BarraProgresoPresupuesto({ presupuesto, mes }) {
  const limite = presupuesto?.limiteEnCentavos ?? 0;
  const gastado = presupuesto?.gastadoEnCentavos ?? 0;
  const disponible = presupuesto?.disponibleEnCentavos ?? 0;
  const porcentaje = presupuesto?.porcentajeConsumido ?? 0;
  const estado = presupuesto?.estado || 'SIN_PRESUPUESTO';

  let badgeClase = 'bg-[#F3EEE6] text-[#BFA37C] border-[#9FB3C8]/40';
  let colorTrazo = '#BFA37C';

  if (estado === 'EXCEDIDO') {
    colorTrazo = '#BE123C';
    badgeClase = 'bg-rose-50 text-[#BE123C] border-rose-200 animate-pulse';
  } else if (estado === 'ALERTA') {
    colorTrazo = '#D97706';
    badgeClase = 'bg-amber-50 text-[#D97706] border-amber-200';
  } else if (estado === 'OK') {
    colorTrazo = '#BFA37C';
    badgeClase = 'bg-[#F3EEE6] text-[#102A43] border-[#BFA37C]/40';
  } else if (estado === 'SIN_PRESUPUESTO') {
    colorTrazo = '#9FB3C8';
    badgeClase = 'bg-slate-100 text-[#627D98] border-slate-200';
  }

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-flotante border border-white/90 hover:shadow-flotante-hover transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-black text-[#102A43]">
              Telemetría y Control de Presupuesto
            </h3>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeClase}`}
            >
              {estado === 'SIN_PRESUPUESTO' ? 'Sin Límite' : `Semáforo: ${estado}`}
            </span>
          </div>
          <p className="text-xs text-[#627D98] mt-0.5 font-medium">
            Monitoreo en tiempo real del límite planificado frente a tus egresos del mes
          </p>
        </div>

        <Link
          to={`/presupuesto?mes=${mes}`}
          className="text-xs font-bold text-[#102A43] hover:text-black bg-[#F3EEE6] hover:bg-[#EAE4DC] px-4 py-2 rounded-full border border-[#9FB3C8]/40 transition-all self-start sm:self-auto shadow-sm"
        >
          {limite > 0 ? 'Gestionar Presupuesto →' : 'Definir Presupuesto →'}
        </Link>
      </div>

      {limite > 0 ? (
        <div className="pt-6 flex flex-col md:flex-row items-center justify-around gap-6">
          {/* Anillo Radial SVG de Avance */}
          <div className="flex flex-col items-center justify-center">
            <AnilloProgresoRadial
              porcentaje={porcentaje}
              tituloCentro={`${porcentaje}%`}
              subtituloCentro="Consumido"
              tamano={140}
              grosor={13}
              color={colorTrazo}
              colorPista="#EAE4DC"
              estado={estado}
            />
          </div>

          {/* Tarjetas de Métricas Clave y Puntos de Estado */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Límite */}
            <div className="bg-[#F3EEE6]/60 p-4 rounded-2.5xl border border-[#9FB3C8]/30 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BFA37C]"></span>
                <span className="text-xs font-black text-[#627D98] uppercase tracking-wider">
                  Presupuesto
                </span>
              </div>
              <span className="text-xl font-black font-mono text-[#102A43]">
                {formatearCentavosAMoneda(limite)}
              </span>
              <span className="text-[11px] text-[#627D98] mt-1 font-medium">
                Techo planificado
              </span>
            </div>

            {/* Gastado */}
            <div className="bg-[#F3EEE6]/60 p-4 rounded-2.5xl border border-[#9FB3C8]/30 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BE123C]"></span>
                <span className="text-xs font-black text-[#627D98] uppercase tracking-wider">
                  Gastado
                </span>
              </div>
              <span className="text-xl font-black font-mono text-[#BE123C]">
                {formatearCentavosAMoneda(gastado)}
              </span>
              <span className="text-[11px] text-[#627D98] mt-1 font-medium">
                Egresos acumulados
              </span>
            </div>

            {/* Saldo Disponible */}
            <div className="bg-[#F3EEE6]/60 p-4 rounded-2.5xl border border-[#9FB3C8]/30 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    disponible >= 0 ? 'bg-[#0D9488]' : 'bg-[#BE123C]'
                  }`}
                ></span>
                <span className="text-xs font-black text-[#627D98] uppercase tracking-wider">
                  Disponible
                </span>
              </div>
              <span
                className={`text-xl font-black font-mono ${
                  disponible >= 0 ? 'text-[#0D9488]' : 'text-[#BE123C]'
                }`}
              >
                {formatearCentavosAMoneda(disponible)}
              </span>
              <span className="text-[11px] text-[#627D98] mt-1 font-medium">
                {disponible >= 0 ? 'Margen libre' : 'Déficit del mes'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[#627D98] bg-[#F3EEE6]/50 rounded-2.5xl border border-dashed border-[#9FB3C8]/40 mt-4">
          No hay un presupuesto mensual establecido para este periodo. Define un límite en Soles (S/.) para habilitar el seguimiento del semáforo.
        </div>
      )}
    </div>
  );
}

export default BarraProgresoPresupuesto;
