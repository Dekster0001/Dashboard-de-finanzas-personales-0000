import { Router } from 'express';
import { adminControlador } from '../controladores/adminControlador.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';

const enrutador = Router();

// Todas las rutas de administración exigen autenticación previa y rol ADMIN (HU-10)
enrutador.use(autenticar, autorizar('ADMIN'));

// GET /api/admin/usuarios - Listar todos los usuarios
enrutador.get('/usuarios', (req, res, next) => adminControlador.listar(req, res, next));
enrutador.get('/', (req, res, next) => adminControlador.listar(req, res, next));

// PATCH /api/admin/usuarios/:id/rol - Cambiar rol de usuario
enrutador.patch('/usuarios/:id/rol', (req, res, next) => adminControlador.cambiarRol(req, res, next));
enrutador.patch('/:id/rol', (req, res, next) => adminControlador.cambiarRol(req, res, next));

// PATCH /api/admin/usuarios/:id/estado - Activar o desactivar usuario
enrutador.patch('/usuarios/:id/estado', (req, res, next) => adminControlador.cambiarEstado(req, res, next));
enrutador.patch('/:id/estado', (req, res, next) => adminControlador.cambiarEstado(req, res, next));

export default enrutador;
