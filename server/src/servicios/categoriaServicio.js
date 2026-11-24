import { categoriaRepositorio } from '../repositorios/categoriaRepositorio.js';
import { movimientoRepositorio } from '../repositorios/movimientoRepositorio.js';
import { ErrorApp } from '../utils/ErrorApp.js';

/**
 * Servicio de Categorías de Ingresos y Gastos (HU-04).
 * Administra la taxonomía financiera con control estricto de unicidad por inquilino.
 */
class CategoriaServicio {
  /**
   * Lista las categorías activas del usuario, opcionalmente filtradas por tipo.
   * @param {string} usuarioId
   * @param {string} [tipo] - 'INGRESO' o 'GASTO'
   */
  async listarCategorias(usuarioId, tipo = null) {
    let tipoFormateado = null;
    if (tipo) {
      tipoFormateado = tipo.toUpperCase().trim();
      if (!['INGRESO', 'GASTO'].includes(tipoFormateado)) {
        throw new ErrorApp("El filtro de tipo debe ser 'INGRESO' o 'GASTO'.", 400);
      }
    }
    return await categoriaRepositorio.listarActivas(usuarioId, tipoFormateado);
  }

  /**
   * Obtiene una categoría por su ID validando que pertenezca al usuario.
   * @param {string} usuarioId
   * @param {string} id
   */
  async obtenerCategoriaPorId(usuarioId, id) {
    const categoria = await categoriaRepositorio.buscarPorId(usuarioId, id);
    if (!categoria) {
      throw new ErrorApp('Categoría no encontrada.', 404);
    }
    return categoria;
  }

  /**
   * Crea una nueva categoría para el usuario.
   * Regla de negocio: El nombre es único por usuario y tipo. Si ya existe, responde 409 (HU-04 E3).
   * @param {string} usuarioId
   * @param {Object} datos - { nombre, tipo, color }
   */
  async crearCategoria(usuarioId, { nombre, tipo, color = '#10B981' }) {
    if (!nombre || nombre.trim().length < 2) {
      throw new ErrorApp('El nombre de la categoría es obligatorio y debe tener al menos 2 caracteres.', 400);
    }

    const tipoFormateado = (tipo || '').toUpperCase().trim();
    if (!['INGRESO', 'GASTO'].includes(tipoFormateado)) {
      throw new ErrorApp("El tipo de categoría debe ser 'INGRESO' o 'GASTO'.", 400);
    }

    // Validar unicidad compuesta: (usuarioId, nombre, tipo)
    const categoriaExistente = await categoriaRepositorio.buscarPorNombreYTipo(
      usuarioId,
      nombre.trim(),
      tipoFormateado
    );

    if (categoriaExistente) {
      throw new ErrorApp('La categoría ya existe', 409);
    }

    return await categoriaRepositorio.crear(usuarioId, {
      nombre: nombre.trim(),
      tipo: tipoFormateado,
      color: color || (tipoFormateado === 'INGRESO' ? '#10B981' : '#EF4444'),
      activo: true
    });
  }

  /**
   * Edita el nombre o color de una categoría.
   * @param {string} usuarioId
   * @param {string} id
   * @param {Object} datos - { nombre, color }
   */
  async editarCategoria(usuarioId, id, { nombre, color }) {
    const categoria = await this.obtenerCategoriaPorId(usuarioId, id);

    const actualizacion = {};
    if (nombre !== undefined && nombre.trim() !== categoria.nombre) {
      if (nombre.trim().length < 2) {
        throw new ErrorApp('El nombre de la categoría debe tener al menos 2 caracteres.', 400);
      }
      // Verificar si el nuevo nombre colisiona con otra categoría existente
      const colision = await categoriaRepositorio.buscarPorNombreYTipo(
        usuarioId,
        nombre.trim(),
        categoria.tipo
      );
      if (colision && colision._id.toString() !== id) {
        throw new ErrorApp('La categoría ya existe', 409);
      }
      actualizacion.nombre = nombre.trim();
    }

    if (color !== undefined) {
      actualizacion.color = color;
    }

    return await categoriaRepositorio.actualizarPorId(usuarioId, id, actualizacion);
  }

  /**
   * Elimina una categoría.
   * @param {string} usuarioId
   * @param {string} id
   */
  async eliminarCategoria(usuarioId, id) {
    await this.obtenerCategoriaPorId(usuarioId, id);

    // Si tiene movimientos asociados, aplicamos borrado lógico para no romper el histórico
    const cantidadMovimientos = await movimientoRepositorio.contarPorCategoria(usuarioId, id);
    if (cantidadMovimientos > 0) {
      await categoriaRepositorio.actualizarPorId(usuarioId, id, { activo: false });
      return { mensaje: 'Categoría desactivada exitosamente para preservar registros históricos.' };
    }

    await categoriaRepositorio.eliminarPorId(usuarioId, id);
    return { mensaje: 'Categoría eliminada exitosamente.' };
  }
}

export const categoriaServicio = new CategoriaServicio();
export default categoriaServicio;
