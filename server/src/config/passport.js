import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { usuarioRepositorio } from '../repositorios/usuarioRepositorio.js';
import { entorno } from './entorno.js';

const opcionesJwt = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: entorno.jwtSecreto
};

export const configurarPassport = () => {
  passport.use(
    new JwtStrategy(opcionesJwt, async (payload, done) => {
      try {
        const usuario = await usuarioRepositorio.buscarPorUuid(payload.id);

        if (!usuario || !usuario.activo) {
          return done(null, false);
        }

        return done(null, usuario);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export default configurarPassport;
