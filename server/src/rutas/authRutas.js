import { Router } from 'express';
import { authControlador } from '../controladores/authControlador.js';
import {
  validarRegistro,
  validarLogin,
  validarOlvideContrasena,
  validarRestablecerContrasena
} from '../middlewares/validar.js';
import { autenticar } from '../middlewares/autenticar.js';

const enrutador = Router();

// Rutas de Autenticación (HU-01 y HU-02 según word.md)
enrutador.post('/registro', validarRegistro, (req, res, next) =>
  authControlador.registro(req, res, next)
);

enrutador.post('/login', validarLogin, (req, res, next) =>
  authControlador.login(req, res, next)
);

enrutador.post('/olvide-contrasena', validarOlvideContrasena, (req, res, next) =>
  authControlador.olvideContrasena(req, res, next)
);

enrutador.post('/restablecer-contrasena', validarRestablecerContrasena, (req, res, next) =>
  authControlador.restablecerContrasena(req, res, next)
);

enrutador.get('/perfil', autenticar, (req, res, next) =>
  authControlador.perfil(req, res, next)
);

export default enrutador;
