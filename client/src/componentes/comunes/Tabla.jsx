import React from 'react';
import EstadoVacio from './EstadoVacio.jsx';

/**
 * Tabla de datos genérica responsiva adaptada a la estética Soft Floating UI.
 * Paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Fondo blanco, esquinas rounded-3xl, encabezados en #102A43 y bordes en #9FB3C8/30.
 * @param {{
 *   columnas: Array<{
 *     encabezado: string,
 *     clave?: string,
 *     alineacion?: 'left' | 'center' | 'right',
 *     render?: (fila: any, indice: number) => React.ReactNode
 *   }>,
 *   datos: any[],
 *   cargando?: boolean,
 *   mensajeVacio?: string,
 *   accionVacio?: () => void,
 *   textoBotonVacio?: string
 * }} props
 */
export function Tabla({
  columnas = [],
  datos = [],
  cargando = false,
  mensajeVacio = 'No hay registros disponibles',
  accionVacio,
  textoBotonVacio
}) {
  return (
    <div className="w-full bg-white rounded-3xl border border-[#9FB3C8]/30 shadow-flotante overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F3EEE6]/70 border-b border-[#9FB3C8]/30">
              {columnas.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-4 text-xs font-black text-[#102A43] uppercase tracking-wider ${
                    col.alineacion === 'right'
                      ? 'text-right'
                      : col.alineacion === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#9FB3C8]/20 text-sm">
            {cargando ? (
              Array.from({ length: 5 }).map((_, filaIdx) => (
                <tr key={filaIdx} className="animate-pulse">
                  {columnas.map((_, colIdx) => (
                    <td key={colIdx} className="px-5 py-4">
                      <div className="h-4 bg-[#F3EEE6] rounded-full w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : datos.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="p-8 text-center">
                  <EstadoVacio
                    mensaje={mensajeVacio}
                    accionBoton={accionVacio}
                    textoBoton={textoBotonVacio}
                  />
                </td>
              </tr>
            ) : (
              datos.map((fila, filaIdx) => (
                <tr
                  key={fila._id || fila.id || filaIdx}
                  className="hover:bg-[#F3EEE6]/40 transition-colors duration-150 group"
                >
                  {columnas.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-5 py-4 text-[#102A43] font-medium ${
                        col.alineacion === 'right'
                          ? 'text-right'
                          : col.alineacion === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(fila, filaIdx) : fila[col.clave] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tabla;
