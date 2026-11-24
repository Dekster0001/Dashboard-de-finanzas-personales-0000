import React from 'react';

/**
 * Campo de formulario reutilizable adaptado a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Etiquetas en azul tinta (#102A43), bordes en gris suave (#9FB3C8/50) y foco en oro noble (#BFA37C).
 * @param {{
 *   etiqueta: string,
 *   id: string,
 *   nombre?: string,
 *   tipo?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'color',
 *   valor: any,
 *   onChange: (e: React.ChangeEvent<any>) => void,
 *   placeholder?: string,
 *   requerido?: boolean,
 *   error?: string,
 *   ayuda?: string,
 *   disabled?: boolean,
 *   opciones?: Array<{ valor: string | number, etiqueta: string }>,
 *   min?: string | number,
 *   max?: string | number,
 *   step?: string | number,
 *   rows?: number
 * }} props
 */
export function CampoFormulario({
  etiqueta,
  id,
  nombre,
  tipo = 'text',
  valor,
  onChange,
  placeholder,
  requerido = false,
  error,
  ayuda,
  disabled = false,
  opciones = [],
  min,
  max,
  step,
  rows = 3
}) {
  const nombreCampo = nombre || id;
  const clasesBase = `block w-full rounded-2xl border px-4 py-2.5 text-sm text-[#102A43] placeholder-[#9FB3C8] outline-none transition-all duration-200 ${
    error
      ? 'border-rose-300 focus:border-[#BE123C] focus:ring-4 focus:ring-rose-500/10 bg-rose-50/20'
      : 'border-[#9FB3C8]/50 focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 bg-white shadow-sm'
  } ${disabled ? 'bg-[#F3EEE6] text-[#9FB3C8] cursor-not-allowed' : ''}`;

  return (
    <div className="w-full">
      {etiqueta && (
        <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">
          {etiqueta} {requerido && <span className="text-[#BE123C] font-bold">*</span>}
        </label>
      )}

      {tipo === 'select' ? (
        <select
          id={id}
          name={nombreCampo}
          value={valor}
          onChange={onChange}
          disabled={disabled}
          className={`${clasesBase} cursor-pointer`}
        >
          {opciones.map((op) => (
            <option key={op.valor} value={op.valor}>
              {op.etiqueta}
            </option>
          ))}
        </select>
      ) : tipo === 'textarea' ? (
        <textarea
          id={id}
          name={nombreCampo}
          rows={rows}
          value={valor}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={clasesBase}
        />
      ) : tipo === 'color' ? (
        <div className="flex items-center gap-3">
          <input
            id={id}
            name={nombreCampo}
            type="color"
            value={valor}
            onChange={onChange}
            disabled={disabled}
            className="h-11 w-16 p-1 rounded-2xl border border-[#9FB3C8]/50 bg-white cursor-pointer shadow-sm"
          />
          <span className="text-xs font-mono font-bold text-[#102A43] uppercase">{valor}</span>
        </div>
      ) : (
        <input
          id={id}
          name={nombreCampo}
          type={tipo}
          value={valor}
          onChange={onChange}
          placeholder={placeholder}
          required={requerido}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={clasesBase}
        />
      )}

      {error && <p className="mt-1 text-xs text-[#BE123C] font-semibold">{error}</p>}
      {ayuda && !error && <p className="mt-1 text-xs text-[#627D98] font-medium">{ayuda}</p>}
    </div>
  );
}

export default CampoFormulario;
