import passport from 'passport';
import { ErrorApp } from '../utils/ErrorApp.js';

/**
 * Middleware 'autenticar': verifica el token JWT emitido con passport-jwt.
 * Si el token es válido, inyecta req.usuario.
 * Si expiró o es inválido, retorna HTTP 401.
 */
export const autenticar = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, usuario, info) => {
    if (err) {
      return next(err);
    }

    if (!usuario) {
      if (info && info.name === 'TokenExpiredError') {
        return next(
          new ErrorApp('Su sesión ha caducado por tiempo de inactividad (1 hora). Por favor vuelva a iniciar sesión.', 401)
        );
      }
      return next(
        new ErrorApp('Acceso no autorizado. Debe proporcionar un token de sesión válido.', 401)
      );
    }

    req.usuario = usuario;
    return next();
  })(req, res, next);
};

export default autenticar;
