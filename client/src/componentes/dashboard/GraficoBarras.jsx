import React from 'react';
import { Bar } from 'react-chartjs-2';
import './configuracionGraficos.js';
import { formatearCentavosAMoneda } from '../../utils/formato.js';

/**
 * Gráfico de barras comparativo de Ingresos vs Gastos del mes.
 * Adaptado a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Barras con bordes redondeados (borderRadius: 14), colores sobrios
 * (Ingresos en verde bosque suave y Gastos en carmesí noble) y tarjeta flotante.
 * @param {{
 *   ingresosEnCentavos: number,
 *   gastosEnCentavos: number
 * }} props
 */
export function GraficoBarras({ ingresosEnCentavos = 0, gastosEnCentavos = 0 }) {
  const sinDatos = ingresosEnCentavos === 0 && gastosEnCentavos === 0;

  const data = {
    labels: ['Ingresos (+)', 'Gastos (-)'],
    datasets: [
      {
        label: 'Monto (S/.)',
        data: [ingresosEnCentavos / 100, gastosEnCentavos / 100],
        backgroundColor: ['rgba(13, 148, 136, 0.88)', 'rgba(190, 18, 60, 0.88)'],
        borderColor: ['#0D9488', '#BE123C'],
        borderWidth: 1.5,
        borderRadius: 14,
        borderSkipped: false,
        barThickness: 46
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
            return ` Total: ${formatearCentavosAMoneda(centavos)}`;
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
          font: { size: 12, family: 'Inter', weight: '700' },
          color: '#102A43'
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-flotante border border-white/90 hover:shadow-flotante-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#102A43]">
            Flujo Mensual: Ingresos vs Gastos
          </h3>
          <p className="text-xs text-[#627D98] mt-0.5 font-medium">
            Comparativa volumétrica directa de los fondos que ingresaron y salieron.
          </p>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        {sinDatos ? (
          <div className="h-full flex items-center justify-center text-xs text-[#627D98]">
            No hay transacciones registradas en este mes.
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
}

export default GraficoBarras;
