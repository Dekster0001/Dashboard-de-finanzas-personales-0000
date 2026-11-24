import { Router } from 'express';
import { categoriaControlador } from '../controladores/categoriaControlador.js';
import { autenticar } from '../middlewares/autenticar.js';

const enrutador = Router();

// Todas las rutas de categorías exigen autenticación (HU-04)
enrutador.use(autenticar);

enrutador.get('/', (req, res, next) => categoriaControlador.listar(req, res, next));
enrutador.get('/:id', (req, res, next) => categoriaControlador.obtenerPorId(req, res, next));
enrutador.post('/', (req, res, next) => categoriaControlador.crear(req, res, next));
enrutador.put('/:id', (req, res, next) => categoriaControlador.editar(req, res, next));
enrutador.delete('/:id', (req, res, next) => categoriaControlador.eliminar(req, res, next));

export default enrutador;
