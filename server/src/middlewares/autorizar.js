import { ErrorApp } from '../utils/ErrorApp.js';

/**
 * Middleware 'autorizar': verifica que el usuario autenticado cuente con los roles exigidos (RBAC).
 * Si no cuenta con el rol, responde HTTP 403 Forbidden.
 * @param {...string} rolesPermitidos - Lista de roles permitidos (ej. 'ADMIN', 'USUARIO')
 */
export const autorizar = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return next(
        new ErrorApp('No tienes permisos para acceder a este recurso.', 403)
      );
    }
    return next();
  };
};

export default autorizar;
