import validator from 'validator';
import { ErrorApp } from '../utils/ErrorApp.js';
import { esCorreoValido, esContrasenaRobusta, esMesValido } from '../validadores/reglasValidacion.js';

export const validarRegistro = (req, res, next) => {
  const { nombre, correo, contrasena } = req.body;
  const errores = [];

  if (!nombre || validator.isEmpty(nombre.toString().trim())) {
    errores.push({ campo: 'nombre', mensaje: 'El nombre completo es obligatorio.' });
  } else if (!validator.isLength(nombre.toString().trim(), { min: 2, max: 100 })) {
    errores.push({ campo: 'nombre', mensaje: 'El nombre debe tener entre 2 y 100 caracteres.' });
  }

  if (!correo || validator.isEmpty(correo.toString().trim())) {
    errores.push({ campo: 'correo', mensaje: 'El correo electrónico es obligatorio.' });
  } else if (!esCorreoValido(correo)) {
    errores.push({ campo: 'correo', mensaje: 'Debe ingresar una dirección de correo electrónico válida.' });
  }

  if (!contrasena || validator.isEmpty(contrasena.toString())) {
    errores.push({ campo: 'contrasena', mensaje: 'La contraseña es obligatoria.' });
  } else if (!esContrasenaRobusta(contrasena)) {
    errores.push({
      campo: 'contrasena',
      mensaje: 'La contraseña debe contener al menos 8 caracteres, incluyendo al menos una letra y un número.'
    });
  }

  if (errores.length > 0) {
    return next(new ErrorApp('Existen errores en los datos ingresados', 400, errores));
  }

  req.body.nombre = validator.trim(req.body.nombre);
  req.body.correo = validator.normalizeEmail(req.body.correo.trim()) || req.body.correo.trim();
  next();
};

export const validarLogin = (req, res, next) => {
  const { correo, contrasena } = req.body;
  const errores = [];

  if (!correo || validator.isEmpty(correo.toString().trim())) {
    errores.push({ campo: 'correo', mensaje: 'El correo electrónico es obligatorio.' });
  } else if (!esCorreoValido(correo)) {
    errores.push({ campo: 'correo', mensaje: 'El formato del correo electrónico es inválido.' });
  }

  if (!contrasena || validator.isEmpty(contrasena.toString())) {
    errores.push({ campo: 'contrasena', mensaje: 'La contraseña es obligatoria.' });
  }

  if (errores.length > 0) {
    return next(new ErrorApp('Credenciales incompletas o con formato inválido', 400, errores));
  }

  req.body.correo = req.body.correo.trim();
  next();
};

export const validarOlvideContrasena = (req, res, next) => {
  const { correo } = req.body;
  const errores = [];

  if (!correo || validator.isEmpty(correo.toString().trim())) {
    errores.push({ campo: 'correo', mensaje: 'El correo electrónico es obligatorio.' });
  } else if (!esCorreoValido(correo)) {
    errores.push({ campo: 'correo', mensaje: 'Debe ingresar una dirección de correo electrónico válida.' });
  }

  if (errores.length > 0) {
    return next(new ErrorApp('Correo electrónico inválido', 400, errores));
  }

  req.body.correo = req.body.correo.trim();
  next();
};

export const validarRestablecerContrasena = (req, res, next) => {
  const { tokenRecuperacion, nuevaContrasena } = req.body;
  const errores = [];

  if (!tokenRecuperacion || validator.isEmpty(tokenRecuperacion.toString().trim())) {
    errores.push({ campo: 'tokenRecuperacion', mensaje: 'El token de recuperación es obligatorio.' });
  }

  if (!nuevaContrasena || validator.isEmpty(nuevaContrasena.toString())) {
    errores.push({ campo: 'nuevaContrasena', mensaje: 'La nueva contraseña es obligatoria.' });
  } else if (!esContrasenaRobusta(nuevaContrasena)) {
    errores.push({
      campo: 'nuevaContrasena',
      mensaje: 'La nueva contraseña debe tener al menos 8 caracteres, con al menos una letra y un número.'
    });
  }

  if (errores.length > 0) {
    return next(new ErrorApp('Datos de restablecimiento inválidos', 400, errores));
  }

  next();
};

export default {
  validarRegistro,
  validarLogin,
  validarOlvideContrasena,
  validarRestablecerContrasena
};
