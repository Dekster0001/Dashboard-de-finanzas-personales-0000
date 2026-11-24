import React from 'react';
import Tabla from '../comunes/Tabla.jsx';
import { formatearCentavosAMoneda, formatearFecha } from '../../utils/formato.js';

/**
 * Tabla visual de movimientos financieros con soporte de edición y borrado.
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Píldoras de estado con puntos de color, texto legible en #102A43,
 * montos en fuente mono destacada y botones circulares de acción.
 * @param {{
 *   movimientos: any[],
 *   cargando?: boolean,
 *   alEditar: (movimiento: any) => void,
 *   alEliminar: (id: string) => void,
 *   alCrearPrimero?: () => void
 * }} props
 */
export function TablaMovimientos({
  movimientos = [],
  cargando = false,
  alEditar,
  alEliminar,
  alCrearPrimero
}) {
  const columnas = [
    {
      encabezado: 'Fecha',
      render: (m) => (
        <span className="font-bold text-[#102A43]">{formatearFecha(m.fecha)}</span>
      )
    },
    {
      encabezado: 'Tipo',
      render: (m) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            m.tipo === 'INGRESO'
              ? 'bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/30'
              : 'bg-rose-50 text-[#BE123C] border border-rose-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${m.tipo === 'INGRESO' ? 'bg-[#0D9488]' : 'bg-[#BE123C]'}`} />
          {m.tipo === 'INGRESO' ? '+' : '-'} {m.tipo}
        </span>
      )
    },
    {
      encabezado: 'Categoría',
      render: (m) => {
        const cat = m.categoriaId || {};
        return (
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
              style={{ backgroundColor: cat.color || '#BFA37C' }}
            />
            <span className="font-bold text-[#102A43]">{cat.nombre || 'Sin Categoría'}</span>
          </div>
        );
      }
    },
    {
      encabezado: 'Cuenta',
      render: (m) => (
        <span className="text-[#334E68] font-semibold px-3 py-1 bg-[#F3EEE6]/70 rounded-full border border-[#9FB3C8]/40 text-xs shadow-sm">
          {m.cuentaId?.nombre || 'General'}
        </span>
      )
    },
    {
      encabezado: 'Descripción',
      render: (m) => (
        <span className="text-[#627D98] text-xs sm:text-sm truncate max-w-xs block font-medium">
          {m.descripcion || '-'}
        </span>
      )
    },
    {
      encabezado: 'Monto (S/.)',
      alineacion: 'right',
      render: (m) => (
        <span
          className={`font-black font-mono text-sm tracking-tight ${
            m.tipo === 'INGRESO' ? 'text-[#0D9488]' : 'text-[#BE123C]'
          }`}
        >
          {m.tipo === 'INGRESO' ? '+ ' : '- '}
          {formatearCentavosAMoneda(m.montoEnCentavos)}
        </span>
      )
    },
    {
      encabezado: 'Acciones',
      alineacion: 'center',
      render: (m) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => alEditar(m)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#627D98] hover:text-[#102A43] hover:bg-[#F3EEE6] transition-colors"
            title="Editar movimiento"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => alEliminar(m._id || m.id)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#627D98] hover:text-[#BE123C] hover:bg-rose-50 transition-colors"
            title="Eliminar movimiento"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <Tabla
      columnas={columnas}
      datos={movimientos}
      cargando={cargando}
      mensajeVacio="No hay movimientos registrados para los filtros seleccionados."
      accionVacio={alCrearPrimero}
      textoBotonVacio="Registrar Primer Movimiento"
    />
  );
}

export default TablaMovimientos;
