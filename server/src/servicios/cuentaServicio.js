import { cuentaRepositorio } from '../repositorios/cuentaRepositorio.js';
import { movimientoRepositorio } from '../repositorios/movimientoRepositorio.js';
import { ErrorApp } from '../utils/ErrorApp.js';

/**
 * Servicio de Cuentas y Medios de Pago (HU-03).
 * Implementa la lógica de gestión de fuentes de dinero y restricciones de integridad.
 */
class CuentaServicio {
  /**
   * Lista las cuentas del usuario (solo activas por defecto, o todas si incluirInactivas es true).
   * @param {string} usuarioId
   * @param {boolean} [incluirInactivas=false]
   */
  async listarCuentas(usuarioId, incluirInactivas = false) {
    return await cuentaRepositorio.listarActivas(usuarioId, incluirInactivas);
  }

  /**
   * Obtiene el detalle de una cuenta validando que pertenezca al usuario.
   * @param {string} usuarioId
   * @param {string} id
   */
  async obtenerCuentaPorId(usuarioId, id) {
    const cuenta = await cuentaRepositorio.buscarPorId(usuarioId, id);
    if (!cuenta) {
      throw new ErrorApp('Cuenta no encontrada.', 404);
    }
    return cuenta;
  }

  /**
   * Crea una nueva cuenta con su saldo inicial en centavos.
   * @param {string} usuarioId
   * @param {Object} datos - { nombre, tipo, saldoInicialEnCentavos, color }
   */
  async crearCuenta(usuarioId, { nombre, tipo, saldoInicialEnCentavos = 0, color = '#3B82F6' }) {
    if (!nombre || nombre.trim().length < 2) {
      throw new ErrorApp('El nombre de la cuenta es obligatorio y debe tener al menos 2 caracteres.', 400);
    }

    const tiposValidos = ['efectivo', 'banco', 'tarjeta', 'billetera'];
    const tipoLimpio = (tipo || '').toLowerCase().trim();
    if (!tiposValidos.includes(tipoLimpio)) {
      throw new ErrorApp("El tipo de cuenta no es válido. Debe ser: efectivo, banco, tarjeta o billetera.", 400);
    }

    const saldoEntero = Math.round(Number(saldoInicialEnCentavos)) || 0;
    if (isNaN(saldoEntero) || saldoEntero < 0) {
      throw new ErrorApp('El saldo inicial debe ser un número mayor o igual a 0.', 400);
    }

    return await cuentaRepositorio.crear(usuarioId, {
      nombre: nombre.trim(),
      tipo: tipoLimpio,
      saldoInicialEnCentavos: saldoEntero,
      saldoActualEnCentavos: saldoEntero,
      color: color || '#3B82F6',
      activo: true
    });
  }

  /**
   * Edita el nombre, tipo, color o estado activo de una cuenta.
   * @param {string} usuarioId
   * @param {string} id
   * @param {Object} datos - { nombre, tipo, color, activo }
   */
  async editarCuenta(usuarioId, id, { nombre, tipo, color, activo }) {
    const cuentaExistente = await this.obtenerCuentaPorId(usuarioId, id);

    const actualizacion = {};
    if (nombre !== undefined) {
      if (!nombre || nombre.trim().length < 2) {
        throw new ErrorApp('El nombre de la cuenta debe tener al menos 2 caracteres.', 400);
      }
      actualizacion.nombre = nombre.trim();
    }

    if (tipo !== undefined) {
      const tiposValidos = ['efectivo', 'banco', 'tarjeta', 'billetera'];
      const tipoLimpio = tipo.toLowerCase().trim();
      if (!tiposValidos.includes(tipoLimpio)) {
        throw new ErrorApp("Tipo de cuenta inválido. Debe ser: efectivo, banco, tarjeta o billetera.", 400);
      }
      actualizacion.tipo = tipoLimpio;
    }

    if (color !== undefined) {
      actualizacion.color = color;
    }

    if (activo !== undefined) {
      if (typeof activo !== 'boolean') {
        throw new ErrorApp("El estado 'activo' debe ser booleano.", 400);
      }
      actualizacion.activo = activo;
    }

    return await cuentaRepositorio.actualizarPorId(usuarioId, id, actualizacion);
  }

  /**
   * Elimina una cuenta bancaria.
   * Regla de negocio: Si la cuenta tiene movimientos asociados, rechaza con HTTP 409 (HU-03 E4).
   * @param {string} usuarioId
   * @param {string} id
   */
  async eliminarCuenta(usuarioId, id) {
    const cuenta = await this.obtenerCuentaPorId(usuarioId, id);

    // Validar si la cuenta posee transacciones financieras históricas
    const cantidadMovimientos = await movimientoRepositorio.contarPorCuenta(usuarioId, id);
    if (cantidadMovimientos > 0) {
      throw new ErrorApp(
        'No se puede eliminar una cuenta con movimientos asociados. Considere desactivarla.',
        409
      );
    }

    await cuentaRepositorio.eliminarPorId(usuarioId, id);
    return { mensaje: 'Cuenta eliminada exitosamente.' };
  }
}

export const cuentaServicio = new CuentaServicio();
export default cuentaServicio;
