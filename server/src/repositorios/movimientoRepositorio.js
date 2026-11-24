import { RepositorioBase } from './RepositorioBase.js';
import { ModeloMovimiento } from '../modelos/Movimiento.js';

/**
 * Repositorio de Movimientos Financieros.
 * Extiende RepositorioBase inyectando el aislamiento forzado por usuarioId.
 */
class MovimientoRepositorio extends RepositorioBase {
  constructor() {
    super(ModeloMovimiento);
  }

  /**
   * Cuenta la cantidad de movimientos vinculados a una cuenta bancaria.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} cuentaId
   */
  async contarPorCuenta(usuarioId, cuentaId) {
    return await this.contar(usuarioId, { cuentaId });
  }

  /**
   * Cuenta la cantidad de movimientos clasificados en una categoría.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} categoriaId
   */
  async contarPorCategoria(usuarioId, categoriaId) {
    return await this.contar(usuarioId, { categoriaId });
  }

  /**
   * Busca un movimiento por ID garantizando aislamiento por usuarioId, con relaciones pobladas.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} id
   */
  async buscarDetallePorId(usuarioId, id) {
    this._validarUsuarioId(usuarioId);
    return await this.modelo
      .findOne({ _id: id, usuarioId })
      .populate('categoriaId', 'nombre tipo color')
      .populate('cuentaId', 'nombre tipo color');
  }

  /**
   * Busca movimientos con filtros combinados, orden cronológico descendente y paginación.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {Object} filtros - { desde, hasta, tipo, categoriaId, cuentaId }
   * @param {number} [pagina=1]
   * @param {number} [limite=10]
   */
  async buscarConFiltrosYPaginacion(usuarioId, filtros = {}, pagina = 1, limite = 10) {
    const consulta = { usuarioId };

    // Filtro por tipo de movimiento (INGRESO | GASTO)
    if (filtros.tipo) {
      consulta.tipo = filtros.tipo;
    }

    // Filtro por categoría específica
    if (filtros.categoriaId) {
      consulta.categoriaId = filtros.categoriaId;
    }

    // Filtro por cuenta específica
    if (filtros.cuentaId) {
      consulta.cuentaId = filtros.cuentaId;
    }

    // Filtro por rango de fechas (desde / hasta)
    if (filtros.desde || filtros.hasta) {
      consulta.fecha = {};
      if (filtros.desde) {
        consulta.fecha.$gte = new Date(filtros.desde);
      }
      if (filtros.hasta) {
        // Ajustamos al final del día si es fecha en formato YYYY-MM-DD
        const fechaHasta = new Date(filtros.hasta);
        if (filtros.hasta.length === 10) {
          fechaHasta.setUTCHours(23, 59, 59, 999);
        }
        consulta.fecha.$lte = fechaHasta;
      }
    }

    const saltar = (Math.max(1, pagina) - 1) * limite;
    const totalRegistros = await this.modelo.countDocuments(consulta);
    const totalPaginas = Math.ceil(totalRegistros / limite) || 1;

    const movimientos = await this.modelo
      .find(consulta)
      .populate('categoriaId', 'nombre tipo color')
      .populate('cuentaId', 'nombre tipo color')
      .sort({ fecha: -1, creadoEn: -1 })
      .skip(saltar)
      .limit(limite);

    return {
      movimientos,
      paginacion: {
        paginaActual: Number(pagina),
        limite: Number(limite),
        totalRegistros,
        totalPaginas
      }
    };
  }
}

export const movimientoRepositorio = new MovimientoRepositorio();
export default movimientoRepositorio;
