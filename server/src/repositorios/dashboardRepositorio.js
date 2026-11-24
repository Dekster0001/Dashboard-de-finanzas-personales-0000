import mongoose from 'mongoose';
import { ModeloMovimiento } from '../modelos/Movimiento.js';
import { ModeloCuenta } from '../modelos/Cuenta.js';

/**
 * Repositorio especializado para consultas analíticas y agregaciones del Dashboard.
 * Todas las agregaciones de Mongoose filtran forzosamente por usuarioId (aislamiento multiinquilino).
 */
class DashboardRepositorio {
  /**
   * Suma los ingresos y gastos de un usuario dentro de un rango de fechas.
   * @param {string|mongoose.Types.ObjectId} usuarioId
   * @param {Date} inicioFecha
   * @param {Date} finFecha
   * @returns {Promise<{ ingresosEnCentavos: number, gastosEnCentavos: number }>}
   */
  async obtenerTotalesPorTipo(usuarioId, inicioFecha, finFecha) {
    const idObj = typeof usuarioId === 'string' ? new mongoose.Types.ObjectId(usuarioId) : usuarioId;

    const agrupacion = await ModeloMovimiento.aggregate([
      {
        $match: {
          usuarioId: idObj,
          fecha: { $gte: inicioFecha, $lte: finFecha }
        }
      },
      {
        $group: {
          _id: '$tipo',
          totalEnCentavos: { $sum: '$montoEnCentavos' }
        }
      }
    ]);

    let ingresosEnCentavos = 0;
    let gastosEnCentavos = 0;

    for (const fila of agrupacion) {
      if (fila._id === 'INGRESO') {
        ingresosEnCentavos = fila.totalEnCentavos;
      } else if (fila._id === 'GASTO') {
        gastosEnCentavos = fila.totalEnCentavos;
      }
    }

    return { ingresosEnCentavos, gastosEnCentavos };
  }

  /**
   * Obtiene la suma total de gastos en centavos para un rango de fechas.
   * Utilizado para verificar el avance presupuestal.
   * @param {string|mongoose.Types.ObjectId} usuarioId
   * @param {Date} inicioFecha
   * @param {Date} finFecha
   * @returns {Promise<number>}
   */
  async sumarGastosPorRango(usuarioId, inicioFecha, finFecha) {
    const idObj = typeof usuarioId === 'string' ? new mongoose.Types.ObjectId(usuarioId) : usuarioId;

    const [resultado] = await ModeloMovimiento.aggregate([
      {
        $match: {
          usuarioId: idObj,
          tipo: 'GASTO',
          fecha: { $gte: inicioFecha, $lte: finFecha }
        }
      },
      {
        $group: {
          _id: null,
          totalEnCentavos: { $sum: '$montoEnCentavos' }
        }
      }
    ]);

    return resultado ? resultado.totalEnCentavos : 0;
  }

  /**
   * Calcula el patrimonio total sumando los saldos de todas las cuentas activas del usuario.
   * @param {string|mongoose.Types.ObjectId} usuarioId
   * @returns {Promise<number>}
   */
  async obtenerPatrimonioTotal(usuarioId) {
    const idObj = typeof usuarioId === 'string' ? new mongoose.Types.ObjectId(usuarioId) : usuarioId;

    const [resultado] = await ModeloCuenta.aggregate([
      {
        $match: {
          usuarioId: idObj,
          activo: true
        }
      },
      {
        $group: {
          _id: null,
          patrimonioTotalEnCentavos: { $sum: '$saldoActualEnCentavos' }
        }
      }
    ]);

    return resultado ? resultado.patrimonioTotalEnCentavos : 0;
  }

  /**
   * Obtiene la distribución de gastos por categoría en un rango de fechas para el gráfico de dona.
   * Realiza un $lookup con la colección categorias para incluir el nombre y color.
   * @param {string|mongoose.Types.ObjectId} usuarioId
   * @param {Date} inicioFecha
   * @param {Date} finFecha
   * @returns {Promise<Array<{ categoria: string, color: string, totalEnCentavos: number }>>}
   */
  async obtenerGastosPorCategoria(usuarioId, inicioFecha, finFecha) {
    const idObj = typeof usuarioId === 'string' ? new mongoose.Types.ObjectId(usuarioId) : usuarioId;

    return await ModeloMovimiento.aggregate([
      {
        $match: {
          usuarioId: idObj,
          tipo: 'GASTO',
          fecha: { $gte: inicioFecha, $lte: finFecha }
        }
      },
      {
        $group: {
          _id: '$categoriaId',
          totalEnCentavos: { $sum: '$montoEnCentavos' }
        }
      },
      {
        $lookup: {
          from: 'categorias',
          localField: '_id',
          foreignField: '_id',
          as: 'datosCategoria'
        }
      },
      {
        $unwind: {
          path: '$datosCategoria',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          categoriaId: '$_id',
          categoria: { $ifNull: ['$datosCategoria.nombre', 'Sin Categoría'] },
          color: { $ifNull: ['$datosCategoria.color', '#94A3B8'] },
          totalEnCentavos: 1
        }
      },
      {
        $sort: { totalEnCentavos: -1 }
      }
    ]);
  }

  /**
   * Obtiene la agregación de movimientos de los últimos 6 meses agrupados por mes (AAAA-MM) y tipo.
   * @param {string|mongoose.Types.ObjectId} usuarioId
   * @param {Date} fechaInicio6Meses
   * @param {Date} fechaFinMes
   * @returns {Promise<Array<{ _id: { mes: string, tipo: string }, totalEnCentavos: number }>>}
   */
  async obtenerAgrupacion6Meses(usuarioId, fechaInicio6Meses, fechaFinMes) {
    const idObj = typeof usuarioId === 'string' ? new mongoose.Types.ObjectId(usuarioId) : usuarioId;

    return await ModeloMovimiento.aggregate([
      {
        $match: {
          usuarioId: idObj,
          fecha: { $gte: fechaInicio6Meses, $lte: fechaFinMes }
        }
      },
      {
        $group: {
          _id: {
            mes: { $dateToString: { format: '%Y-%m', date: '$fecha' } },
            tipo: '$tipo'
          },
          totalEnCentavos: { $sum: '$montoEnCentavos' }
        }
      }
    ]);
  }
}

export const dashboardRepositorio = new DashboardRepositorio();
export default dashboardRepositorio;
