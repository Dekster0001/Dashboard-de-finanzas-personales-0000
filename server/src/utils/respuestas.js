/**
 * Utilidades para el formateo homogéneo de respuestas HTTP de la API REST.
 */
export const responderExito = (res, codigo = 200, mensaje = 'Operación exitosa', datos = null) => {
  const respuesta = {
    estado: 'exito',
    mensaje
  };

  if (datos !== null && datos !== undefined) {
    respuesta.datos = datos;
  }

  return res.status(codigo).json(respuesta);
};

/**
 * Sobrecarga compatible para controladores que envían (res, datos, mensaje, codigo)
 */
export const respuestaExito = (res, datos = null, mensaje = 'Operación exitosa', codigo = 200) => {
  return responderExito(res, codigo, mensaje, datos);
};

export const responderFallo = (res, codigo = 400, mensaje = 'Error en la solicitud', errores = []) => {
  const respuesta = {
    estado: 'fallo',
    mensaje
  };

  if (errores && errores.length > 0) {
    respuesta.errores = errores;
  }

  return res.status(codigo).json(respuesta);
};

export default { responderExito, respuestaExito, responderFallo };
