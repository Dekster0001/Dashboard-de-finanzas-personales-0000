import { usuarioRepositorio } from '../repositorios/usuarioRepositorio.js';
import { puede, ACCIONES } from '../politicas/permisos.js';
import { ErrorApp } from '../utils/ErrorApp.js';

/**
 * Servicio de Administración de Usuarios (RBAC).
 * Implementa la lógica de supervisión del sistema y consulta políticas de permisos centralizadas.
 */
class AdminServicio {
  /**
   * Lista los usuarios registrados en el sistema con búsqueda y paginación.
   * Solo disponible para el rol ADMIN.
   * @param {Object} usuarioAutenticado - Administrador que realiza la petición
   * @param {Object} [opciones] - { busqueda, pagina, limite }
   */
  async listarUsuarios(usuarioAutenticado, { busqueda = '', pagina = 1, limite = 10 } = {}) {
    if (!puede(usuarioAutenticado, ACCIONES.LISTAR_USUARIOS)) {
      throw new ErrorApp('No tienes permisos para acceder a este recurso.', 403);
    }

    const { usuarios, paginacion } = await usuarioRepositorio.listarConPaginacion({
      busqueda,
      pagina,
      limite
    });

    return {
      usuarios: usuarios.map((u) => ({
        _id: u._id,
        uuid: u.uuid,
        nombre: u.nombre,
        correo: u.correo,
        rol: u.rol,
        activo: u.activo,
        creadoEn: u.creadoEn
      })),
      paginacion
    };
  }

  /**
   * Modifica el rol de un usuario del sistema (ADMIN | USUARIO).
   * Regla de negocio: Un administrador no puede auto-quitarse su propio rol.
   * @param {Object} usuarioAutenticado - Administrador que ejecuta la acción
   * @param {string} idUsuario - ID o UUID del usuario objetivo
   * @param {string} nuevoRol - 'ADMIN' o 'USUARIO'
   */
  async cambiarRolUsuario(usuarioAutenticado, idUsuario, nuevoRol) {
    const rolFormateado = (nuevoRol || '').toUpperCase().trim();
    if (!['ADMIN', 'USUARIO'].includes(rolFormateado)) {
      throw new ErrorApp("El rol proporcionado no es válido. Debe ser 'ADMIN' o 'USUARIO'.", 400);
    }

    // Buscar por _id o por uuid
    let usuarioObjetivo = null;
    try {
      usuarioObjetivo = await usuarioRepositorio.buscarPorId(idUsuario);
    } catch {
      // Si el id no es un ObjectId válido, intentamos por uuid
    }
    if (!usuarioObjetivo) {
      usuarioObjetivo = await usuarioRepositorio.buscarPorUuid(idUsuario);
    }

    if (!usuarioObjetivo) {
      throw new ErrorApp('Usuario no encontrado en el sistema.', 404);
    }

    // Consultar política: un admin no puede auto-quitarse su propio rol
    if (!puede(usuarioAutenticado, ACCIONES.CAMBIAR_ROL_USUARIO, usuarioObjetivo)) {
      throw new ErrorApp('Un administrador no puede revocar su propio rol de administrador.', 400);
    }

    usuarioObjetivo.rol = rolFormateado;
    await usuarioRepositorio.guardar(usuarioObjetivo);

    return {
      _id: usuarioObjetivo._id,
      uuid: usuarioObjetivo.uuid,
      nombre: usuarioObjetivo.nombre,
      correo: usuarioObjetivo.correo,
      rol: usuarioObjetivo.rol,
      activo: usuarioObjetivo.activo
    };
  }

  /**
   * Activa o desactiva la cuenta de un usuario.
   * Regla de negocio: Un administrador no puede auto-desactivar su propia cuenta.
   * @param {Object} usuarioAutenticado - Administrador que ejecuta la acción
   * @param {string} idUsuario - ID o UUID del usuario objetivo
   * @param {boolean} nuevoEstado - true (activo) o false (inactivo)
   */
  async cambiarEstadoUsuario(usuarioAutenticado, idUsuario, nuevoEstado) {
    if (nuevoEstado === undefined || nuevoEstado === null) {
      throw new ErrorApp("Debe especificar el campo 'activo' (booleano).", 400);
    }

    let usuarioObjetivo = null;
    try {
      usuarioObjetivo = await usuarioRepositorio.buscarPorId(idUsuario);
    } catch {
      // Ignorar error de formato de ObjectId
    }
    if (!usuarioObjetivo) {
      usuarioObjetivo = await usuarioRepositorio.buscarPorUuid(idUsuario);
    }

    if (!usuarioObjetivo) {
      throw new ErrorApp('Usuario no encontrado en el sistema.', 404);
    }

    // Consultar política: un admin no puede desactivarse a sí mismo
    if (!puede(usuarioAutenticado, ACCIONES.CAMBIAR_ESTADO_USUARIO, usuarioObjetivo)) {
      throw new ErrorApp('Un administrador no puede desactivar su propia cuenta de acceso.', 400);
    }

    usuarioObjetivo.activo = Boolean(nuevoEstado);
    await usuarioRepositorio.guardar(usuarioObjetivo);

    return {
      _id: usuarioObjetivo._id,
      uuid: usuarioObjetivo.uuid,
      nombre: usuarioObjetivo.nombre,
      correo: usuarioObjetivo.correo,
      rol: usuarioObjetivo.rol,
      activo: usuarioObjetivo.activo
    };
  }
}

export const adminServicio = new AdminServicio();
export default adminServicio;
