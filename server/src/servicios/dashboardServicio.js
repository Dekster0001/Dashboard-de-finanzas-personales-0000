import { dashboardRepositorio } from '../repositorios/dashboardRepositorio.js';
import { obtenerRangoMesUTC, obtenerUltimos6Meses } from '../utils/fechas.js';

/**
 * Servicio de lógica de negocio para el Dashboard Financiero (HU-08).
 * Entrega indicadores consolidados, distribución de gastos y tendencias temporales.
 * Si un usuario no registra movimientos, devuelve 0 o arreglos vacíos sin arrojar errores.
 */
class DashboardServicio {
  /**
   * Obtiene los indicadores KPI del mes (ingresos, gastos, balance neto y patrimonio total).
   * @param {string} usuarioId
   * @param {string} [mes] - Mes a consultar en formato AAAA-MM
   */
  async obtenerResumen(usuarioId, mes) {
    const { inicioMes, finMes, mesNormalizado } = obtenerRangoMesUTC(mes);

    // Consulta acumulados de ingresos y gastos del mes
    const { ingresosEnCentavos, gastosEnCentavos } =
      await dashboardRepositorio.obtenerTotalesPorTipo(usuarioId, inicioMes, finMes);

    // Consulta patrimonio total acumulado en todas las cuentas activas
    const patrimonioTotalEnCentavos =
      await dashboardRepositorio.obtenerPatrimonioTotal(usuarioId);

    const balanceNetoEnCentavos = ingresosEnCentavos - gastosEnCentavos;

    return {
      mes: mesNormalizado,
      ingresosEnCentavos,
      gastosEnCentavos,
      balanceNetoEnCentavos,
      patrimonioTotalEnCentavos
    };
  }

  /**
   * Obtiene los gastos agrupados por categoría para la visualización del gráfico de dona.
   * @param {string} usuarioId
   * @param {string} [mes]
   */
  async obtenerGastosPorCategoria(usuarioId, mes) {
    const { inicioMes, finMes } = obtenerRangoMesUTC(mes);

    const categoriasAgrupadas = await dashboardRepositorio.obtenerGastosPorCategoria(
      usuarioId,
      inicioMes,
      finMes
    );

    if (!categoriasAgrupadas || categoriasAgrupadas.length === 0) {
      return [];
    }

    const gastoTotalMes = categoriasAgrupadas.reduce(
      (acumulado, cat) => acumulado + cat.totalEnCentavos,
      0
    );

    return categoriasAgrupadas.map(cat => ({
      categoria: cat.categoria,
      color: cat.color,
      totalEnCentavos: cat.totalEnCentavos,
      porcentaje:
        gastoTotalMes > 0
          ? Number(((cat.totalEnCentavos / gastoTotalMes) * 100).toFixed(2))
          : 0
    }));
  }

  /**
   * Obtiene la tendencia de ingresos y gastos para los últimos 6 meses continuos (gráfico de barras/línea).
   * Siempre devuelve exactamente 6 elementos cronológicos, garantizando ceros en meses sin actividad.
   * @param {string} usuarioId
   * @param {string} [mesBase]
   */
  async obtenerTendenciaMensual(usuarioId, mesBase) {
    const { meses, inicioRango, finRango } = obtenerUltimos6Meses(mesBase);

    const filasAgrupadas = await dashboardRepositorio.obtenerAgrupacion6Meses(
      usuarioId,
      inicioRango,
      finRango
    );

    // Inicializar los 6 meses con ceros
    const mapaMeses = {};
    for (const m of meses) {
      mapaMeses[m] = {
        mes: m,
        ingresosEnCentavos: 0,
        gastosEnCentavos: 0
      };
    }

    // Incorporar resultados de la base de datos
    for (const fila of filasAgrupadas) {
      const mesRegistro = fila._id?.mes;
      const tipo = fila._id?.tipo;
      if (mesRegistro && mapaMeses[mesRegistro]) {
        if (tipo === 'INGRESO') {
          mapaMeses[mesRegistro].ingresosEnCentavos = fila.totalEnCentavos;
        } else if (tipo === 'GASTO') {
          mapaMeses[mesRegistro].gastosEnCentavos = fila.totalEnCentavos;
        }
      }
    }

    return meses.map(m => mapaMeses[m]);
  }
}

export const dashboardServicio = new DashboardServicio();
export default dashboardServicio;
