import React, { useState, useEffect } from 'react';
import clienteApi from '../api/clienteApi.js';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Modal from '../componentes/comunes/Modal.jsx';
import CampoFormulario from '../componentes/comunes/CampoFormulario.jsx';
import EstadoVacio from '../componentes/comunes/EstadoVacio.jsx';

/**
 * Pantalla de Administración de Categorías (HU-04).
 * Adaptada a la paleta ejecutiva (#102A43, #334E68, #9FB3C8, #BFA37C, #F3EEE6).
 * Píldoras de filtro segmentadas, tarjetas rounded-2.5xl en blanco puro
 * y botón de acción en cápsula dorada (#BFA37C).
 */
export function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  // Modal y formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState(null);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('GASTO');
  const [color, setColor] = useState('#BE123C');
  const [icono, setIcono] = useState('tag');
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const res = await clienteApi.get('/categorias');
      setCategorias(res.data.datos || []);
    } catch (error) {
      toast.error('Error al cargar las categorías.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const abrirModalCrear = () => {
    setCategoriaEditar(null);
    setNombre('');
    setTipo('GASTO');
    setColor('#BE123C');
    setIcono('tag');
    setErrorModal('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (cat) => {
    setCategoriaEditar(cat);
    setNombre(cat.nombre);
    setTipo(cat.tipo);
    setColor(cat.color || '#BE123C');
    setIcono(cat.icono || 'tag');
    setErrorModal('');
    setModalAbierto(true);
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setErrorModal('');

    if (!nombre.trim()) {
      setErrorModal('El nombre de la categoría es obligatorio.');
      return;
    }

    try {
      setGuardando(true);
      if (categoriaEditar) {
        await clienteApi.put(`/categorias/${categoriaEditar._id || categoriaEditar.id}`, {
          nombre: nombre.trim(),
          color,
          icono
        });
        toast.success('Categoría actualizada satisfactoriamente.');
      } else {
        await clienteApi.post('/categorias', {
          nombre: nombre.trim(),
          tipo,
          color,
          icono
        });
        toast.success('Categoría creada satisfactoriamente.');
      }
      setModalAbierto(false);
      cargarCategorias();
    } catch (error) {
      setErrorModal(error.response?.data?.mensaje || 'Error al guardar la categoría.');
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminar = (cat) => {
    Swal.fire({
      title: `¿Eliminar "${cat.nombre}"?`,
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
          await clienteApi.delete(`/categorias/${cat._id || cat.id}`);
          toast.success('Categoría eliminada satisfactoriamente.');
          cargarCategorias();
        } catch (error) {
          const mensaje =
            error.response?.data?.mensaje || 'No se pudo eliminar la categoría.';
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

  // Filtrado en el cliente para cambio instantáneo de pestaña
  const categoriasMostradas =
    filtroTipo === 'TODOS' ? categorias : categorias.filter((c) => c.tipo === filtroTipo);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BFA37C] ring-4 ring-[#BFA37C]/20" />
            <span className="text-xs font-black uppercase tracking-wider text-[#627D98]">
              Clasificación Financiera
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#102A43]">
            Categorías Financieras
          </h1>
          <p className="text-sm text-[#627D98] mt-0.5">
            Organiza tus fuentes de ingresos y tus rubros de gasto para análisis visual detallado.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#BFA37C] hover:bg-[#A88C65] shadow-md shadow-[#BFA37C]/25 transition-all hover:shadow-lg"
        >
          <span>+</span>
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Pestañas de Filtro Segmentadas estilo Cápsulas */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-full shadow-flotante border border-white/90 w-fit">
        <button
          type="button"
          onClick={() => setFiltroTipo('TODOS')}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
            filtroTipo === 'TODOS'
              ? 'bg-[#102A43] text-[#BFA37C] shadow-md shadow-[#102A43]/20'
              : 'text-[#627D98] hover:text-[#102A43]'
          }`}
        >
          Todas ({categorias.length})
        </button>
        <button
          type="button"
          onClick={() => setFiltroTipo('GASTO')}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
            filtroTipo === 'GASTO'
              ? 'bg-[#BE123C] text-white shadow-md shadow-[#BE123C]/20'
              : 'text-[#627D98] hover:text-[#102A43]'
          }`}
        >
          Gastos ({categorias.filter((c) => c.tipo === 'GASTO').length})
        </button>
        <button
          type="button"
          onClick={() => setFiltroTipo('INGRESO')}
          className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
            filtroTipo === 'INGRESO'
              ? 'bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/20'
              : 'text-[#627D98] hover:text-[#102A43]'
          }`}
        >
          Ingresos ({categorias.filter((c) => c.tipo === 'INGRESO').length})
        </button>
      </div>

      {/* Grid de Categorías */}
      {cargando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2.5xl p-4 border border-[#9FB3C8]/30 animate-pulse shadow-flotante" />
          ))}
        </div>
      ) : categoriasMostradas.length === 0 ? (
        <EstadoVacio
          titulo="Sin categorías"
          mensaje="No se encontraron categorías para este filtro. Crea una para organizar tus transacciones."
          textoBoton="Crear Categoría"
          accionBoton={abrirModalCrear}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoriasMostradas.map((cat) => (
            <div
              key={cat._id || cat.id}
              className="bg-white p-4 sm:p-5 rounded-2.5xl border border-white/90 shadow-flotante flex items-center justify-between hover:shadow-flotante-hover transition-all duration-200 group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0 ring-4 ring-slate-100 shadow-sm"
                  style={{ backgroundColor: cat.color || '#BFA37C' }}
                />
                <div className="truncate">
                  <h4 className="text-sm font-black text-[#102A43] truncate">{cat.nombre}</h4>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1 ${
                      cat.tipo === 'INGRESO'
                        ? 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20'
                        : 'bg-rose-50 text-[#BE123C] border-rose-200'
                    }`}
                  >
                    {cat.tipo}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => abrirModalEditar(cat)}
                  className="p-2 text-[#627D98] hover:text-[#102A43] hover:bg-[#F3EEE6] rounded-full transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => manejarEliminar(cat)}
                  className="p-2 text-[#627D98] hover:text-[#BE123C] hover:bg-rose-50 rounded-full transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={categoriaEditar ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={manejarGuardar} className="space-y-4">
          {errorModal && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[#BE123C] text-xs font-semibold">
              {errorModal}
            </div>
          )}

          <CampoFormulario
            etiqueta="Nombre de la Categoría"
            id="nombre"
            requerido
            valor={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Supermercado, Transporte, Nómina"
          />

          {!categoriaEditar && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#102A43] mb-1.5">Tipo de Flujo</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTipo('GASTO');
                    setColor('#BE123C');
                  }}
                  className={`py-2.5 text-xs font-bold rounded-2xl border transition-all ${
                    tipo === 'GASTO'
                      ? 'bg-[#BE123C] text-white border-[#BE123C] shadow-md shadow-[#BE123C]/20'
                      : 'border-[#9FB3C8]/40 text-[#627D98] hover:text-[#102A43] bg-white'
                  }`}
                >
                  Gasto (-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipo('INGRESO');
                    setColor('#0D9488');
                  }}
                  className={`py-2.5 text-xs font-bold rounded-2xl border transition-all ${
                    tipo === 'INGRESO'
                      ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-md shadow-[#0D9488]/20'
                      : 'border-[#9FB3C8]/40 text-[#627D98] hover:text-[#102A43] bg-white'
                  }`}
                >
                  Ingreso (+)
                </button>
              </div>
            </div>
          )}

          <CampoFormulario
            etiqueta="Color Identificador"
            id="color"
            tipo="color"
            valor={color}
            onChange={(e) => setColor(e.target.value)}
          />

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
              {guardando ? 'Guardando...' : categoriaEditar ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Categorias;
