import { dashboardServicio } from '../servicios/dashboardServicio.js';
import { respuestaExito } from '../utils/respuestas.js';

/**
 * Controlador HTTP para el Dashboard Financiero.
 */
class DashboardControlador {
  /**
   * GET /api/dashboard/resumen?mes=AAAA-MM
   */
  async obtenerResumen(req, res, next) {
    try {
      const usuarioId = req.usuario.id || req.usuario._id;
      const { mes } = req.query;
      const datos = await dashboardServicio.obtenerResumen(usuarioId, mes);
      return respuestaExito(res, datos);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/por-categoria?mes=AAAA-MM
   */
  async obtenerPorCategoria(req, res, next) {
    try {
      const usuarioId = req.usuario.id || req.usuario._id;
      const { mes } = req.query;
      const datos = await dashboardServicio.obtenerGastosPorCategoria(usuarioId, mes);
      return respuestaExito(res, datos);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/tendencia-mensual?mes=AAAA-MM
   */
  async obtenerTendenciaMensual(req, res, next) {
    try {
      const usuarioId = req.usuario.id || req.usuario._id;
      const { mes } = req.query;
      const datos = await dashboardServicio.obtenerTendenciaMensual(usuarioId, mes);
      return respuestaExito(res, datos);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardControlador = new DashboardControlador();
export default dashboardControlador;
