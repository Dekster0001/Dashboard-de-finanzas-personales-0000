import rateLimit from 'express-rate-limit';

/**
 * Limitador de tasa por IP para proteger endpoints de autenticación contra fuerza bruta.
 */
export const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    estado: 'fallo',
    mensaje: 'Demasiados intentos de inicio de sesión desde esta dirección IP. Intente nuevamente en 15 minutos.'
  }
});

export const limitadorRecuperacion = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    estado: 'fallo',
    mensaje: 'Ha realizado demasiadas solicitudes de recuperación. Intente nuevamente en 15 minutos.'
  }
});

export default { limitadorLogin, limitadorRecuperacion };
