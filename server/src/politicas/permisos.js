/**
 * Módulo de Políticas y Permisos Centralizados por Rol (RBAC).
 * Define la matriz de control de acceso para los roles ADMIN y USUARIO.
 */

export const ACCIONES = {
  ADMINISTRAR_USUARIOS: 'ADMINISTRAR_USUARIOS',
  LISTAR_USUARIOS: 'LISTAR_USUARIOS',
  CAMBIAR_ROL_USUARIO: 'CAMBIAR_ROL_USUARIO',
  CAMBIAR_ESTADO_USUARIO: 'CAMBIAR_ESTADO_USUARIO',
  GESTIONAR_FINANZAS_PROPIAS: 'GESTIONAR_FINANZAS_PROPIAS'
};

/**
 * Función central de autorización basada en políticas.
 * @param {Object} usuario - Objeto de usuario autenticado (con rol, uuid o _id)
 * @param {string} accion - Acción que se desea ejecutar
 * @param {Object} [recurso=null] - Recurso objetivo sobre el que se opera
 * @returns {boolean}
 */
export const puede = (usuario, accion, recurso = null) => {
  if (!usuario || !usuario.activo) return false;

  const esAdmin = usuario.rol === 'ADMIN';

  switch (accion) {
    case ACCIONES.ADMINISTRAR_USUARIOS:
    case ACCIONES.LISTAR_USUARIOS:
    case 'LISTAR_USUARIOS':
      return esAdmin;

    case ACCIONES.CAMBIAR_ROL_USUARIO:
    case 'CAMBIAR_ROL':
      // Regla de seguridad: un administrador no puede auto-quitarse su propio rol de ADMIN
      if (recurso) {
        const idUsuario = (usuario._id || usuario.id || usuario.uuid || '').toString();
        const idRecurso = (recurso._id || recurso.id || recurso.uuid || '').toString();
        if (idUsuario && idRecurso && idUsuario === idRecurso) {
          return false;
        }
      }
      return esAdmin;

    case ACCIONES.CAMBIAR_ESTADO_USUARIO:
    case 'CAMBIAR_ESTADO':
      // Un administrador no puede auto-desactivar su propia cuenta
      if (recurso) {
        const idUsuario = (usuario._id || usuario.id || usuario.uuid || '').toString();
        const idRecurso = (recurso._id || recurso.id || recurso.uuid || '').toString();
        if (idUsuario && idRecurso && idUsuario === idRecurso) {
          return false;
        }
      }
      return esAdmin;

    case ACCIONES.GESTIONAR_FINANZAS_PROPIAS:
      return true;

    default:
      return false;
  }
};

export default { ACCIONES, puede };
