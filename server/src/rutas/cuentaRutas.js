import { Router } from 'express';
import { cuentaControlador } from '../controladores/cuentaControlador.js';
import { autenticar } from '../middlewares/autenticar.js';

const enrutador = Router();

// Todas las rutas de cuentas exigen autenticación (HU-03)
enrutador.use(autenticar);

enrutador.get('/', (req, res, next) => cuentaControlador.listar(req, res, next));
enrutador.get('/:id', (req, res, next) => cuentaControlador.obtenerPorId(req, res, next));
enrutador.post('/', (req, res, next) => cuentaControlador.crear(req, res, next));
enrutador.put('/:id', (req, res, next) => cuentaControlador.editar(req, res, next));
enrutador.delete('/:id', (req, res, next) => cuentaControlador.eliminar(req, res, next));

export default enrutador;
