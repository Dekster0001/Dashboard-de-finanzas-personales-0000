import React, { createContext, useContext, useState, useEffect } from 'react';
import clienteApi from '../api/clienteApi.js';
import { toast } from 'react-toastify';

export const ContextoAuth = createContext(null);

/**
 * Proveedor de Estado de Autenticación Global (React Context).
 * Gestiona el usuario autenticado, token JWT y sincronización con localStorage.
 */
export function ProveedorAuth({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [cargando, setCargando] = useState(true);

  // Al montar la aplicación, si existe un token almacenado, validamos la sesión con /auth/perfil
  useEffect(() => {
    async function verificarSesion() {
      const tokenGuardado = localStorage.getItem('token');
      if (!tokenGuardado) {
        setCargando(false);
        return;
      }

      try {
        const respuesta = await clienteApi.get('/auth/perfil');
        if (respuesta.data && respuesta.data.datos) {
          setUsuario(respuesta.data.datos.usuario || respuesta.data.datos);
        }
      } catch (error) {
        console.warn('La sesión guardada ha caducado o es inválida:', error.message);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    }

    verificarSesion();
  }, []);

  /**
   * Inicia sesión con correo y contraseña.
   */
  async function iniciarSesion(correo, contrasena) {
    try {
      const respuesta = await clienteApi.post('/auth/login', { correo, contrasena });
      const { token: nuevoToken, usuario: datosUsuario } = respuesta.data.datos;

      localStorage.setItem('token', nuevoToken);
      localStorage.setItem('usuario', JSON.stringify(datosUsuario));

      setToken(nuevoToken);
      setUsuario(datosUsuario);

      toast.success(`¡Bienvenido de nuevo, ${datosUsuario.nombre}!`);
      return datosUsuario;
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al iniciar sesión. Verifica tus credenciales.';
      toast.error(mensaje);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario en la plataforma.
   */
  async function registrar(nombre, correo, contrasena) {
    try {
      const respuesta = await clienteApi.post('/auth/registro', {
        nombre,
        correo,
        contrasena
      });
      const { token: nuevoToken, usuario: datosUsuario } = respuesta.data.datos;

      localStorage.setItem('token', nuevoToken);
      localStorage.setItem('usuario', JSON.stringify(datosUsuario));

      setToken(nuevoToken);
      setUsuario(datosUsuario);

      toast.success('¡Registro exitoso! Tu cuenta ha sido creada.');
      return datosUsuario;
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al registrar la cuenta.';
      toast.error(mensaje);
      throw error;
    }
  }

  /**
   * Cierra la sesión activa y limpia los datos del navegador.
   */
  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    toast.info('Has cerrado sesión correctamente.');
  }

  /**
   * Actualiza los datos locales del usuario (ej. tras cambio de perfil).
   */
  function actualizarUsuario(datosNuevos) {
    setUsuario((previo) => {
      const actualizado = { ...previo, ...datosNuevos };
      localStorage.setItem('usuario', JSON.stringify(actualizado));
      return actualizado;
    });
  }

  const valor = {
    usuario,
    token,
    cargando,
    autenticado: !!usuario,
    iniciarSesion,
    registrar,
    cerrarSesion,
    actualizarUsuario
  };

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>;
}

/**
 * Hook personalizado para consumir el contexto de autenticación en cualquier componente.
 */
export function useAuth() {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth debe ser utilizado dentro de un ProveedorAuth');
  }
  return contexto;
}

export default ContextoAuth;
