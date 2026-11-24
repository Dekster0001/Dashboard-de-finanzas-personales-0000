import { adminServicio } from '../servicios/adminServicio.js';
import { responderExito } from '../utils/respuestas.js';

/**
 * Controlador de Administración de Usuarios.
 * Gestiona endpoints bajo /api/admin/usuarios con autorización estricta para rol ADMIN.
 */
class AdminControlador {
  /**
   * GET /api/admin/usuarios
   */
  async listar(req, res, next) {
    try {
      const { busqueda, pagina, limite } = req.query;
      const resultado = await adminServicio.listarUsuarios(req.usuario, {
        busqueda,
        pagina,
        limite
      });
      return responderExito(res, 200, 'Lista de usuarios obtenida', resultado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/usuarios/:id/rol
   */
  async cambiarRol(req, res, next) {
    try {
      const { id } = req.params;
      const { rol } = req.body;
      const usuarioActualizado = await adminServicio.cambiarRolUsuario(req.usuario, id, rol);
      return responderExito(res, 200, 'Rol de usuario actualizado exitosamente', usuarioActualizado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/usuarios/:id/estado
   */
  async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { activo } = req.body;
      const usuarioActualizado = await adminServicio.cambiarEstadoUsuario(req.usuario, id, activo);
      return responderExito(res, 200, 'Estado del usuario actualizado exitosamente', usuarioActualizado);
    } catch (error) {
      next(error);
    }
  }
}

export const adminControlador = new AdminControlador();
export default adminControlador;
