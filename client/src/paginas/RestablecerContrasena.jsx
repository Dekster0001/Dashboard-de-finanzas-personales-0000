import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import clienteApi from '../api/clienteApi.js';
import Swal from 'sweetalert2';

/**
 * Pantalla de Restablecimiento de Contraseña (HU-02).
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Lienzo en marfil cálido (#F3EEE6), tarjeta flotante rounded-4xl y botón dorado (#BFA37C).
 */
export function RestablecerContrasena() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token');

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const navegar = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!token) {
      setErrorLocal('El token de restablecimiento no está presente en el enlace.');
      return;
    }

    if (!nuevaContrasena || !confirmarContrasena) {
      setErrorLocal('Todos los campos son obligatorios.');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setErrorLocal('Las contraseñas no coinciden.');
      return;
    }

    const regexContrasena = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!regexContrasena.test(nuevaContrasena)) {
      setErrorLocal(
        'La contraseña debe tener al menos 8 caracteres y contener como mínimo una letra y un número.'
      );
      return;
    }

    try {
      setCargando(true);
      await clienteApi.post('/auth/restablecer-contrasena', {
        token,
        nuevaContrasena
      });

      await Swal.fire({
        icon: 'success',
        title: '¡Contraseña Restablecida!',
        text: 'Tu contraseña ha sido actualizada con éxito. Ahora puedes iniciar sesión.',
        confirmButtonColor: '#102A43',
        confirmButtonText: 'Ir a Iniciar Sesión',
        customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-full font-bold px-6 py-2.5' }
      });

      navegar('/login');
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje ||
        'El enlace de recuperación es inválido o ha expirado (30 min). Solicita uno nuevo.';
      setErrorLocal(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EEE6] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos ambientales flotantes de fondo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#BFA37C]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#334E68]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#102A43] text-[#BFA37C] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#102A43]/20 ring-4 ring-white">
          🔐
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black tracking-tight text-[#102A43]">
          Nueva Contraseña
        </h2>
        <p className="mt-1 text-center text-xs font-bold text-[#627D98] uppercase tracking-wider">
          Ingresa y confirma tu nueva credencial de acceso
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white py-9 px-7 sm:px-10 shadow-flotante border border-white/90 rounded-3xl sm:rounded-4xl">
          {errorLocal && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#BE123C] text-xs font-semibold shadow-sm">
              {errorLocal}
            </div>
          )}

          <form className="space-y-4" onSubmit={manejarEnvio}>
            <div>
              <label htmlFor="nuevaContrasena" className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">
                Nueva Contraseña
              </label>
              <input
                id="nuevaContrasena"
                name="nuevaContrasena"
                type="password"
                required
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="Mínimo 8 car., 1 letra y 1 número"
                className="block w-full rounded-2xl border border-[#9FB3C8]/40 px-4 py-3 text-sm text-[#102A43] placeholder-[#9FB3C8] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 transition-all bg-white shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmarContrasena" className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">
                Confirmar Nueva Contraseña
              </label>
              <input
                id="confirmarContrasena"
                name="confirmarContrasena"
                type="password"
                required
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="Repite la contraseña"
                className="block w-full rounded-2xl border border-[#9FB3C8]/40 px-4 py-3 text-sm text-[#102A43] placeholder-[#9FB3C8] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 transition-all bg-white shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full flex justify-center py-3 px-4 rounded-full text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all hover:shadow-lg disabled:opacity-50 mt-3"
            >
              {cargando ? 'Actualizando...' : 'Restablecer Contraseña'}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
            <Link to="/login" className="text-xs font-bold text-[#334E68] hover:text-[#102A43] transition-colors">
              ← Regresar al Inicio de Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestablecerContrasena;
