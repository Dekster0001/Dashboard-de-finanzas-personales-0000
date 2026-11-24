import { presupuestoRepositorio } from '../repositorios/presupuestoRepositorio.js';
import { dashboardRepositorio } from '../repositorios/dashboardRepositorio.js';
import { ErrorApp } from '../utils/ErrorApp.js';
import { esMesValido, obtenerRangoMesUTC } from '../utils/fechas.js';

/**
 * Servicio de lógica de negocio para Presupuestos Mensuales (HU-07).
 * Aplica semáforo financiero (OK, ALERTA >= 80%, EXCEDIDO > 100%) y montos en centavos.
 */
class PresupuestoServicio {
  /**
   * Consulta el presupuesto mensual, cálculo de gasto acumulado y porcentaje de avance.
   * @param {string} usuarioId
   * @param {string} mes - Formato AAAA-MM (ej. '2026-11')
   */
  async obtenerPresupuestoMes(usuarioId, mes) {
    if (!esMesValido(mes)) {
      throw new ErrorApp('El formato del mes debe ser AAAA-MM (ej. 2026-11).', 400);
    }

    const { inicioMes, finMes } = obtenerRangoMesUTC(mes);

    // Consultar presupuesto configurado
    const presupuesto = await presupuestoRepositorio.buscarPorMes(usuarioId, mes);

    // Sumar gastos acumulados del usuario en dicho mes
    const gastadoEnCentavos = await dashboardRepositorio.sumarGastosPorRango(
      usuarioId,
      inicioMes,
      finMes
    );

    if (!presupuesto) {
      return {
        mes,
        montoLimiteEnCentavos: 0,
        limiteEnCentavos: 0,
        limite: 0,
        gastadoEnCentavos,
        gastado: gastadoEnCentavos,
        disponibleEnCentavos: 0,
        disponible: 0,
        porcentajeConsumido: 0,
        porcentaje: 0,
        estado: 'SIN_PRESUPUESTO'
      };
    }

    const limiteEnCentavos = presupuesto.montoLimiteEnCentavos;
    const disponibleEnCentavos = limiteEnCentavos - gastadoEnCentavos;
    const porcentajeConsumido =
      limiteEnCentavos > 0
        ? Number(((gastadoEnCentavos / limiteEnCentavos) * 100).toFixed(2))
        : 0;

    // Regla del Semáforo Financiero
    let estado = 'OK';
    if (porcentajeConsumido > 100) {
      estado = 'EXCEDIDO';
    } else if (porcentajeConsumido >= 80) {
      estado = 'ALERTA';
    }

    return {
      mes,
      montoLimiteEnCentavos: limiteEnCentavos,
      limiteEnCentavos,
      limite: limiteEnCentavos,
      gastadoEnCentavos,
      gastado: gastadoEnCentavos,
      disponibleEnCentavos,
      disponible: disponibleEnCentavos,
      porcentajeConsumido,
      porcentaje: porcentajeConsumido,
      estado
    };
  }

  /**
   * Registra o actualiza el presupuesto mensual para el usuario.
   * @param {string} usuarioId
   * @param {string} mes - Formato AAAA-MM
   * @param {number} montoLimiteEnCentavos - Entero positivo > 0
   */
  async definirPresupuesto(usuarioId, mes, montoLimiteEnCentavos) {
    if (!esMesValido(mes)) {
      throw new ErrorApp('El formato del mes debe ser AAAA-MM (ej. 2026-11).', 400);
    }

    if (
      montoLimiteEnCentavos === undefined ||
      montoLimiteEnCentavos === null ||
      !Number.isInteger(montoLimiteEnCentavos) ||
      montoLimiteEnCentavos <= 0
    ) {
      throw new ErrorApp(
        'El monto límite debe ser un número positivo mayor a 0.',
        400
      );
    }

    await presupuestoRepositorio.definirPresupuesto(usuarioId, mes, montoLimiteEnCentavos);

    // Retorna el balance y avance inmediatamente recalculado
    return await this.obtenerPresupuestoMes(usuarioId, mes);
  }
}

export const presupuestoServicio = new PresupuestoServicio();
export default presupuestoServicio;
