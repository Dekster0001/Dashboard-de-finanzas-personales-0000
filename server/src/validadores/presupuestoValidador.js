import { ErrorApp } from '../utils/ErrorApp.js';
import { esMesValido } from '../utils/fechas.js';

/**
 * Middleware para validar el parámetro de ruta :mes (formato AAAA-MM).
 */
export function validarParametroMes(req, res, next) {
  const { mes } = req.params;
  if (!mes || !esMesValido(mes)) {
    return next(new ErrorApp('El formato del mes en la ruta debe ser AAAA-MM (ej. 2026-11).', 400));
  }
  next();
}

/**
 * Middleware para validar la definición o modificación de un presupuesto.
 */
export function validarCuerpoPresupuesto(req, res, next) {
  const monto = req.body.montoLimiteEnCentavos ?? req.body.limite;

  if (monto === undefined || monto === null) {
    return next(new ErrorApp('El monto límite es obligatorio.', 400));
  }

  if (typeof monto !== 'number' || !Number.isInteger(monto) || monto <= 0) {
    return next(
      new ErrorApp('El monto límite debe ser un número positivo mayor a 0.', 400)
    );
  }

  // Normalizar el valor en req.body
  req.body.montoLimiteEnCentavos = monto;

  next();
}
