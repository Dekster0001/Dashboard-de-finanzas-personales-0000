import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ProveedorAuth } from './contexto/ContextoAuth.jsx';
import RutaPrivada from './rutas/RutaPrivada.jsx';
import RutaPorRol from './rutas/RutaPorRol.jsx';

import LayoutPrincipal from './componentes/layout/LayoutPrincipal.jsx';
import Login from './paginas/Login.jsx';
import Registro from './paginas/Registro.jsx';
import OlvideContrasena from './paginas/OlvideContrasena.jsx';
import RestablecerContrasena from './paginas/RestablecerContrasena.jsx';
import Dashboard from './paginas/Dashboard.jsx';
import Movimientos from './paginas/Movimientos.jsx';
import Cuentas from './paginas/Cuentas.jsx';
import Categorias from './paginas/Categorias.jsx';
import Presupuesto from './paginas/Presupuesto.jsx';
import AdminUsuarios from './paginas/AdminUsuarios.jsx';

/**
 * Componente Raíz de la Aplicación Frontend.
 * Define la estructura de enrutamiento público y privado con protección RBAC.
 */
export function App() {
  return (
    <BrowserRouter>
      <ProveedorAuth>
        {/* Contenedor global de notificaciones Toast */}
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        <Routes>
          {/* Rutas Públicas de Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
          <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />

          {/* Rutas Privadas Protegidas con JWT */}
          <Route element={<RutaPrivada />}>
            <Route element={<LayoutPrincipal />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/movimientos" element={<Movimientos />} />
              <Route path="/cuentas" element={<Cuentas />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/presupuesto" element={<Presupuesto />} />

              {/* Ruta Exclusiva para Administradores (RBAC - HU-10) */}
              <Route element={<RutaPorRol rolesPermitidos={['ADMIN']} />}>
                <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              </Route>
            </Route>
          </Route>

          {/* Ruta Comodín: Redirige al Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ProveedorAuth>
    </BrowserRouter>
  );
}

export default App;
