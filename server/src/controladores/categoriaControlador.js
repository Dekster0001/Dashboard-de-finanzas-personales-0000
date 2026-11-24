import { categoriaServicio } from '../servicios/categoriaServicio.js';
import { responderExito } from '../utils/respuestas.js';

class CategoriaControlador {
  async listar(req, res, next) {
    try {
      const { tipo } = req.query;
      const categorias = await categoriaServicio.listarCategorias(req.usuario.id || req.usuario._id, tipo);
      return responderExito(res, 200, 'Lista de categorías obtenida', categorias);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const categoria = await categoriaServicio.obtenerCategoriaPorId(
        req.usuario.id || req.usuario._id,
        req.params.id
      );
      return responderExito(res, 200, 'Detalle de categoría obtenido', categoria);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const { nombre, tipo, color } = req.body;
      const nuevaCategoria = await categoriaServicio.crearCategoria(req.usuario.id || req.usuario._id, {
        nombre,
        tipo,
        color
      });
      return responderExito(res, 201, 'Categoría creada exitosamente', nuevaCategoria);
    } catch (error) {
      next(error);
    }
  }

  async editar(req, res, next) {
    try {
      const { nombre, color } = req.body;
      const categoriaActualizada = await categoriaServicio.editarCategoria(
        req.usuario.id || req.usuario._id,
        req.params.id,
        { nombre, color }
      );
      return responderExito(res, 200, 'Categoría actualizada exitosamente', categoriaActualizada);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const resultado = await categoriaServicio.eliminarCategoria(
        req.usuario.id || req.usuario._id,
        req.params.id
      );
      return responderExito(res, 200, resultado.mensaje);
    } catch (error) {
      next(error);
    }
  }
}

export const categoriaControlador = new CategoriaControlador();
export default categoriaControlador;
