import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import clienteApi from '../api/clienteApi.js';

/**
 * Pantalla de Solicitud de Recuperación de Contraseña (HU-02).
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Lienzo en marfil cálido (#F3EEE6), tarjeta flotante rounded-4xl y botón dorado (#BFA37C).
 */
export function OlvideContrasena() {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (!correo.trim()) {
      setErrorLocal('Por favor ingresa tu correo electrónico.');
      return;
    }

    try {
      setCargando(true);
      await clienteApi.post('/auth/olvide-contrasena', { correo: correo.trim() });
      setEnviado(true);
    } catch (error) {
      setErrorLocal('Ocurrió un problema de conexión al procesar la solicitud.');
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
          🔑
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-black tracking-tight text-[#102A43]">
          Recuperar Contraseña
        </h2>
        <p className="mt-1 text-center text-xs font-bold text-[#627D98] uppercase tracking-wider">
          Ingresa tu correo para recibir las instrucciones
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white py-9 px-7 sm:px-10 shadow-flotante border border-white/90 rounded-3xl sm:rounded-4xl">
          {enviado ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F3EEE6] border border-[#9FB3C8]/40 text-[#102A43] mx-auto flex items-center justify-center text-2xl shadow-sm">
                ✓
              </div>
              <h3 className="text-lg font-black text-[#102A43]">Solicitud Procesada</h3>
              <p className="text-xs text-[#627D98] leading-relaxed font-medium">
                Si el correo está registrado en el sistema, recibirás un enlace de un solo uso válido por 30 minutos para restablecer tu clave.
              </p>
              <div className="pt-3">
                <Link
                  to="/login"
                  className="inline-block text-xs font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] px-6 py-2.5 rounded-full shadow-md shadow-[#BFA37C]/25 transition-all"
                >
                  Volver al Inicio de Sesión
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={manejarEnvio}>
              {errorLocal && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[#BE123C] text-xs font-semibold">
                  {errorLocal}
                </div>
              )}

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

              <button
                type="submit"
                disabled={cargando}
                className="w-full flex justify-center py-3 px-4 rounded-full text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all hover:shadow-lg disabled:opacity-50 mt-3"
              >
                {cargando ? 'Procesando...' : 'Enviar Enlace de Recuperación'}
              </button>
            </form>
          )}

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

export default OlvideContrasena;
