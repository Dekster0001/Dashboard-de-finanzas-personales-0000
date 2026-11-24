import { RepositorioBase } from './RepositorioBase.js';
import { ModeloCategoria } from '../modelos/Categoria.js';

/**
 * Repositorio de Categorías de Ingresos y Gastos.
 * Extiende RepositorioBase inyectando el aislamiento forzado por usuarioId.
 */
class CategoriaRepositorio extends RepositorioBase {
  constructor() {
    super(ModeloCategoria);
  }

  /**
   * Busca si ya existe una categoría con el mismo nombre y tipo para el usuario.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} nombre
   * @param {string} tipo
   */
  async buscarPorNombreYTipo(usuarioId, nombre, tipo) {
    const nombreEscapado = nombre.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return await this.modelo.findOne({
      usuarioId,
      nombre: new RegExp(`^${nombreEscapado}$`, 'i'),
      tipo
    });
  }

  /**
   * Lista las categorías activas del usuario, opcionalmente filtradas por tipo.
   * @param {string|import('mongoose').Types.ObjectId} usuarioId
   * @param {string} [tipo] - 'INGRESO' o 'GASTO'
   */
  async listarActivas(usuarioId, tipo = null) {
    const filtros = { activo: true };
    if (tipo) {
      filtros.tipo = tipo;
    }
    return await this.buscar(usuarioId, filtros, { sort: { nombre: 1 } });
  }
}

export const categoriaRepositorio = new CategoriaRepositorio();
export default categoriaRepositorio;
