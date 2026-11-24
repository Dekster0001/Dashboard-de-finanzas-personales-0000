import { ModeloUsuario } from '../modelos/Usuario.js';

/**
 * Repositorio de Usuarios.
 * Encapsula las operaciones de acceso a datos de la entidad Usuario en MongoDB Atlas.
 */
class UsuarioRepositorio {
  async crear(datosUsuario) {
    return await ModeloUsuario.create(datosUsuario);
  }

  async buscarPorCorreo(correo) {
    return await ModeloUsuario.findOne({ correo: correo.toLowerCase().trim() });
  }

  async buscarPorCorreoConCredenciales(correo) {
    return await ModeloUsuario.findOne({ correo: correo.toLowerCase().trim() }).select(
      '+contrasenaHash +tokenRecuperacionHash +tokenRecuperacionExpira'
    );
  }

  async buscarPorUuid(uuid) {
    return await ModeloUsuario.findOne({ uuid });
  }

  async buscarPorId(id) {
    return await ModeloUsuario.findById(id);
  }

  async buscarPorTokenRecuperacion(tokenHash) {
    return await ModeloUsuario.findOne({
      tokenRecuperacionHash: tokenHash,
      tokenRecuperacionExpira: { $gt: new Date() }
    }).select('+tokenRecuperacionHash +tokenRecuperacionExpira');
  }

  async listarTodos(filtros = {}) {
    return await ModeloUsuario.find(filtros).sort({ creadoEn: -1 });
  }

  async guardar(usuario) {
    return await usuario.save();
  }

  async actualizarPorId(id, datosActualizados) {
    return await ModeloUsuario.findByIdAndUpdate(id, datosActualizados, {
      new: true,
      runValidators: true
    });
  }
}

export const usuarioRepositorio = new UsuarioRepositorio();
export default usuarioRepositorio;
