/**
 * Clase personalizada para la gestión de errores operacionales de la aplicación.
 * Permite estandarizar el código HTTP, el estado del error y la lista de fallos de validación.
 */
export class ErrorApp extends Error {
  /**
   * @param {string} mensaje - Mensaje descriptivo en español del error.
   * @param {number} codigoEstado - Código de estado HTTP (400, 401, 403, 404, 409, 429, 500).
   * @param {Array} [errores=[]] - Lista detallada de errores (ej. validaciones de campos).
   */
  constructor(mensaje, codigoEstado = 500, errores = []) {
    super(mensaje);

    this.mensaje = mensaje;
    this.codigoEstado = codigoEstado;
    this.estado = `${codigoEstado}`.startsWith('4') ? 'fallo' : 'error';
    this.esOperacional = true;
    this.errores = errores;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorApp;
