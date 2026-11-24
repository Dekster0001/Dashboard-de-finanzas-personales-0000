import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/ContextoAuth.jsx';

/**
 * Pantalla de Registro de Nuevo Usuario (HU-01).
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Fondo en lienzo marfil (#F3EEE6), tarjeta rounded-4xl y botón dorado (#BFA37C).
 */
export function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const { registrar } = useAuth();
  const navegar = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!nombre.trim() || !correo.trim() || !contrasena || !confirmarContrasena) {
      setErrorLocal('Todos los campos son obligatorios.');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setErrorLocal('Las contraseñas no coinciden.');
      return;
    }

    const regexContrasena = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!regexContrasena.test(contrasena)) {
      setErrorLocal(
        'La contraseña debe tener al menos 8 caracteres y contener como mínimo una letra y un número.'
      );
      return;
    }

    try {
      setCargando(true);
      await registrar(nombre.trim(), correo.trim(), contrasena);
      navegar('/dashboard');
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al procesar el registro.';
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
          💎
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black tracking-tight text-[#102A43]">
          Crear una Cuenta
        </h2>
        <p className="mt-1 text-center text-xs font-bold text-[#627D98] uppercase tracking-wider">
          Control de finanzas personales en Soles (S/.)
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white py-9 px-7 sm:px-10 shadow-flotante border border-white/90 rounded-3xl sm:rounded-4xl">
          {errorLocal && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-[#BE123C] text-xs flex items-start gap-2.5 font-semibold shadow-sm">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#BE123C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorLocal}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={manejarEnvio}>
            <div>
              <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">
                Nombre Completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="block w-full rounded-2xl border border-[#9FB3C8]/40 px-4 py-3 text-sm text-[#102A43] placeholder-[#9FB3C8] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 transition-all bg-white shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="correo" className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">
                Correo Electrónico
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="usuario@correo.com"
                className="block w-full rounded-2xl border border-[#9FB3C8]/40 px-4 py-3 text-sm text-[#102A43] placeholder-[#9FB3C8] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 transition-all bg-white shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">
                Contraseña
              </label>
              <input
                id="contrasena"
                name="contrasena"
                type="password"
                required
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Mínimo 8 car., 1 letra y 1 número"
                className="block w-full rounded-2xl border border-[#9FB3C8]/40 px-4 py-3 text-sm text-[#102A43] placeholder-[#9FB3C8] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 transition-all bg-white shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmarContrasena" className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">
                Confirmar Contraseña
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
              {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-[#627D98] font-medium">
              ¿Ya tienes una cuenta registrada?{' '}
              <Link to="/login" className="font-bold text-[#102A43] hover:text-black transition-colors underline decoration-[#BFA37C] decoration-2 underline-offset-4">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
