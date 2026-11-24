import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { usuarioRepositorio } from '../repositorios/usuarioRepositorio.js';
import { correoServicio } from './correoServicio.js';
import { ErrorApp } from '../utils/ErrorApp.js';
import { entorno } from '../config/entorno.js';

class AuthServicio {
  async registrarUsuario({ nombre, correo, contrasena }) {
    const correoNormalizado = correo.toLowerCase().trim();
    const nombreLimpio = nombre.trim();

    const usuarioExistente = await usuarioRepositorio.buscarPorCorreo(correoNormalizado);
    if (usuarioExistente) {
      throw new ErrorApp('El correo ya está registrado', 409);
    }

    const salt = await bcryptjs.genSalt(10);
    const contrasenaHash = await bcryptjs.hash(contrasena, salt);

    const nuevoUsuario = await usuarioRepositorio.crear({
      nombre: nombreLimpio,
      correo: correoNormalizado,
      contrasenaHash,
      rol: 'USUARIO',
      activo: true
    });

    // Generar JWT automático para experiencia fluida en el registro (E1 HU-01)
    const token = jwt.sign(
      {
        id: nuevoUsuario.uuid,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      },
      entorno.jwtSecreto,
      { expiresIn: entorno.jwtExpira }
    );

    return {
      token,
      usuario: {
        uuid: nuevoUsuario.uuid,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    };
  }

  async iniciarSesion({ correo, contrasena }) {
    const correoNormalizado = correo.toLowerCase().trim();

    const usuario = await usuarioRepositorio.buscarPorCorreoConCredenciales(correoNormalizado);
    if (!usuario) {
      throw new ErrorApp('Credenciales inválidas', 401);
    }

    if (!usuario.activo) {
      throw new ErrorApp('Su cuenta se encuentra inactiva. Contacte al administrador.', 403);
    }

    if (usuario.estaBloqueado()) {
      const minutosRestantes = Math.ceil((usuario.bloqueadoHasta - new Date()) / 60000);
      throw new ErrorApp(
        `Cuenta bloqueada temporalmente por exceso de intentos fallidos. Intente nuevamente en ${minutosRestantes} minutos.`,
        429
      );
    }

    const esContrasenaValida = await usuario.compararContrasena(contrasena);
    if (!esContrasenaValida) {
      await usuario.registrarIntentoFallido();

      if (usuario.estaBloqueado()) {
        throw new ErrorApp(
          'Ha superado el límite de 5 intentos fallidos. Su cuenta ha sido bloqueada temporalmente por 15 minutos.',
          429
        );
      }

      throw new ErrorApp('Credenciales inválidas', 401);
    }

    if (usuario.intentosFallidosLogin > 0 || usuario.bloqueadoHasta) {
      await usuario.restablecerIntentos();
    }

    const payload = {
      id: usuario.uuid,
      correo: usuario.correo,
      rol: usuario.rol
    };

    const token = jwt.sign(payload, entorno.jwtSecreto, {
      expiresIn: entorno.jwtExpira // '1h'
    });

    return {
      token,
      usuario: {
        uuid: usuario.uuid,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    };
  }

  async solicitarRecuperacionContrasena(correo) {
    const correoNormalizado = correo.toLowerCase().trim();
    const usuario = await usuarioRepositorio.buscarPorCorreo(correoNormalizado);

    if (usuario && usuario.activo) {
      const tokenPlano = usuario.generarTokenRecuperacion();
      await usuarioRepositorio.guardar(usuario);
      await correoServicio.enviarCorreoRecuperacion(usuario.correo, usuario.nombre, tokenPlano);
    }

    // Respuesta genérica siempre idéntica (mitigación de enumeración de cuentas)
    return {
      mensaje: 'Si el correo electrónico coincide con una cuenta activa, recibirá las instrucciones de recuperación en breve.'
    };
  }

  async restablecerContrasena({ tokenRecuperacion, nuevaContrasena }) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(tokenRecuperacion)
      .digest('hex');

    const usuario = await usuarioRepositorio.buscarPorTokenRecuperacion(tokenHash);
    if (!usuario) {
      throw new ErrorApp('Enlace inválido o expirado', 400);
    }

    const salt = await bcryptjs.genSalt(10);
    usuario.contrasenaHash = await bcryptjs.hash(nuevaContrasena, salt);

    usuario.tokenRecuperacionHash = undefined;
    usuario.tokenRecuperacionExpira = undefined;
    usuario.intentosFallidosLogin = 0;
    usuario.bloqueadoHasta = null;

    await usuarioRepositorio.guardar(usuario);

    return {
      mensaje: 'Contraseña actualizada correctamente. Ya puede iniciar sesión.'
    };
  }

  async obtenerPerfil(uuid) {
    const usuario = await usuarioRepositorio.buscarPorUuid(uuid);
    if (!usuario) {
      throw new ErrorApp('Usuario no encontrado', 404);
    }

    return {
      uuid: usuario.uuid,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      activo: usuario.activo,
      creadoEn: usuario.creadoEn
    };
  }
}

export const authServicio = new AuthServicio();
export default authServicio;
