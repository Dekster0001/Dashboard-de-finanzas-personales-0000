import React, { useState, useEffect, useCallback } from 'react';
import clienteApi from '../api/clienteApi.js';
import { useAuth } from '../contexto/ContextoAuth.jsx';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Tabla from '../componentes/comunes/Tabla.jsx';
import Paginacion from '../componentes/comunes/Paginacion.jsx';
import { formatearFecha } from '../utils/formato.js';

/**
 * Pantalla de Administración y Supervisión de Usuarios (HU-10).
 * Accesible exclusivamente para usuarios con rol ADMIN.
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Buscador píldora flotante, badges de rol en azul pizarra y confirmaciones con curvas 3xl.
 */
export function AdminUsuarios() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [paginacionInfo, setPaginacionInfo] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    totalRegistros: 0
  });

  const cargarUsuarios = useCallback(async () => {
    try {
      setCargando(true);
      const params = {
        pagina: paginaActual,
        limite: 10
      };
      if (busqueda.trim()) {
        params.busqueda = busqueda.trim();
      }

      const res = await clienteApi.get('/admin/usuarios', { params });
      const { usuarios: lista, paginacion } = res.data.datos;

      setUsuarios(lista || []);
      if (paginacion) {
        setPaginacionInfo(paginacion);
      }
    } catch (error) {
      toast.error('Error al cargar la lista de usuarios del sistema.');
    } finally {
      setCargando(false);
    }
  }, [paginaActual, busqueda]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const esMismoUsuario = (usuarioFila) => {
    if (!usuarioFila || !usuarioActual) return false;
    if (usuarioFila.uuid && usuarioActual.uuid) {
      return usuarioFila.uuid === usuarioActual.uuid;
    }
    if (usuarioFila._id && (usuarioActual._id || usuarioActual.id)) {
      return usuarioFila._id === (usuarioActual._id || usuarioActual.id);
    }
    return false;
  };

  const manejarCambiarRol = (usuarioFila) => {
    const esElMismo = esMismoUsuario(usuarioFila);

    if (esElMismo) {
      Swal.fire({
        icon: 'error',
        title: 'Acción Denegada',
        text: 'Por seguridad, no puedes quitarte tu propio rol de administrador.',
        confirmButtonColor: '#102A43',
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-full font-bold px-5 py-2.5' }
      });
      return;
    }

    const nuevoRol = usuarioFila.rol === 'ADMIN' ? 'USUARIO' : 'ADMIN';

    Swal.fire({
      title: '¿Cambiar rol del usuario?',
      text: `El usuario "${usuarioFila.nombre}" pasará a tener el rol de ${nuevoRol}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#102A43',
      cancelButtonColor: '#9FB3C8',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full font-bold px-5 py-2.5',
        cancelButton: 'rounded-full font-bold px-5 py-2.5'
      }
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await clienteApi.patch(`/admin/usuarios/${usuarioFila._id || usuarioFila.uuid}/rol`, {
            rol: nuevoRol
          });
          toast.success(`Rol cambiado a ${nuevoRol} exitosamente.`);
          cargarUsuarios();
        } catch (err) {
          toast.error(err.response?.data?.mensaje || 'Error al cambiar el rol.');
        }
      }
    });
  };

  const manejarCambiarEstado = (usuarioFila) => {
    const esElMismo = esMismoUsuario(usuarioFila);

    if (esElMismo) {
      Swal.fire({
        icon: 'error',
        title: 'Acción Denegada',
        text: 'Por seguridad, no puedes desactivar tu propia cuenta activa.',
        confirmButtonColor: '#102A43',
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-full font-bold' }
      });
      return;
    }

    const nuevoEstado = !usuarioFila.activo;
    const accionTexto = nuevoEstado ? 'activar' : 'desactivar';

    Swal.fire({
      title: `¿Deseas ${accionTexto} la cuenta?`,
      text: `El usuario "${usuarioFila.nombre}" ${
        nuevoEstado ? 'podrá volver a acceder' : 'perderá el acceso'
      } a la plataforma.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: nuevoEstado ? '#0D9488' : '#BE123C',
      cancelButtonColor: '#9FB3C8',
      confirmButtonText: `Sí, ${accionTexto}`,
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full font-bold px-5 py-2.5',
        cancelButton: 'rounded-full font-bold px-5 py-2.5'
      }
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await clienteApi.patch(`/admin/usuarios/${usuarioFila._id || usuarioFila.uuid}/estado`, {
            activo: nuevoEstado
          });
          toast.success(`Cuenta ${nuevoEstado ? 'activada' : 'desactivada'} correctamente.`);
          cargarUsuarios();
        } catch (err) {
          toast.error(err.response?.data?.mensaje || 'Error al cambiar el estado.');
        }
      }
    });
  };

  const columnas = [
    {
      encabezado: 'Nombre Completo',
      render: (u) => {
        const esElMismo = esMismoUsuario(u);
        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#102A43]">{u.nombre}</span>
            {esElMismo && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F3EEE6] text-[#102A43] border border-[#9FB3C8]/40">
                (Tú)
              </span>
            )}
          </div>
        );
      }
    },
    {
      encabezado: 'Correo Electrónico',
      clave: 'correo'
    },
    {
      encabezado: 'Rol RBAC',
      render: (u) => (
        <span
          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
            u.rol === 'ADMIN'
              ? 'bg-[#102A43] text-[#BFA37C] border-[#102A43]'
              : 'bg-[#F3EEE6] text-[#334E68] border-[#9FB3C8]/40'
          }`}
        >
          {u.rol}
        </span>
      )
    },
    {
      encabezado: 'Estado',
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
            u.activo !== false
              ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30'
              : 'bg-rose-50 text-[#BE123C] border-rose-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${u.activo !== false ? 'bg-[#0D9488]' : 'bg-[#BE123C]'}`} />
          {u.activo !== false ? 'Activo' : 'Suspendido'}
        </span>
      )
    },
    {
      encabezado: 'Registrado',
      render: (u) => <span className="font-medium text-[#627D98]">{formatearFecha(u.creadoEn || u.createdAt)}</span>
    },
    {
      encabezado: 'Acciones',
      alineacion: 'center',
      render: (u) => {
        const esElMismo = esMismoUsuario(u);
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={esElMismo}
              onClick={() => manejarCambiarRol(u)}
              className="px-3 py-1 text-xs font-bold rounded-full border border-[#9FB3C8]/40 hover:border-[#102A43] hover:text-[#102A43] hover:bg-[#F3EEE6] text-[#334E68] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              title={esElMismo ? 'No puedes auto-revocar tu rol' : 'Cambiar rol'}
            >
              {u.rol === 'ADMIN' ? 'Quitar Admin' : 'Hacer Admin'}
            </button>
            <button
              type="button"
              disabled={esElMismo}
              onClick={() => manejarCambiarEstado(u)}
              className={`px-3 py-1 text-xs font-bold rounded-full border disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm ${
                u.activo !== false
                  ? 'border-rose-200 text-[#BE123C] hover:bg-rose-50'
                  : 'border-[#0D9488]/30 text-[#0D9488] hover:bg-[#0D9488]/10'
              }`}
              title={esElMismo ? 'No puedes auto-desactivar tu cuenta' : 'Cambiar estado'}
            >
              {u.activo !== false ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#102A43]">
              Administración de Usuarios
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#102A43] text-[#BFA37C] border border-[#102A43] shadow-sm">
              Solo Administradores
            </span>
          </div>
          <p className="text-sm text-[#627D98] mt-1">
            Supervisa los usuarios registrados, asigna roles RBAC y gestiona el estado de acceso.
          </p>
        </div>

        {/* Buscador Píldora Flotante */}
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Buscar por nombre o correo..."
            className="w-full text-xs rounded-full border border-[#9FB3C8]/40 px-4 py-2.5 outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 bg-white text-[#102A43] placeholder-[#9FB3C8] shadow-flotante"
          />
        </div>
      </div>

      {/* Resumen explicativo de la interfaz */}
      <div className="bg-white border border-white/90 rounded-3xl p-5 flex items-center gap-4 shadow-flotante">
        <span className="text-2xl flex-shrink-0 p-2.5 bg-[#F3EEE6] rounded-2xl">👥</span>
        <div className="text-xs text-[#334E68] leading-relaxed">
          <strong className="text-[#102A43] block font-bold text-sm mb-0.5">Control de Usuarios y Accesos RBAC</strong>
          Como administrador, puedes supervisar las cuentas activas en la plataforma, alternar roles entre Administrador y Usuario regular, y habilitar o deshabilitar accesos.
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <Tabla
        columnas={columnas}
        datos={usuarios}
        cargando={cargando}
        mensajeVacio="No se encontraron usuarios registrados en la plataforma."
      />

      {/* Paginación */}
      {!cargando && usuarios.length > 0 && (
        <Paginacion
          paginaActual={paginacionInfo.paginaActual}
          totalPaginas={paginacionInfo.totalPaginas}
          totalRegistros={paginacionInfo.totalRegistros}
          onCambiarPagina={(nuevaPagina) => setPaginaActual(nuevaPagina)}
        />
      )}
    </div>
  );
}

export default AdminUsuarios;
