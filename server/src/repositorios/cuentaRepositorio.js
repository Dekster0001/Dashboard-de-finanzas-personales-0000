import { RepositorioBase } from './RepositorioBase.js';
import { ModeloCuenta } from '../modelos/Cuenta.js';

/**
 * Repositorio de Cuentas Financieras.
 * Extiende RepositorioBase inyectando el aislamiento forzado por usuarioId.
 */
class CuentaRepositorio extends RepositorioBase {
  constructor() {
    super(ModeloCuenta);
  }

  /**
   * Obtiene las cuentas del inquilino ordenadas por estado y fecha de creación.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {boolean} [incluirInactivas=false]
   */
  async listarActivas(usuarioId, incluirInactivas = false) {
    const filtros = incluirInactivas ? {} : { activo: true };
    return await this.buscar(usuarioId, filtros, { sort: { activo: -1, creadoEn: 1 } });
  }

  /**
   * Actualiza el saldo actual en centavos de una cuenta específica.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} cuentaId
   * @param {number} nuevoSaldoEnCentavos
   */
  async actualizarSaldo(usuarioId, cuentaId, nuevoSaldoEnCentavos) {
    return await this.actualizarPorId(usuarioId, cuentaId, {
      saldoActualEnCentavos: nuevoSaldoEnCentavos
    });
  }
}

export const cuentaRepositorio = new CuentaRepositorio();
export default cuentaRepositorio;
