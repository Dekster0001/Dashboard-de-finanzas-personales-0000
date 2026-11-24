import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { formatearCentavosAMoneda } from './formato.js';

/**
 * Genera y descarga un reporte ejecutivo tabulado en PDF utilizando jsPDF y jspdf-autotable.
 * Incluye título institucional, período consultado, tabla formateada y caja de totales.
 * @param {any[]} movimientos - Lista de movimientos filtrados
 * @param {string} [periodoTexto='Período Seleccionado'] - Texto explicativo del período o filtros
 * @param {string} [nombreArchivo='Reporte_Movimientos']
 */
export function exportarMovimientosAPdf(
  movimientos = [],
  periodoTexto = 'Período Seleccionado',
  nombreArchivo = 'Reporte_Movimientos'
) {
  // Validación de borde (HU-09 E4): No generar archivo en blanco si no hay registros
  if (!movimientos || movimientos.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'No hay datos para exportar',
      text: 'No se encontraron movimientos con los filtros aplicados para generar el reporte en PDF.',
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  try {
    // Cálculo de totales financieros (HU-09 E2)
    let totalIngresosCentavos = 0;
    let totalGastosCentavos = 0;

    for (const m of movimientos) {
      if (m.tipo === 'INGRESO') {
        totalIngresosCentavos += m.montoEnCentavos || 0;
      } else if (m.tipo === 'GASTO') {
        totalGastosCentavos += m.montoEnCentavos || 0;
      }
    }

    const balanceNetoCentavos = totalIngresosCentavos - totalGastosCentavos;

    // Inicializar documento PDF en formato A4 vertical
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // =========================================================================
    // ENCABEZADO INSTITUCIONAL
    // =========================================================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text('DASHBOARD DE FINANZAS PERSONALES', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text('Reporte Ejecutivo de Movimientos Financieros', 14, 24);

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    const fechaGeneracion = dayjs().format('DD/MM/YYYY HH:mm');
    doc.text(`Filtro / Período: ${periodoTexto}  |  Generado: ${fechaGeneracion}`, 14, 29);

    // Línea divisoria decorativa azul primario
    doc.setDrawColor(37, 99, 235); // Blue 600
    doc.setLineWidth(0.8);
    doc.line(14, 32, 196, 32);

    // =========================================================================
    // TABLA FORMATEADA CON AUTO-TABLE
    // =========================================================================
    const filasTabla = movimientos.map((m) => {
      const fecha = m.fecha ? dayjs(m.fecha).format('DD/MM/YYYY') : '-';
      const montoFormateado = (m.montoEnCentavos / 100).toFixed(2);
      const prefijo = m.tipo === 'INGRESO' ? '+ S/. ' : '- S/. ';

      return [
        fecha,
        m.tipo || 'GASTO',
        m.categoriaId?.nombre || 'General',
        m.cuentaId?.nombre || 'General',
        m.descripcion || '-',
        `${prefijo}${montoFormateado}`
      ];
    });

    autoTable(doc, {
      startY: 36,
      head: [['Fecha', 'Tipo', 'Categoría', 'Cuenta', 'Descripción', 'Monto (S/.)']],
      body: filasTabla,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8.5
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [51, 65, 85]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 18, fontStyle: 'bold' },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 52 },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    // =========================================================================
    // CAJA RESUMEN DE TOTALES
    // =========================================================================
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 100;
    const altoPagina = doc.internal.pageSize.getHeight();

    // Si no cabe la caja de totales al pie de la tabla, agregar página nueva
    let posY = finalY + 8;
    if (posY + 32 > altoPagina - 18) {
      doc.addPage();
      posY = 20;
    }

    // Fondo gris suave para la caja de totales
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, posY, 182, 26, 2, 2, 'FD');

    // Título de la caja
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('RESUMEN DEL REPORTE', 20, posY + 6.5);

    // Tres columnas con los totales
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    // 1. Ingresos
    doc.text('Total Ingresos:', 20, posY + 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); // Verde
    doc.text(`+ ${formatearCentavosAMoneda(totalIngresosCentavos)}`, 20, posY + 20);

    // 2. Gastos
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Total Gastos:', 85, posY + 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(244, 63, 94); // Rojo
    doc.text(`- ${formatearCentavosAMoneda(totalGastosCentavos)}`, 85, posY + 20);

    // 3. Balance Neto
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Balance Neto:', 150, posY + 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(balanceNetoCentavos >= 0 ? 37 : 244, balanceNetoCentavos >= 0 ? 99 : 63, balanceNetoCentavos >= 0 ? 235 : 94);
    doc.text(formatearCentavosAMoneda(balanceNetoCentavos), 150, posY + 20);

    // =========================================================================
    // PIE DE PÁGINA NUMERADO
    // =========================================================================
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text(
        'Dashboard de Finanzas Personales  |  Reporte Confidencial',
        14,
        altoPagina - 8
      );
      doc.text(
        `Página ${i} de ${totalPaginas}`,
        doc.internal.pageSize.getWidth() - 32,
        altoPagina - 8
      );
    }

    // Descarga del PDF en el cliente
    const marcaTiempo = dayjs().format('YYYYMMDD_HHmm');
    doc.save(`${nombreArchivo}_${marcaTiempo}.pdf`);

    toast.success('Reporte PDF generado y descargado exitosamente.');
  } catch (error) {
    // Manejo de errores inesperados (HU-09 E3)
    console.error('Error durante la generación de PDF:', error);
    toast.error('Ocurrió un error inesperado al generar el documento PDF.');
  }
}

export default exportarMovimientosAPdf;
