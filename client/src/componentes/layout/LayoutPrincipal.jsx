import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import BarraLateral from './BarraLateral.jsx';

/**
 * Contenedor general de la interfaz con diseño Soft Floating UI.
 * Lienzo general en marfil cálido (#F3EEE6) con margen perimetral para
 * que el dock lateral y las tarjetas se aprecien físicamente flotantes.
 */
export function LayoutPrincipal() {
  const [barraLateralAbierta, setBarraLateralAbierta] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F3EEE6] p-3 sm:p-5 lg:p-6 flex flex-row gap-5 lg:gap-6 box-border">
      {/* Dock de navegación lateral flotante */}
      <BarraLateral
        abierta={barraLateralAbierta}
        onCerrar={() => setBarraLateralAbierta(false)}
      />

      {/* Contenedor principal de contenido con scroll interno suave */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Barra superior de navegación flotante tipo cápsula */}
        <Navbar onToggleBarraLateral={() => setBarraLateralAbierta((prev) => !prev)} />

        {/* Área de trabajo con scrollbar estilizada y margen aireado */}
        <main className="flex-1 overflow-y-auto pr-1 pb-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LayoutPrincipal;
