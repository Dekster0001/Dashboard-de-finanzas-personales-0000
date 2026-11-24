import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import clienteApi from '../api/clienteApi.js';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import Modal from '../componentes/comunes/Modal.jsx';
import Paginacion from '../componentes/comunes/Paginacion.jsx';
import FormMovimiento from '../componentes/movimientos/FormMovimiento.jsx';
import TablaMovimientos from '../componentes/movimientos/TablaMovimientos.jsx';
import exportarMovimientosAExcel from '../utils/exportarExcel.js';
import exportarMovimientosAPdf from '../utils/exportarPdf.js';

dayjs.extend(isSameOrBefore);

/**
 * Pantalla de Historial de Movimientos y Filtros Dinámicos (HU-05 y HU-06).
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Barra de filtros en tarjeta flotante rounded-3xl con sombra ambiental,
 * botones píldora para exportación y registro en oro noble (#BFA37C).
 */
export function Movimientos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movimientos, setMovimientos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  // Filtros dinámicos sincronizados con searchParams si vienen desde Dashboard o Presupuesto
  const [desde, setDesde] = useState(searchParams.get('desde') || '');
  const [hasta, setHasta] = useState(searchParams.get('hasta') || '');
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '');
  const [categoriaId, setCategoriaId] = useState(searchParams.get('categoriaId') || '');
  const [cuentaId, setCuentaId] = useState(searchParams.get('cuentaId') || '');
  const [paginaActual, setPaginaActual] = useState(1);
  const [paginacionInfo, setPaginacionInfo] = useState({
    paginaActual: 1,
    totalPaginas: 1,
    totalRegistros: 0
  });

  // Escuchar cambios de parámetros de URL para navegación cruzada
  useEffect(() => {
    const pDesde = searchParams.get('desde');
    const pHasta = searchParams.get('hasta');
    const pTipo = searchParams.get('tipo');
    const pCat = searchParams.get('categoriaId');
    const pCta = searchParams.get('cuentaId');

    if (pDesde !== null) setDesde(pDesde);
    if (pHasta !== null) setHasta(pHasta);
    if (pTipo !== null) setTipo(pTipo);
    if (pCat !== null) setCategoriaId(pCat);
    if (pCta !== null) setCuentaId(pCta);
  }, [searchParams]);

  // Modal y formulario de creación / edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [movimientoEditar, setMovimientoEditar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cargar cuentas y categorías para los selectores de filtros y formulario
  const cargarCatalogos = async () => {
    try {
      const [resCuentas, resCategorias] = await Promise.all([
        clienteApi.get('/cuentas'),
        clienteApi.get('/categorias')
      ]);
      setCuentas(resCuentas.data.datos || []);
      setCategorias(resCategorias.data.datos || []);
    } catch (err) {
      console.warn('Error al cargar catálogos auxiliares:', err);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // Cargar lista de movimientos con filtros y paginación
  const cargarMovimientos = useCallback(async () => {
    // Validación estricta con Day.js: desde <= hasta (HU-06 Escenario 3)
    if (desde && hasta && dayjs(desde).isAfter(dayjs(hasta))) {
      toast.error('La fecha inicial no puede ser mayor a la final.');
      return;
    }

    try {
      setCargando(true);
      setErrorCarga('');

      const params = {
        pagina: paginaActual,
        limite: 10
      };

      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      if (tipo) params.tipo = tipo;
      if (categoriaId) params.categoriaId = categoriaId;
      if (cuentaId) params.cuentaId = cuentaId;

      const respuesta = await clienteApi.get('/movimientos', { params });
      const { movimientos: lista, paginacion } = respuesta.data.datos;

      setMovimientos(lista || []);
      if (paginacion) {
        setPaginacionInfo(paginacion);
      }
    } catch (err) {
      setErrorCarga(
        err.response?.data?.mensaje || 'Error de conexión al cargar los movimientos.'
      );
    } finally {
      setCargando(false);
    }
  }, [paginaActual, desde, hasta, tipo, categoriaId, cuentaId]);

  // useEffect se dispara reactivamente ante cambios en filtros o paginación
  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  const limpiarFiltros = () => {
    setDesde('');
    setHasta('');
    setTipo('');
    setCategoriaId('');
    setCuentaId('');
    setPaginaActual(1);
    setSearchParams({});
  };

  const abrirModalCrear = () => {
    setMovimientoEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (mov) => {
    setMovimientoEditar(mov);
    setModalAbierto(true);
  };

  const manejarGuardarMovimiento = async (datos) => {
    try {
      setGuardando(true);
      if (movimientoEditar) {
        await clienteApi.put(
          `/movimientos/${movimientoEditar._id || movimientoEditar.id}`,
          datos
        );
        toast.success('Movimiento actualizado y saldos recalculados.');
      } else {
        await clienteApi.post('/movimientos', datos);
        toast.success('Movimiento registrado exitosamente.');
      }
      setModalAbierto(false);
      cargarMovimientos();
      cargarCatalogos();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al guardar el movimiento.');
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminarMovimiento = (id) => {
    Swal.fire({
      title: '¿Eliminar movimiento?',
      text: 'El saldo de la cuenta asociada se revertirá de forma automática.',
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
          await clienteApi.delete(`/movimientos/${id}`);
          toast.success('Movimiento eliminado y saldo restaurado.');
          cargarMovimientos();
          cargarCatalogos();
        } catch (error) {
          toast.error(error.response?.data?.mensaje || 'Error al eliminar el movimiento.');
        }
      }
    });
  };

  const manejarExportarExcel = () => {
    const periodo = desde || hasta ? `${desde || 'Inicio'} a ${hasta || 'Fin'}` : 'Historial Completo';
    exportarMovimientosAExcel(movimientos, `Movimientos_${periodo.replace(/\s+/g, '_')}`);
  };

  const manejarExportarPdf = () => {
    const periodo = desde || hasta ? `${desde || 'Inicio'} a ${hasta || 'Fin'}` : 'Historial Completo';
    exportarMovimientosAPdf(movimientos, periodo, 'Reporte_Movimientos');
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y barra de herramientas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BFA37C] ring-4 ring-[#BFA37C]/20" />
            <span className="text-xs font-black uppercase tracking-wider text-[#627D98]">
              Libro Diario Financiero
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#102A43]">
            Historial de Movimientos
          </h1>
          <p className="text-sm text-[#627D98] mt-0.5">
            Consulta, filtra y audita tus transacciones en Soles (S/.) con actualización de saldos en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={manejarExportarExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#0D9488] bg-white hover:bg-[#F3EEE6] border border-[#0D9488]/30 transition-all shadow-flotante"
            title="Exportar movimientos filtrados a Excel"
          >
            <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={manejarExportarPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#BE123C] bg-white hover:bg-rose-50/50 border border-[#BE123C]/30 transition-all shadow-flotante"
            title="Exportar reporte ejecutivo a PDF"
          >
            <span className="w-2 h-2 rounded-full bg-[#BE123C]" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={abrirModalCrear}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all hover:shadow-lg"
          >
            <span>+</span>
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros Dinámicos */}
      <div className="bg-white p-6 rounded-3xl border border-white/90 shadow-flotante space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-black text-[#102A43] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#BFA37C]" />
            Filtros Dinámicos de Consulta
          </span>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="text-xs font-bold text-[#334E68] hover:text-[#102A43] transition-colors px-3 py-1 rounded-full hover:bg-[#F3EEE6]"
          >
            Limpiar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* Fecha Desde */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102A43] mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => {
                setDesde(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full text-xs rounded-2xl border border-[#9FB3C8]/40 px-3.5 py-2.5 text-[#102A43] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 bg-[#F3EEE6]/40 font-medium"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102A43] mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => {
                setHasta(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full text-xs rounded-2xl border border-[#9FB3C8]/40 px-3.5 py-2.5 text-[#102A43] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 bg-[#F3EEE6]/40 font-medium"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102A43] mb-1">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full text-xs rounded-2xl border border-[#9FB3C8]/40 px-3.5 py-2.5 text-[#102A43] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 bg-[#F3EEE6]/40 font-medium cursor-pointer"
            >
              <option value="">Todos los Tipos</option>
              <option value="INGRESO">Ingresos (+)</option>
              <option value="GASTO">Gastos (-)</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102A43] mb-1">
              Categoría
            </label>
            <select
              value={categoriaId}
              onChange={(e) => {
                setCategoriaId(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full text-xs rounded-2xl border border-[#9FB3C8]/40 px-3.5 py-2.5 text-[#102A43] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 bg-[#F3EEE6]/40 font-medium cursor-pointer"
            >
              <option value="">Todas las Categorías</option>
              {categorias.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nombre} ({c.tipo})
                </option>
              ))}
            </select>
          </div>

          {/* Cuenta */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#102A43] mb-1">
              Cuenta
            </label>
            <select
              value={cuentaId}
              onChange={(e) => {
                setCuentaId(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full text-xs rounded-2xl border border-[#9FB3C8]/40 px-3.5 py-2.5 text-[#102A43] outline-none focus:border-[#BFA37C] focus:ring-4 focus:ring-[#BFA37C]/15 bg-[#F3EEE6]/40 font-medium cursor-pointer"
            >
              <option value="">Todas las Cuentas</option>
              {cuentas.map((cta) => (
                <option key={cta._id} value={cta._id}>
                  {cta.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Manejo de Estados: Error, Tabla o Vacío */}
      {errorCarga ? (
        <div className="bg-white border border-rose-200 p-8 rounded-3xl text-center space-y-3 shadow-flotante">
          <p className="text-sm font-semibold text-[#BE123C]">{errorCarga}</p>
          <button
            type="button"
            onClick={cargarMovimientos}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] transition-colors shadow-sm"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <TablaMovimientos
            movimientos={movimientos}
            cargando={cargando}
            alEditar={abrirModalEditar}
            alEliminar={manejarEliminarMovimiento}
            alCrearPrimero={abrirModalCrear}
          />

          {/* Controles de paginación */}
          {!cargando && movimientos.length > 0 && (
            <Paginacion
              paginaActual={paginacionInfo.paginaActual}
              totalPaginas={paginacionInfo.totalPaginas}
              totalRegistros={paginacionInfo.totalRegistros}
              onCambiarPagina={(nuevaPagina) => setPaginaActual(nuevaPagina)}
            />
          )}
        </>
      )}

      {/* Modal de Registro y Edición */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={movimientoEditar ? 'Editar Movimiento' : 'Registrar Nuevo Movimiento'}
      >
        <FormMovimiento
          movimiento={movimientoEditar}
          cuentas={cuentas}
          categorias={categorias}
          alGuardar={manejarGuardarMovimiento}
          alCancelar={() => setModalAbierto(false)}
          cargando={guardando}
        />
      </Modal>
    </div>
  );
}

export default Movimientos;
