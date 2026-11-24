import validator from 'validator';

/**
 * Reglas de validación centralizadas basadas en Validator.js.
 */

export const esCorreoValido = (correo) => {
  if (!correo || typeof correo !== 'string') return false;
  return validator.isEmail(correo.trim());
};

export const esContrasenaRobusta = (contrasena) => {
  if (!contrasena || typeof contrasena !== 'string') return false;
  const longitudValida = validator.isLength(contrasena, { min: 8 });
  const tieneLetra = /[A-Za-z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);
  return longitudValida && tieneLetra && tieneNumero;
};

export const esMontoEnCentavosValido = (monto) => {
  return Number.isInteger(monto) && monto > 0;
};

export const esMesValido = (mes) => {
  if (!mes || typeof mes !== 'string') return false;
  // Formato AAAA-MM (ej. 2026-11)
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(mes);
};

export default {
  esCorreoValido,
  esContrasenaRobusta,
  esMontoEnCentavosValido,
  esMesValido
};
