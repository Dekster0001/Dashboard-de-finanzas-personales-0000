import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import { movimientoRepositorio } from '../repositorios/movimientoRepositorio.js';
import { cuentaRepositorio } from '../repositorios/cuentaRepositorio.js';
import { categoriaRepositorio } from '../repositorios/categoriaRepositorio.js';
import { ErrorApp } from '../utils/ErrorApp.js';

dayjs.extend(isSameOrBefore);

/**
 * Servicio de Movimientos Financieros (HU-05 y HU-06).
 * Implementa el cálculo de saldos en centavos, algoritmo de reversión matemática
 * y filtros dinámicos con validación cronológica.
 */
class MovimientoServicio {
  /**
   * Registra un nuevo movimiento y actualiza el saldo vivo de la cuenta.
   * Saldo de la cuenta = saldoInicial + ingresos - gastos.
   * @param {string} usuarioId
   * @param {Object} datos - { tipo, montoEnCentavos, fecha, descripcion, categoriaId, cuentaId }
   */
  async registrarMovimiento(usuarioId, { tipo, montoEnCentavos, fecha, descripcion, categoriaId, cuentaId }) {
    // 1. Validar monto positivo en centavos (HU-05 E3)
    const montoEntero = Math.round(Number(montoEnCentavos));
    if (isNaN(montoEntero) || montoEntero <= 0) {
      throw new ErrorApp('El monto debe ser mayor a 0', 400);
    }

    // 2. Validar tipo de movimiento
    const tipoFormateado = (tipo || '').toUpperCase().trim();
    if (!['INGRESO', 'GASTO'].includes(tipoFormateado)) {
      throw new ErrorApp("El tipo de movimiento debe ser 'INGRESO' o 'GASTO'.", 400);
    }

    // 3. Validar existencia y pertenencia de la cuenta
    const cuenta = await cuentaRepositorio.buscarPorId(usuarioId, cuentaId);
    if (!cuenta) {
      throw new ErrorApp('La cuenta especificada no existe o no pertenece al usuario.', 404);
    }

    // 4. Validar existencia y coincidencia de tipo de la categoría (HU-05 E4)
    const categoria = await categoriaRepositorio.buscarPorId(usuarioId, categoriaId);
    if (!categoria) {
      throw new ErrorApp('La categoría especificada no existe o no pertenece al usuario.', 404);
    }

    if (categoria.tipo !== tipoFormateado) {
      throw new ErrorApp(
        `El tipo de la categoría (${categoria.tipo}) no coincide con el tipo del movimiento (${tipoFormateado}).`,
        400
      );
    }

    // Regla de Negocio Anti-Saldos Negativos (Saldo Insuficiente):
    // Las cuentas de efectivo, bancos y billeteras no pueden operar con saldo negativo.
    // Solo las tarjetas de crédito pueden tener saldo deudor/negativo.
    if (tipoFormateado === 'GASTO' && cuenta.tipo !== 'tarjeta') {
      if (cuenta.saldoActualEnCentavos < montoEntero) {
        throw new ErrorApp(
          `Saldo insuficiente en la cuenta '${cuenta.nombre}'. Saldo disponible: S/. ${(cuenta.saldoActualEnCentavos / 100).toFixed(2)}, monto solicitado: S/. ${(montoEntero / 100).toFixed(2)}.`,
          400
        );
      }
    }

    // 5. Crear el movimiento
    const nuevoMovimiento = await movimientoRepositorio.crear(usuarioId, {
      tipo: tipoFormateado,
      montoEnCentavos: montoEntero,
      fecha: fecha ? new Date(fecha) : new Date(),
      descripcion: (descripcion || '').trim(),
      categoriaId: categoria._id,
      cuentaId: cuenta._id
    });

    // 6. Actualizar el saldo actual de la cuenta
    if (tipoFormateado === 'INGRESO') {
      cuenta.saldoActualEnCentavos += montoEntero;
    } else {
      cuenta.saldoActualEnCentavos -= montoEntero;
    }
    await cuenta.save();

    return {
      movimiento: nuevoMovimiento,
      saldoActualCuentaEnCentavos: cuenta.saldoActualEnCentavos
    };
  }

  /**
   * Modifica un movimiento existente aplicando el algoritmo de reversión matemática
   * y validación estricta de saldo suficiente para prevenir saldos negativos.
   * @param {string} usuarioId
   * @param {string} id
   * @param {Object} nuevosDatos
   */
  async editarMovimiento(usuarioId, id, nuevosDatos) {
    const movimientoExistente = await movimientoRepositorio.buscarPorId(usuarioId, id);
    if (!movimientoExistente) {
      throw new ErrorApp('Movimiento no encontrado.', 404);
    }

    const cuentaOriginal = await cuentaRepositorio.buscarPorId(usuarioId, movimientoExistente.cuentaId);
    if (!cuentaOriginal) {
      throw new ErrorApp('Cuenta original del movimiento no encontrada.', 404);
    }

    // Determinar valores actualizados
    const nuevoTipo = (nuevosDatos.tipo || movimientoExistente.tipo).toUpperCase().trim();
    if (!['INGRESO', 'GASTO'].includes(nuevoTipo)) {
      throw new ErrorApp("El tipo de movimiento debe ser 'INGRESO' o 'GASTO'.", 400);
    }

    let nuevoMonto = movimientoExistente.montoEnCentavos;
    if (nuevosDatos.montoEnCentavos !== undefined) {
      nuevoMonto = Math.round(Number(nuevosDatos.montoEnCentavos));
      if (isNaN(nuevoMonto) || nuevoMonto <= 0) {
        throw new ErrorApp('El monto debe ser mayor a 0', 400);
      }
    }

    const nuevaCuentaId = nuevosDatos.cuentaId || movimientoExistente.cuentaId;
    const esMismaCuenta = nuevaCuentaId.toString() === cuentaOriginal._id.toString();
    const nuevaCuenta = esMismaCuenta
      ? cuentaOriginal
      : await cuentaRepositorio.buscarPorId(usuarioId, nuevaCuentaId);

    if (!nuevaCuenta) {
      throw new ErrorApp('La nueva cuenta especificada no existe.', 404);
    }

    const nuevaCategoriaId = nuevosDatos.categoriaId || movimientoExistente.categoriaId;
    const nuevaCategoria = await categoriaRepositorio.buscarPorId(usuarioId, nuevaCategoriaId);
    if (!nuevaCategoria) {
      throw new ErrorApp('La nueva categoría especificada no existe.', 404);
    }

    if (nuevaCategoria.tipo !== nuevoTipo) {
      throw new ErrorApp('El tipo de la categoría no coincide con el tipo del movimiento.', 400);
    }

    // Regla de Negocio Anti-Saldos Negativos en Edición:
    if (esMismaCuenta) {
      // Revertir efecto en memoria sobre la cuenta
      let saldoProyectado = cuentaOriginal.saldoActualEnCentavos;
      if (movimientoExistente.tipo === 'INGRESO') {
        saldoProyectado -= movimientoExistente.montoEnCentavos;
      } else {
        saldoProyectado += movimientoExistente.montoEnCentavos;
      }

      // Aplicar nuevo efecto
      if (nuevoTipo === 'INGRESO') {
        saldoProyectado += nuevoMonto;
      } else {
        saldoProyectado -= nuevoMonto;
      }

      if (cuentaOriginal.tipo !== 'tarjeta' && saldoProyectado < 0) {
        throw new ErrorApp(
          `Saldo insuficiente en la cuenta '${cuentaOriginal.nombre}'. La modificación dejaría un saldo negativo de S/. ${(saldoProyectado / 100).toFixed(2)}.`,
          400
        );
      }

      cuentaOriginal.saldoActualEnCentavos = saldoProyectado;
      await cuentaOriginal.save();
    } else {
      // Cuentas distintas: verificar primero ambas cuentas antes de persistir
      let saldoProyectadoOriginal = cuentaOriginal.saldoActualEnCentavos;
      if (movimientoExistente.tipo === 'INGRESO') {
        saldoProyectadoOriginal -= movimientoExistente.montoEnCentavos;
      } else {
        saldoProyectadoOriginal += movimientoExistente.montoEnCentavos;
      }

      if (cuentaOriginal.tipo !== 'tarjeta' && saldoProyectadoOriginal < 0) {
        throw new ErrorApp(
          `No se puede mover el movimiento: la cuenta original '${cuentaOriginal.nombre}' quedaría con saldo negativo de S/. ${(saldoProyectadoOriginal / 100).toFixed(2)}.`,
          400
        );
      }

      let saldoProyectadoNueva = nuevaCuenta.saldoActualEnCentavos;
      if (nuevoTipo === 'INGRESO') {
        saldoProyectadoNueva += nuevoMonto;
      } else {
        saldoProyectadoNueva -= nuevoMonto;
      }

      if (nuevaCuenta.tipo !== 'tarjeta' && saldoProyectadoNueva < 0) {
        throw new ErrorApp(
          `Saldo insuficiente en la cuenta destino '${nuevaCuenta.nombre}'. Saldo disponible: S/. ${(nuevaCuenta.saldoActualEnCentavos / 100).toFixed(2)}, monto solicitado: S/. ${(nuevoMonto / 100).toFixed(2)}.`,
          400
        );
      }

      // Ambas son válidas: persistir cambios
      cuentaOriginal.saldoActualEnCentavos = saldoProyectadoOriginal;
      nuevaCuenta.saldoActualEnCentavos = saldoProyectadoNueva;
      await cuentaOriginal.save();
      await nuevaCuenta.save();
    }

    // Persistir actualización del movimiento
    const movimientoActualizado = await movimientoRepositorio.actualizarPorId(usuarioId, id, {
      tipo: nuevoTipo,
      montoEnCentavos: nuevoMonto,
      fecha: nuevosDatos.fecha ? new Date(nuevosDatos.fecha) : movimientoExistente.fecha,
      descripcion: nuevosDatos.descripcion !== undefined ? nuevosDatos.descripcion.trim() : movimientoExistente.descripcion,
      categoriaId: nuevaCategoria._id,
      cuentaId: nuevaCuenta._id
    });

    return movimientoActualizado;
  }

  /**
   * Elimina un movimiento y restaura el saldo en la cuenta correspondiente.
   * Regla de Negocio: Si eliminar un ingreso dejaría la cuenta en negativo, bloquea con 400.
   * @param {string} usuarioId
   * @param {string} id
   */
  async eliminarMovimiento(usuarioId, id) {
    const movimiento = await movimientoRepositorio.buscarPorId(usuarioId, id);
    if (!movimiento) {
      throw new ErrorApp('Movimiento no encontrado.', 404);
    }

    const cuenta = await cuentaRepositorio.buscarPorId(usuarioId, movimiento.cuentaId);
    if (cuenta) {
      // Revertir el impacto financiero
      if (movimiento.tipo === 'INGRESO') {
        const saldoResultante = cuenta.saldoActualEnCentavos - movimiento.montoEnCentavos;
        if (cuenta.tipo !== 'tarjeta' && saldoResultante < 0) {
          throw new ErrorApp(
            `No es posible eliminar este ingreso: dejaría la cuenta '${cuenta.nombre}' con saldo negativo de S/. ${(saldoResultante / 100).toFixed(2)}. Elimine o reduzca primero los gastos asociados.`,
            400
          );
        }
        cuenta.saldoActualEnCentavos = saldoResultante;
      } else {
        cuenta.saldoActualEnCentavos += movimiento.montoEnCentavos;
      }
      await cuenta.save();
    }

    await movimientoRepositorio.eliminarPorId(usuarioId, id);
    return { mensaje: 'Movimiento eliminado y saldo recalculado con éxito.' };
  }

  /**
   * Lista movimientos aplicando filtros dinámicos y validación cronológica (HU-06).
   * @param {string} usuarioId
   * @param {Object} filtros - { desde, hasta, tipo, categoriaId, cuentaId, pagina, limite }
   */
  async listarMovimientos(usuarioId, { desde, hasta, tipo, categoriaId, cuentaId, pagina = 1, limite = 10 }) {
    // Validar rango de fechas cronológico (HU-06 E3)
    if (desde && hasta) {
      const fechaDesde = dayjs(desde);
      const fechaHasta = dayjs(hasta);

      if (!fechaDesde.isValid() || !fechaHasta.isValid()) {
        throw new ErrorApp('Formato de fecha inválido. Ingrese fechas válidas (AAAA-MM-DD).', 400);
      }

      if (fechaDesde.isAfter(fechaHasta)) {
        throw new ErrorApp('La fecha inicial no puede ser mayor a la final', 400);
      }
    }

    return await movimientoRepositorio.buscarConFiltrosYPaginacion(
      usuarioId,
      { desde, hasta, tipo: tipo ? tipo.toUpperCase().trim() : undefined, categoriaId, cuentaId },
      Number(pagina) || 1,
      Number(limite) || 10
    );
  }
}

export const movimientoServicio = new MovimientoServicio();
export default movimientoServicio;
