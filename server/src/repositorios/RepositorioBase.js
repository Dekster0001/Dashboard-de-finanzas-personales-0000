/**
 * RepositorioBase Genérico para Entidades Dependientes.
 * Cumple con el aislamiento multiinquilino inmutable (SaaS).
 * Todo método exige forzosamente el 'usuarioId' obtenido del token JWT.
 * Ante un intento de acceso a un recurso ajeno (_id de otro usuario), retorna null (derivando en 404).
 */
export class RepositorioBase {
  /**
   * @param {import('mongoose').Model} modelo - Modelo Mongoose asociado
   */
  constructor(modelo) {
    this.modelo = modelo;
  }

  /**
   * Valida la presencia obligatoria de usuarioId para prevenir filtrado de datos.
   * @private
   */
  _validarUsuarioId(usuarioId) {
    if (!usuarioId) {
      throw new Error('El usuarioId es estrictamente obligatorio para garantizar el aislamiento multiinquilino');
    }
  }

  /**
   * Lista recursos del inquilino aplicando filtros opcionales.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {Object} filtros
   * @param {Object} opciones
   */
  async buscar(usuarioId, filtros = {}, opciones = {}) {
    this._validarUsuarioId(usuarioId);
    return await this.modelo.find({ ...filtros, usuarioId }, null, opciones);
  }

  /**
   * Busca un recurso específico por su ID garantizando que pertenezca al usuario.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} id
   */
  async buscarPorId(usuarioId, id) {
    this._validarUsuarioId(usuarioId);
    return await this.modelo.findOne({ _id: id, usuarioId });
  }

  /**
   * Crea un nuevo registro asignando inmutablemente el usuarioId.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {Object} datos
   */
  async crear(usuarioId, datos) {
    this._validarUsuarioId(usuarioId);
    return await this.modelo.create({ ...datos, usuarioId });
  }

  /**
   * Actualiza un recurso del usuario.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} id
   * @param {Object} datos
   */
  async actualizar(usuarioId, id, datos) {
    this._validarUsuarioId(usuarioId);
    return await this.modelo.findOneAndUpdate(
      { _id: id, usuarioId },
      datos,
      { new: true, runValidators: true }
    );
  }

  async actualizarPorId(usuarioId, id, datos) {
    return await this.actualizar(usuarioId, id, datos);
  }

  /**
   * Elimina un recurso del usuario.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} id
   */
  async eliminar(usuarioId, id) {
    this._validarUsuarioId(usuarioId);
    return await this.modelo.findOneAndDelete({ _id: id, usuarioId });
  }

  async eliminarPorId(usuarioId, id) {
    return await this.eliminar(usuarioId, id);
  }

  /**
   * Cuenta registros del usuario según filtros.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {Object} filtros
   */
  async contar(usuarioId, filtros = {}) {
    this._validarUsuarioId(usuarioId);
    return await this.modelo.countDocuments({ ...filtros, usuarioId });
  }
}

export default RepositorioBase;
