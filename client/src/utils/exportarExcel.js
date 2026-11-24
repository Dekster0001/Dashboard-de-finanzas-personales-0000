import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

/**
 * Exporta un listado de movimientos a una hoja de cálculo Excel (.xlsx) usando SheetJS.
 * Solo exporta si existen registros con los filtros activos.
 * Montos en decimal con dos dígitos y fechas formateadas con Day.js.
 * @param {any[]} movimientos - Lista de movimientos filtrados
 * @param {string} [nombreArchivo='Movimientos_Financieros']
 */
export function exportarMovimientosAExcel(movimientos = [], nombreArchivo = 'Movimientos_Financieros') {
  // Validación de borde (HU-09 E4): No generar archivo si no hay datos
  if (!movimientos || movimientos.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'No hay datos para exportar',
      text: 'No se encontraron movimientos registrados con los filtros aplicados para generar el archivo Excel.',
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  try {
    // Mapeo estructurado con montos decimales (HU-09 E1)
    const filas = movimientos.map((m) => {
      const fechaFormateada = m.fecha ? dayjs(m.fecha).format('DD/MM/YYYY') : '-';
      const montoDecimal = typeof m.montoEnCentavos === 'number'
        ? Number((m.montoEnCentavos / 100).toFixed(2))
        : 0;

      return {
        Fecha: fechaFormateada,
        Tipo: m.tipo || 'GASTO',
        Categoría: m.categoriaId?.nombre || 'Sin Categoría',
        Cuenta: m.cuentaId?.nombre || 'General',
        Descripción: m.descripcion || '-',
        'Monto (S/.)': montoDecimal
      };
    });

    // Crear hoja y libro con SheetJS
    const hoja = XLSX.utils.json_to_sheet(filas);

    // Ajustar ancho visual de columnas para legibilidad
    hoja['!cols'] = [
      { wch: 14 }, // Fecha
      { wch: 12 }, // Tipo
      { wch: 22 }, // Categoría
      { wch: 22 }, // Cuenta
      { wch: 32 }, // Descripción
      { wch: 14 }  // Monto (S/.)
    ];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Movimientos');

    // Descarga del archivo en el cliente
    const marcaTiempo = dayjs().format('YYYYMMDD_HHmm');
    XLSX.writeFile(libro, `${nombreArchivo}_${marcaTiempo}.xlsx`);

    toast.success('Archivo Excel generado y descargado exitosamente.');
  } catch (error) {
    // Manejo de excepciones (HU-09 E3)
    console.error('Error durante la exportación a Excel:', error);
    toast.error('Ocurrió un error inesperado al generar el archivo Excel.');
  }
}

export default exportarMovimientosAExcel;
