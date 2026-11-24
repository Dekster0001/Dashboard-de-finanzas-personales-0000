import React from 'react';

/**
 * Componente de Anillo Radial de Progreso (Circular Radial Gauge).
 * Adaptado a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Pista suave en tono marfil (#EAE4DC), arco de avance en oro noble (#BFA37C)
 * y cifra central de alto contraste en azul tinta (#102A43).
 * @param {{
 *   porcentaje: number,
 *   tituloCentro: string | number,
 *   subtituloCentro?: string,
 *   tamano?: number,
 *   grosor?: number,
 *   color?: string,
 *   colorPista?: string,
 *   estado?: 'OK' | 'ALERTA' | 'EXCEDIDO' | 'SIN_PRESUPUESTO' | string
 * }} props
 */
export function AnilloProgresoRadial({
  porcentaje = 0,
  tituloCentro,
  subtituloCentro,
  tamano = 130,
  grosor = 11,
  color,
  colorPista = '#EAE4DC',
  estado = 'OK'
}) {
  const radio = (tamano - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const porcentajeSeguro = Math.max(0, Math.min(porcentaje, 100));
  const desplazamiento = circunferencia - (porcentajeSeguro / 100) * circunferencia;

  // Determinar color semántico armonizado con la paleta
  let colorTrazo = color || '#BFA37C';
  if (!color) {
    if (estado === 'EXCEDIDO') {
      colorTrazo = '#BE123C'; // Carmesí sobrio
    } else if (estado === 'ALERTA') {
      colorTrazo = '#D97706'; // Ámbar cálido
    } else if (estado === 'OK') {
      colorTrazo = '#BFA37C'; // Oro noble
    } else if (estado === 'SIN_PRESUPUESTO') {
      colorTrazo = '#9FB3C8'; // Gris pizarra suave
    }
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: tamano, height: tamano }}>
      <svg
        width={tamano}
        height={tamano}
        viewBox={`0 0 ${tamano} ${tamano}`}
        className="transform -rotate-90"
      >
        {/* Pista de fondo */}
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          stroke={colorPista}
          strokeWidth={grosor}
          fill="transparent"
          className="transition-colors duration-300"
        />

        {/* Anillo de progreso dinámico con puntas redondeadas */}
        <circle
          cx={tamano / 2}
          cy={tamano / 2}
          r={radio}
          stroke={colorTrazo}
          strokeWidth={grosor}
          strokeDasharray={circunferencia}
          strokeDashoffset={desplazamiento}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Contenido central centrado */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-2">
        <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[#102A43] leading-none">
          {tituloCentro}
        </span>
        {subtituloCentro && (
          <span className="text-[10px] sm:text-[11px] font-bold text-[#627D98] uppercase tracking-wider mt-1 leading-tight">
            {subtituloCentro}
          </span>
        )}
      </div>
    </div>
  );
}

export default AnilloProgresoRadial;
