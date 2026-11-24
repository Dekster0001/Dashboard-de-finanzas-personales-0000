import { cuentaServicio } from '../servicios/cuentaServicio.js';
import { responderExito } from '../utils/respuestas.js';

class CuentaControlador {
  async listar(req, res, next) {
    try {
      const incluirInactivas = req.query.incluirInactivas === 'true';
      const cuentas = await cuentaServicio.listarCuentas(req.usuario.id || req.usuario._id, incluirInactivas);
      return responderExito(res, 200, 'Lista de cuentas obtenida', cuentas);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const cuenta = await cuentaServicio.obtenerCuentaPorId(req.usuario.id || req.usuario._id, req.params.id);
      return responderExito(res, 200, 'Detalle de cuenta obtenido', cuenta);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const { nombre, tipo, saldoInicialEnCentavos, color } = req.body;
      const nuevaCuenta = await cuentaServicio.crearCuenta(req.usuario.id || req.usuario._id, {
        nombre,
        tipo,
        saldoInicialEnCentavos,
        color
      });
      return responderExito(res, 201, 'Cuenta creada exitosamente', nuevaCuenta);
    } catch (error) {
      next(error);
    }
  }

  async editar(req, res, next) {
    try {
      const { nombre, tipo, color, activo } = req.body;
      const cuentaActualizada = await cuentaServicio.editarCuenta(
        req.usuario.id || req.usuario._id,
        req.params.id,
        { nombre, tipo, color, activo }
      );
      return responderExito(res, 200, 'Cuenta actualizada exitosamente', cuentaActualizada);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const resultado = await cuentaServicio.eliminarCuenta(req.usuario.id || req.usuario._id, req.params.id);
      return responderExito(res, 200, resultado.mensaje);
    } catch (error) {
      next(error);
    }
  }
}

export const cuentaControlador = new CuentaControlador();
export default cuentaControlador;
