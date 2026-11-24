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

  /**
   * Lista usuarios aplicando búsqueda por nombre/correo y paginación para el panel RBAC.
   */
  async listarConPaginacion({ busqueda = '', pagina = 1, limite = 10 } = {}) {
    const consulta = {};
    if (busqueda && busqueda.trim()) {
      const textoEscapado = busqueda.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(textoEscapado, 'i');
      consulta.$or = [{ nombre: regex }, { correo: regex }];
    }

    const paginaNum = Math.max(1, Number(pagina) || 1);
    const limiteNum = Math.max(1, Math.min(100, Number(limite) || 10));
    const saltar = (paginaNum - 1) * limiteNum;

    const [totalRegistros, usuarios] = await Promise.all([
      ModeloUsuario.countDocuments(consulta),
      ModeloUsuario.find(consulta)
        .sort({ creadoEn: -1 })
        .skip(saltar)
        .limit(limiteNum)
    ]);

    return {
      usuarios,
      paginacion: {
        paginaActual: paginaNum,
        limite: limiteNum,
        totalRegistros,
        totalPaginas: Math.ceil(totalRegistros / limiteNum) || 1
      }
    };
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
