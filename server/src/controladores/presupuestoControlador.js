import { presupuestoServicio } from '../servicios/presupuestoServicio.js';
import { respuestaExito } from '../utils/respuestas.js';

/**
 * Controlador HTTP para Presupuestos Mensuales.
 */
class PresupuestoControlador {
  /**
   * GET /api/presupuestos/:mes
   */
  async obtenerPresupuesto(req, res, next) {
    try {
      const usuarioId = req.usuario.id || req.usuario._id;
      const { mes } = req.params;
      const datos = await presupuestoServicio.obtenerPresupuestoMes(usuarioId, mes);
      return respuestaExito(res, datos, 'Presupuesto obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/presupuestos/:mes
   */
  async definirPresupuesto(req, res, next) {
    try {
      const usuarioId = req.usuario.id || req.usuario._id;
      const { mes } = req.params;
      const monto = req.body.montoLimiteEnCentavos ?? req.body.limite;
      const datos = await presupuestoServicio.definirPresupuesto(usuarioId, mes, monto);
      return respuestaExito(res, datos, 'Presupuesto actualizado satisfactoriamente');
    } catch (error) {
      next(error);
    }
  }
}

export const presupuestoControlador = new PresupuestoControlador();
export default presupuestoControlador;
