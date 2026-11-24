import axios from 'axios';

/**
 * Instancia centralizada de Axios para la comunicación con la API REST.
 * Configura la URL base y gestiona la inyección y revocación del token JWT.
 */
const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de Solicitud: Inyecta el token Bearer JWT si existe en localStorage
clienteApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Captura errores 401 (token expirado o inválido) y redirige al login
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      // Evitar bucle si ya estamos en una página de autenticación pública
      const rutasPublicas = ['/login', '/registro', '/olvide-contrasena', '/restablecer-contrasena'];
      if (!rutasPublicas.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default clienteApi;
