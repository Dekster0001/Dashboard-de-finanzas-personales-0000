import { authServicio } from '../servicios/authServicio.js';
import { responderExito } from '../utils/respuestas.js';

class AuthControlador {
  async registro(req, res, next) {
    try {
      const { nombre, correo, contrasena } = req.body;
      const resultado = await authServicio.registrarUsuario({ nombre, correo, contrasena });
      return responderExito(res, 201, 'Usuario registrado exitosamente', resultado);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { correo, contrasena } = req.body;
      const resultado = await authServicio.iniciarSesion({ correo, contrasena });
      return responderExito(res, 200, 'Inicio de sesión exitoso', resultado);
    } catch (error) {
      next(error);
    }
  }

  async olvideContrasena(req, res, next) {
    try {
      const { correo } = req.body;
      const resultado = await authServicio.solicitarRecuperacionContrasena(correo);
      return responderExito(res, 200, resultado.mensaje);
    } catch (error) {
      next(error);
    }
  }

  async restablecerContrasena(req, res, next) {
    try {
      const { tokenRecuperacion, nuevaContrasena } = req.body;
      const resultado = await authServicio.restablecerContrasena({
        tokenRecuperacion,
        nuevaContrasena
      });
      return responderExito(res, 200, resultado.mensaje);
    } catch (error) {
      next(error);
    }
  }

  async perfil(req, res, next) {
    try {
      const perfil = await authServicio.obtenerPerfil(req.usuario.uuid);
      return responderExito(res, 200, 'Perfil obtenido', perfil);
    } catch (error) {
      next(error);
    }
  }
}

export const authControlador = new AuthControlador();
export default authControlador;
