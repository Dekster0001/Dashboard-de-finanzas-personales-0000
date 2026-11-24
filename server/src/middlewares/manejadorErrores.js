import { ErrorApp } from '../utils/ErrorApp.js';

/**
 * Middleware centralizado para la gestión homogénea de errores en la aplicación.
 * Garantiza respuestas con la estructura uniforme: { estado, mensaje, errores? }.
 */
export const manejadorErrores = (err, req, res, next) => {
  let error = { ...err };
  error.mensaje = err.mensaje;
  error.codigoEstado = err.codigoEstado || 500;
  error.estado = err.estado || 'error';
  error.errores = err.errores || [];

  // Error de ID no válido en Mongoose (CastError)
  if (err.name === 'CastError') {
    const mensaje = `Formato inválido para el campo '${err.path}': valor '${err.value}' no es un identificador válido.`;
    error = new ErrorApp(mensaje, 400);
  }

  // Error de clave duplicada en MongoDB (código 11000)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'recurso';
    const mensaje = `El ${campo} ya se encuentra registrado en el sistema.`;
    error = new ErrorApp(mensaje, 409);
  }

  // Errores de validación de esquemas de Mongoose
  if (err.name === 'ValidationError') {
    const erroresDetalle = Object.values(err.errors).map((item) => ({
      campo: item.path,
      mensaje: item.message
    }));
    error = new ErrorApp('Datos de entrada no válidos', 400, erroresDetalle);
  }

  // Errores en tokens JWT
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorApp('Token de autenticación inválido. Inicie sesión nuevamente.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ErrorApp('Su sesión ha caducado. Por favor vuelva a iniciar sesión.', 401);
  }

  // Construcción de la respuesta uniforme { estado, mensaje, errores? }
  const respuesta = {
    estado: error.estado || 'error',
    mensaje: error.mensaje || 'Ha ocurrido un error interno en el servidor.'
  };

  if (error.errores && error.errores.length > 0) {
    respuesta.errores = error.errores;
  }

  if (process.env.NODE_ENV !== 'production' && !err.esOperacional) {
    console.error('[Error no controlado]:', err);
  }

  return res.status(error.codigoEstado).json(respuesta);
};

export default manejadorErrores;
