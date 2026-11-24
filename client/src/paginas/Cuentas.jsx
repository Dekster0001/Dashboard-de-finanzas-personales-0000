import React, { useState, useEffect } from 'react';
import clienteApi from '../api/clienteApi.js';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Modal from '../componentes/comunes/Modal.jsx';
import CampoFormulario from '../componentes/comunes/CampoFormulario.jsx';
import EstadoVacio from '../componentes/comunes/EstadoVacio.jsx';
import { formatearCentavosAMoneda, convertirDecimalACentavos } from '../utils/formato.js';

const TIPOS_CUENTA = [
  { valor: 'banco', etiqueta: 'Cuenta Bancaria (BCP, BBVA, Interbank)' },
  { valor: 'billetera', etiqueta: 'Billetera Digital (Yape / Plin)' },
  { valor: 'efectivo', etiqueta: 'Efectivo en Billetera' },
  { valor: 'tarjeta', etiqueta: 'Tarjeta de Crédito' }
];

/**
 * Pantalla de Administración de Cuentas o Medios de Pago (HU-03).
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Tarjetas flotantes rounded-3xl, saldos en mono azul tinta (#102A43)
 * y botón de acción en cápsula dorada (#BFA37C).
 */
export function Cuentas() {
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuentaEditar, setCuentaEditar] = useState(null);

  // Formulario local
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('banco');
  const [saldoInicialDecimal, setSaldoInicialDecimal] = useState('0.00');
  const [color, setColor] = useState('#BFA37C');
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  // Cargar cuentas del usuario autenticado (incluyendo inactivas para poder reactivarlas)
  const cargarCuentas = async () => {
    try {
      setCargando(true);
      const respuesta = await clienteApi.get('/cuentas', {
        params: { incluirInactivas: true }
      });
      setCuentas(respuesta.data.datos || []);
    } catch (error) {
      toast.error('Error al cargar las cuentas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCuentas();
  }, []);

  const abrirModalCrear = () => {
    setCuentaEditar(null);
    setNombre('');
    setTipo('banco');
    setSaldoInicialDecimal('0.00');
    setColor('#BFA37C');
    setActivo(true);
    setErrorModal('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (c) => {
    setCuentaEditar(c);
    setNombre(c.nombre);
    setTipo(c.tipo);
    setColor(c.color || '#BFA37C');
    setActivo(c.activo !== false);
    setErrorModal('');
    setModalAbierto(true);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setErrorModal('');

    if (!nombre.trim()) {
      setErrorModal('El nombre de la cuenta es obligatorio.');
      return;
    }

    try {
      setGuardando(true);
      if (cuentaEditar) {
        await clienteApi.put(`/cuentas/${cuentaEditar._id || cuentaEditar.id}`, {
          nombre: nombre.trim(),
          color,
          activo
        });
        toast.success('Cuenta actualizada satisfactoriamente.');
      } else {
        const saldoInicialEnCentavos = convertirDecimalACentavos(saldoInicialDecimal);
        await clienteApi.post('/cuentas', {
          nombre: nombre.trim(),
          tipo,
          saldoInicialEnCentavos,
          color
        });
        toast.success('Cuenta registrada satisfactoriamente.');
      }
      setModalAbierto(false);
      cargarCuentas();
    } catch (error) {
      setErrorModal(error.response?.data?.mensaje || 'Error al guardar la cuenta.');
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminar = (cuenta) => {
    Swal.fire({
      title: `¿Eliminar cuenta "${cuenta.nombre}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#BE123C',
      cancelButtonColor: '#9FB3C8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-full font-bold px-5 py-2.5',
        cancelButton: 'rounded-full font-bold px-5 py-2.5'
      }
    }).then(async (resultado) => {
      if (resultado.isConfirmed) {
        try {
          await clienteApi.delete(`/cuentas/${cuenta._id || cuenta.id}`);
          toast.success('Cuenta eliminada satisfactoriamente.');
          cargarCuentas();
        } catch (error) {
          const mensaje =
            error.response?.data?.mensaje || 'No se pudo eliminar la cuenta.';
          Swal.fire({
            icon: 'error',
            title: 'No se puede eliminar',
            text: mensaje,
            confirmButtonColor: '#102A43',
            customClass: { popup: 'rounded-3xl', confirmButton: 'rounded-full font-bold' }
          });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y botón de acción */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BFA37C] ring-4 ring-[#BFA37C]/20" />
            <span className="text-xs font-black uppercase tracking-wider text-[#627D98]">
              Instrumentos Financieros
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#102A43]">
            Cuentas y Medios de Pago
          </h1>
          <p className="text-sm text-[#627D98] mt-0.5">
            Administra tus bancos peruanos (BCP, Interbank, BBVA), billeteras (Yape/Plin) y efectivo en Soles (S/.).
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all hover:shadow-lg"
        >
          <span>+</span>
          <span>Nueva Cuenta</span>
        </button>
      </div>

      {/* Banner Explicativo */}
      <div className="bg-white border border-white/90 rounded-3xl p-5 flex items-start gap-4 shadow-flotante">
        <span className="text-2xl flex-shrink-0 p-2.5 bg-[#F3EEE6] rounded-2xl">💡</span>
        <div className="text-xs text-[#334E68] leading-relaxed">
          <strong className="font-black text-[#102A43] block text-sm mb-0.5">
            Soberanía de Medios Financieros en Soles (S/.)
          </strong>
          Configura tus medios de pago habituales. La regla anti-saldos negativos impide que cuentas de débito y efectivo queden en descubierto ante gastos no cubiertos.
        </div>
      </div>

      {/* Grid de Cuentas */}
      {cargando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl p-6 border border-[#9FB3C8]/30 animate-pulse shadow-flotante" />
          ))}
        </div>
      ) : cuentas.length === 0 ? (
        <EstadoVacio
          titulo="Sin cuentas registradas"
          mensaje="Registra tu primera cuenta bancaria, billetera o efectivo para comenzar a organizar tu dinero."
          textoBoton="Crear Primera Cuenta"
          accionBoton={abrirModalCrear}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cuentas.map((c) => {
            const saldoPositivo = c.saldoActualEnCentavos >= 0;
            return (
              <div
                key={c._id || c.id}
                className="bg-white rounded-3xl p-6 border border-white/90 shadow-flotante hover:shadow-flotante-hover transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Glow decorativo sutil */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none"
                  style={{ backgroundColor: c.color || '#BFA37C' }}
                />

                {/* Franja superior suave de color */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: c.color || '#BFA37C' }}
                />

                <div>
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F3EEE6] text-[#102A43] border border-[#9FB3C8]/30">
                      {TIPOS_CUENTA.find((t) => t.valor.toLowerCase() === (c.tipo || '').toLowerCase())?.etiqueta || c.tipo}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          c.activo !== false ? 'bg-[#0D9488] ring-2 ring-[#0D9488]/20' : 'bg-slate-300'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.activo !== false
                            ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20'
                            : 'bg-slate-100 text-[#627D98] border-slate-200'
                        }`}
                      >
                        {c.activo !== false ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-[#102A43] truncate">{c.nombre}</h3>

                  <div className="mt-4 p-3.5 bg-[#F3EEE6]/50 rounded-2.5xl border border-[#9FB3C8]/30">
                    <span className="text-[11px] font-black text-[#627D98] uppercase tracking-wider block">
                      Saldo Disponible
                    </span>
                    <span
                      className={`text-2xl font-black font-mono tracking-tight block mt-0.5 ${
                        saldoPositivo ? 'text-[#102A43]' : 'text-[#BE123C]'
                      }`}
                    >
                      {formatearCentavosAMoneda(c.saldoActualEnCentavos)}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#627D98] mt-2 font-medium px-1">
                    Saldo inicial: {formatearCentavosAMoneda(c.saldoInicialEnCentavos)}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => abrirModalEditar(c)}
                    className="px-3.5 py-1.5 text-[#627D98] hover:text-[#102A43] hover:bg-[#F3EEE6] rounded-full transition-colors text-xs font-bold flex items-center gap-1"
                  >
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => manejarEliminar(c)}
                    className="px-3.5 py-1.5 text-[#627D98] hover:text-[#BE123C] hover:bg-rose-50/70 rounded-full transition-colors text-xs font-bold flex items-center gap-1"
                  >
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Creación / Edición */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={cuentaEditar ? 'Editar Cuenta' : 'Nueva Cuenta o Medio'}
      >
        <form onSubmit={manejarGuardar} className="space-y-4">
          {errorModal && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[#BE123C] text-xs font-semibold">
              {errorModal}
            </div>
          )}

          <CampoFormulario
            etiqueta="Nombre de la Cuenta"
            id="nombre"
            requerido
            valor={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. BCP Sueldo, Yape / Plin, Efectivo Cartera"
          />

          {!cuentaEditar && (
            <>
              <CampoFormulario
                etiqueta="Tipo de Cuenta o Medio"
                id="tipo"
                tipo="select"
                requerido
                valor={tipo}
                onChange={(e) => setTipo(e.target.value)}
                opciones={TIPOS_CUENTA}
              />

              <CampoFormulario
                etiqueta="Saldo Inicial en Soles (S/.)"
                id="saldoInicial"
                tipo="number"
                step="0.01"
                min="0"
                requerido
                valor={saldoInicialDecimal}
                onChange={(e) => setSaldoInicialDecimal(e.target.value)}
                ayuda="Monto con el que inicias esta cuenta en Soles (S/.)."
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <CampoFormulario
              etiqueta="Color Identificador"
              id="color"
              tipo="color"
              valor={color}
              onChange={(e) => setColor(e.target.value)}
            />

            {cuentaEditar && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">Estado</label>
                <select
                  value={activo ? 'true' : 'false'}
                  onChange={(e) => setActivo(e.target.value === 'true')}
                  className="block w-full rounded-2xl border border-[#9FB3C8]/40 px-4 py-2.5 text-sm text-[#102A43] bg-white outline-none focus:border-[#BFA37C]"
                >
                  <option value="true">Activa</option>
                  <option value="false">Inactiva</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#627D98] hover:text-[#102A43] hover:bg-[#F3EEE6] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : cuentaEditar ? 'Guardar Cambios' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Cuentas;
