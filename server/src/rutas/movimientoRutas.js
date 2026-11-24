import { Router } from 'express';
import { movimientoControlador } from '../controladores/movimientoControlador.js';
import { autenticar } from '../middlewares/autenticar.js';

const enrutador = Router();

// Todas las rutas de movimientos exigen autenticación (HU-05 y HU-06)
enrutador.use(autenticar);

enrutador.get('/', (req, res, next) => movimientoControlador.listar(req, res, next));
enrutador.get('/:id', (req, res, next) => movimientoControlador.obtenerPorId(req, res, next));
enrutador.post('/', (req, res, next) => movimientoControlador.registrar(req, res, next));
enrutador.put('/:id', (req, res, next) => movimientoControlador.editar(req, res, next));
enrutador.delete('/:id', (req, res, next) => movimientoControlador.eliminar(req, res, next));

export default enrutador;
