import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import './configuracionGraficos.js';
import { formatearCentavosAMoneda } from '../../utils/formato.js';

/**
 * Gráfico de Dona para visualizar la distribución porcentual de gastos por categoría.
 * Adaptado a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Recorte del 72% para una apariencia aireada, leyenda con viñetas legibles
 * y tooltip en azul tinta (#102A43).
 * @param {{
 *   datos: Array<{
 *     categoria: string,
 *     color: string,
 *     totalEnCentavos: number,
 *     porcentaje: number
 *   }>
 * }} props
 */
export function GraficoDona({ datos = [] }) {
  const sinDatos = !datos || datos.length === 0;

  // Paleta de respaldo elegante si la categoría no trae color
  const paletaDefecto = ['#BFA37C', '#334E68', '#102A43', '#0D9488', '#BE123C', '#9FB3C8'];

  const data = {
    labels: datos.map((d) => d.categoria),
    datasets: [
      {
        data: datos.map((d) => d.totalEnCentavos / 100),
        backgroundColor: datos.map((d, i) => d.color || paletaDefecto[i % paletaDefecto.length]),
        borderColor: '#FFFFFF',
        borderWidth: 3,
        hoverOffset: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 9,
          boxHeight: 9,
          usePointStyle: true,
          padding: 14,
          font: { size: 11, family: 'Inter', weight: '600' },
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
            const index = contexto.dataIndex;
            const item = datos[index];
            if (!item) return '';
            return ` ${item.categoria}: ${formatearCentavosAMoneda(item.totalEnCentavos)} (${item.porcentaje}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl shadow-flotante border border-white/90 hover:shadow-flotante-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#102A43]">
            Distribución de Gastos por Categoría
          </h3>
          <p className="text-xs text-[#627D98] mt-0.5 font-medium">
            Proporción de consumos clasificados por rubro en el mes.
          </p>
        </div>
      </div>

      <div className="h-64 w-full flex items-center justify-center">
        {sinDatos ? (
          <div className="text-xs text-[#627D98] text-center p-4">
            No hay gastos registrados en este mes para clasificar por categoría.
          </div>
        ) : (
          <Doughnut data={data} options={options} />
        )}
      </div>
    </div>
  );
}

export default GraficoDona;
