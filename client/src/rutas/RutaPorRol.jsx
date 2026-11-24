import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexto/ContextoAuth.jsx';
import Swal from 'sweetalert2';

/**
 * Componente guardián basado en Roles (RBAC).
 * Permite el acceso únicamente si el rol del usuario figura en rolesPermitidos.
 * @param {{ rolesPermitidos: string[] }} props
 */
export function RutaPorRol({ rolesPermitidos = [] }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!rolesPermitidos.includes(usuario.rol)) {
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'No tienes los permisos requeridos para acceder a este módulo administrativo.',
      confirmButtonColor: '#2563eb'
    });
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RutaPorRol;
