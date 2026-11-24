import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import CampoFormulario from '../comunes/CampoFormulario.jsx';
import { convertirDecimalACentavos } from '../../utils/formato.js';

/**
 * Formulario para creación y edición de movimientos financieros (ingresos y gastos).
 * Adaptado a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Botón CTA en oro noble (#BFA37C), etiquetas en azul tinta (#102A43).
 * @param {{
 *   movimiento?: any,
 *   cuentas: any[],
 *   categorias: any[],
 *   alGuardar: (datos: any) => Promise<void>,
 *   alCancelar: () => void,
 *   cargando?: boolean
 * }} props
 */
export function FormMovimiento({
  movimiento = null,
  cuentas = [],
  categorias = [],
  alGuardar,
  alCancelar,
  cargando = false
}) {
  const [tipo, setTipo] = useState(movimiento?.tipo || 'GASTO');
  const [montoDecimal, setMontoDecimal] = useState(
    movimiento?.montoEnCentavos ? (movimiento.montoEnCentavos / 100).toFixed(2) : ''
  );
  const [fecha, setFecha] = useState(
    movimiento?.fecha ? dayjs(movimiento.fecha).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );
  const [cuentaId, setCuentaId] = useState(
    movimiento?.cuentaId?._id || movimiento?.cuentaId || (cuentas[0]?._id ?? '')
  );
  const [categoriaId, setCategoriaId] = useState(
    movimiento?.categoriaId?._id || movimiento?.categoriaId || ''
  );
  const [descripcion, setDescripcion] = useState(movimiento?.descripcion || '');
  const [errorLocal, setErrorLocal] = useState('');

  // Cuenta seleccionada y validación de saldo disponible
  const cuentaSeleccionada = cuentas.find((c) => c._id === cuentaId);
  const esCuentaDebito = cuentaSeleccionada && cuentaSeleccionada.tipo !== 'tarjeta';
  const saldoDisponible = cuentaSeleccionada?.saldoActualEnCentavos ?? 0;
  const saldoBase = (movimiento && (movimiento.cuentaId?._id || movimiento.cuentaId) === cuentaId)
    ? (movimiento.tipo === 'GASTO'
        ? saldoDisponible + movimiento.montoEnCentavos
        : saldoDisponible - movimiento.montoEnCentavos)
    : saldoDisponible;

  const montoEnCentavosActual = convertirDecimalACentavos(montoDecimal);
  const saldoInsuficiente = Boolean(
    tipo === 'GASTO' && esCuentaDebito && montoEnCentavosActual > 0 && montoEnCentavosActual > saldoBase
  );

  // Filtrar categorías según el tipo seleccionado (INGRESO o GASTO)
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  // Si cambia el tipo, reiniciar categoriaId si no pertenece al nuevo tipo
  useEffect(() => {
    const categoriaValida = categoriasFiltradas.some((c) => c._id === categoriaId);
    if (!categoriaValida && categoriasFiltradas.length > 0) {
      setCategoriaId(categoriasFiltradas[0]._id);
    } else if (categoriasFiltradas.length === 0) {
      setCategoriaId('');
    }
  }, [tipo, categorias]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    const montoEnCentavos = convertirDecimalACentavos(montoDecimal);

    if (montoEnCentavos <= 0) {
      setErrorLocal('El monto debe ser mayor a 0.');
      return;
    }

    if (!cuentaId) {
      setErrorLocal('Debes seleccionar una cuenta o medio de pago.');
      return;
    }

    if (!categoriaId) {
      setErrorLocal('Debes seleccionar una categoría.');
      return;
    }

    // Regla de Negocio Anti-Saldos Negativos (Validación previa en cliente)
    if (saldoInsuficiente) {
      setErrorLocal(
        `Saldo insuficiente en '${cuentaSeleccionada.nombre}'. Saldo disponible: S/. ${(saldoBase / 100).toFixed(2)}, monto solicitado: S/. ${(montoEnCentavos / 100).toFixed(2)}.`
      );
      return;
    }

    // Verificar concordancia de tipo
    const categoriaSeleccionada = categorias.find((c) => c._id === categoriaId);
    if (categoriaSeleccionada && categoriaSeleccionada.tipo !== tipo) {
      setErrorLocal(`La categoría debe ser de tipo ${tipo}.`);
      return;
    }

    try {
      await alGuardar({
        tipo,
        montoEnCentavos,
        fecha,
        cuentaId,
        categoriaId,
        descripcion: descripcion.trim()
      });
    } catch (err) {
      setErrorLocal(err.response?.data?.mensaje || 'Error al guardar el movimiento.');
    }
  };

  return (
    <form onSubmit={manejarEnvio} className="space-y-4">
      {errorLocal && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[#BE123C] text-xs flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{errorLocal}</span>
        </div>
      )}

      {/* Selector de Tipo (Pestañas INGRESO / GASTO) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">
          Tipo de Movimiento <span className="text-[#BE123C] font-bold">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F3EEE6] rounded-2xl border border-[#9FB3C8]/40">
          <button
            type="button"
            onClick={() => setTipo('GASTO')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              tipo === 'GASTO'
                ? 'bg-[#BE123C] text-white shadow-md shadow-[#BE123C]/20'
                : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            - Gasto
          </button>
          <button
            type="button"
            onClick={() => setTipo('INGRESO')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              tipo === 'INGRESO'
                ? 'bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/20'
                : 'text-[#627D98] hover:text-[#102A43]'
            }`}
          >
            + Ingreso
          </button>
        </div>
      </div>

      {/* Monto y Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CampoFormulario
          etiqueta="Monto en Soles (S/.)"
          id="monto"
          tipo="number"
          step="0.01"
          min="0.01"
          requerido
          valor={montoDecimal}
          onChange={(e) => setMontoDecimal(e.target.value)}
          placeholder="0.00"
        />

        <CampoFormulario
          etiqueta="Fecha"
          id="fecha"
          tipo="date"
          requerido
          valor={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      {/* Cuenta y Categoría */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CampoFormulario
          etiqueta="Cuenta o Medio de Pago"
          id="cuentaId"
          tipo="select"
          requerido
          valor={cuentaId}
          onChange={(e) => setCuentaId(e.target.value)}
          opciones={cuentas.map((c) => ({
            valor: c._id,
            etiqueta: `${c.nombre} (S/. ${(c.saldoActualEnCentavos / 100).toFixed(2)})`
          }))}
        />

        <CampoFormulario
          etiqueta={`Categoría de ${tipo}`}
          id="categoriaId"
          tipo="select"
          requerido
          valor={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          opciones={categoriasFiltradas.map((c) => ({
            valor: c._id,
            etiqueta: c.nombre
          }))}
        />
      </div>

      {/* Alerta contextual de saldo insuficiente */}
      {saldoInsuficiente && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
          <span className="text-base">⚠️</span>
          <div>
            <strong className="block font-bold">Saldo Insuficiente en {cuentaSeleccionada?.nombre}</strong>
            <span className="text-amber-800">
              El monto ingresado (S/. {montoDecimal}) supera el saldo disponible (S/. {(saldoBase / 100).toFixed(2)}). Para cuentas de débito o efectivo, el sistema evita balances negativos.
            </span>
          </div>
        </div>
      )}

      {/* Descripción opcional */}
      <CampoFormulario
        etiqueta="Descripción / Detalle"
        id="descripcion"
        tipo="text"
        valor={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Ej. Almuerzo ejecutivo o Depósito de honorarios"
      />

      {/* Botones de acción con CTA en #BFA37C */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={alCancelar}
          disabled={cargando}
          className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#627D98] hover:text-[#102A43] hover:bg-[#F3EEE6] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={cargando}
          className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all hover:shadow-lg disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : movimiento ? 'Actualizar' : 'Guardar Movimiento'}
        </button>
      </div>
    </form>
  );
}

export default FormMovimiento;
