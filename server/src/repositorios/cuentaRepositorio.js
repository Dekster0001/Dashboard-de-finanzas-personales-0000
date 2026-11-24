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
   * Obtiene todas las cuentas activas del inquilino ordenadas por fecha de creación.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   */
  async listarActivas(usuarioId) {
    return await this.buscar(usuarioId, { activo: true }, { sort: { creadoEn: 1 } });
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
