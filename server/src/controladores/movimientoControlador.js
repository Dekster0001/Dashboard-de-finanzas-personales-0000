import { movimientoServicio } from '../servicios/movimientoServicio.js';
import { responderExito } from '../utils/respuestas.js';

class MovimientoControlador {
  async listar(req, res, next) {
    try {
      const { desde, hasta, tipo, categoriaId, cuentaId, pagina, limite } = req.query;
      const resultado = await movimientoServicio.listarMovimientos(req.usuario.id || req.usuario._id, {
        desde,
        hasta,
        tipo,
        categoriaId,
        cuentaId,
        pagina,
        limite
      });
      return responderExito(res, 200, 'Movimientos obtenidos', resultado);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const movimiento = await movimientoServicio.obtenerMovimientoPorId(
        req.usuario.id || req.usuario._id,
        req.params.id
      );
      return responderExito(res, 200, 'Movimiento obtenido', movimiento);
    } catch (error) {
      next(error);
    }
  }

  async registrar(req, res, next) {
    try {
      const { tipo, montoEnCentavos, fecha, descripcion, categoriaId, cuentaId } = req.body;
      const resultado = await movimientoServicio.registrarMovimiento(req.usuario.id || req.usuario._id, {
        tipo,
        montoEnCentavos,
        fecha,
        descripcion,
        categoriaId,
        cuentaId
      });
      return responderExito(res, 201, 'Movimiento registrado exitosamente', resultado);
    } catch (error) {
      next(error);
    }
  }

  async editar(req, res, next) {
    try {
      const movimientoActualizado = await movimientoServicio.editarMovimiento(
        req.usuario.id || req.usuario._id,
        req.params.id,
        req.body
      );
      return responderExito(res, 200, 'Movimiento actualizado exitosamente', movimientoActualizado);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const resultado = await movimientoServicio.eliminarMovimiento(
        req.usuario.id || req.usuario._id,
        req.params.id
      );
      return responderExito(res, 200, resultado.mensaje);
    } catch (error) {
      next(error);
    }
  }
}

export const movimientoControlador = new MovimientoControlador();
export default movimientoControlador;
