import React from 'react';
import { Line } from 'react-chartjs-2';
import './configuracionGraficos.js';
import dayjs from 'dayjs';
import { formatearCentavosAMoneda } from '../../utils/formato.js';

/**
 * Gráfico de Línea de Tendencia Semestral (últimos 6 meses continuos).
 * Adaptado a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Línea de ingresos en oro noble (#BFA37C), línea de gastos en azul pizarra acero (#334E68),
 * tooltip en azul tinta (#102A43) y fondo en tarjeta flotante blanca.
 * @param {{
 *   datos: Array<{
 *     mes: string,
 *     ingresosEnCentavos: number,
 *     gastosEnCentavos: number
 *   }>
 * }} props
 */
export function GraficoLinea({ datos = [] }) {
  const sinDatos =
    !datos ||
    datos.length === 0 ||
    datos.every((d) => d.ingresosEnCentavos === 0 && d.gastosEnCentavos === 0);

  const etiquetas = datos.map((d) => {
    return dayjs(d.mes).format('MMM YYYY');
  });

  const data = {
    labels: etiquetas,
    datasets: [
      {
        label: 'Ingresos (+)',
        data: datos.map((d) => d.ingresosEnCentavos / 100),
        borderColor: '#BFA37C',
        backgroundColor: 'rgba(191, 163, 124, 0.14)',
        fill: true,
        tension: 0.42,
        borderWidth: 3,
        pointBackgroundColor: '#BFA37C',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Gastos (-)',
        data: datos.map((d) => d.gastosEnCentavos / 100),
        borderColor: '#334E68',
        backgroundColor: 'rgba(51, 78, 104, 0.08)',
        fill: true,
        tension: 0.42,
        borderWidth: 2.5,
        pointBackgroundColor: '#334E68',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          font: { size: 12, family: 'Inter', weight: '700' },
          color: '#102A43'
        }
      },
      tooltip: {
        backgroundColor: '#102A43',
        titleColor: '#FFFFFF',
        bodyColor: '#9FB3C8',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 14,
        callbacks: {
          label: (contexto) => {
            const valorDecimal = contexto.raw;
            const centavos = Math.round(valorDecimal * 100);
            return ` ${contexto.dataset.label}: ${formatearCentavosAMoneda(centavos)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (valor) => `S/. ${valor.toLocaleString('es-PE')}`,
          font: { size: 11, family: 'Inter' },
          color: '#627D98'
        },
        grid: {
          color: 'rgba(159, 179, 200, 0.25)'
        }
      },
      x: {
        ticks: {
          font: { size: 11, family: 'Inter', weight: '600' },
          color: '#627D98'
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-flotante border border-white/90 hover:shadow-flotante-hover transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#102A43]">
            Tendencia Histórica Semestral
          </h3>
          <p className="text-xs text-[#627D98] mt-0.5 font-medium">
            Comparativa cronológica de ingresos versus egresos en los últimos 6 meses continuos.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-[#BFA37C]"></span>
          <span className="text-xs font-bold text-[#627D98]">Ingresos</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#334E68] ml-2"></span>
          <span className="text-xs font-bold text-[#627D98]">Gastos</span>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        {sinDatos ? (
          <div className="h-full flex items-center justify-center text-xs text-[#627D98]">
            No hay transacciones registradas en este semestre para graficar la tendencia.
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}

export default GraficoLinea;
