import React from 'react';

/**
 * Tarjeta KPI estilo Soft Floating UI.
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Fondo blanco puro (#FFFFFF), esquinas redondeadas (rounded-3xl),
 * sombras difusas sobre lienzo marfil (#F3EEE6) y tipografía noble en #102A43 y #627D98.
 * @param {{
 *   titulo: string,
 *   valor: string,
 *   subtitulo?: string,
 *   variante?: 'ingreso' | 'gasto' | 'balance' | 'presupuesto' | 'patrimonio',
 *   badge?: string,
 *   badgeClase?: string,
 *   icono?: React.ReactNode
 * }} props
 */
export function TarjetaKpi({
  titulo,
  valor,
  subtitulo,
  variante = 'balance',
  badge,
  badgeClase,
  icono
}) {
  const estilosVariante = {
    ingreso: {
      iconoBg: 'bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20',
      acentoTexto: 'text-[#0D9488]',
      indicadorDot: 'bg-[#0D9488]'
    },
    gasto: {
      iconoBg: 'bg-[#BE123C]/10 text-[#BE123C] border border-[#BE123C]/20',
      acentoTexto: 'text-[#BE123C]',
      indicadorDot: 'bg-[#BE123C]'
    },
    balance: {
      iconoBg: 'bg-[#F3EEE6] text-[#BFA37C] border border-[#9FB3C8]/40',
      acentoTexto: 'text-[#102A43]',
      indicadorDot: 'bg-[#BFA37C]'
    },
    presupuesto: {
      iconoBg: 'bg-[#334E68]/10 text-[#334E68] border border-[#334E68]/20',
      acentoTexto: 'text-[#334E68]',
      indicadorDot: 'bg-[#334E68]'
    },
    patrimonio: {
      iconoBg: 'bg-[#102A43] text-[#BFA37C] border border-[#102A43]',
      acentoTexto: 'text-[#102A43]',
      indicadorDot: 'bg-[#102A43]'
    }
  };

  const estilo = estilosVariante[variante] || estilosVariante.balance;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-flotante border border-white/90 hover:shadow-flotante-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${estilo.indicadorDot}`}></span>
            <span className="text-xs font-black text-[#627D98] uppercase tracking-wider truncate">
              {titulo}
            </span>
          </div>

          {icono && (
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${estilo.iconoBg}`}>
              {icono}
            </div>
          )}
        </div>

        <div className="mt-1 flex items-baseline justify-between gap-2 flex-wrap">
          <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${estilo.acentoTexto}`}>
            {valor}
          </span>
          {badge && (
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${badgeClase || 'bg-[#F3EEE6] text-[#334E68] border-[#9FB3C8]/40'}`}>
              {badge}
            </span>
          )}
        </div>
      </div>

      {subtitulo && (
        <p className="text-xs text-[#627D98] mt-4 pt-3 border-t border-slate-100 leading-relaxed font-medium">
          {subtitulo}
        </p>
      )}
    </div>
  );
}

export default TarjetaKpi;
