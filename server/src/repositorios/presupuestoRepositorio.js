import { RepositorioBase } from './RepositorioBase.js';
import { ModeloPresupuesto } from '../modelos/Presupuesto.js';

/**
 * Repositorio de Presupuestos Mensuales.
 * Extiende RepositorioBase garantizando aislamiento estricto por usuarioId.
 */
class PresupuestoRepositorio extends RepositorioBase {
  constructor() {
    super(ModeloPresupuesto);
  }

  /**
   * Busca el presupuesto definido por el usuario para un mes específico (AAAA-MM).
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} mes - Formato 'AAAA-MM'
   * @returns {Promise<Object|null>}
   */
  async buscarPorMes(usuarioId, mes) {
    return await this.modelo.findOne({ usuarioId, mes });
  }

  /**
   * Registra o actualiza el presupuesto mensual para el usuario.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} mes - Formato 'AAAA-MM'
   * @param {number} montoLimiteEnCentavos
   * @returns {Promise<Object>}
   */
  async definirPresupuesto(usuarioId, mes, montoLimiteEnCentavos) {
    return await this.modelo.findOneAndUpdate(
      { usuarioId, mes },
      { usuarioId, mes, montoLimiteEnCentavos },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );
  }
}

export const presupuestoRepositorio = new PresupuestoRepositorio();
export default presupuestoRepositorio;
