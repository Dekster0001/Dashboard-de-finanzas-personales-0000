import { cuentaServicio } from '../src/servicios/cuentaServicio.js';
import { categoriaServicio } from '../src/servicios/categoriaServicio.js';
import { movimientoServicio } from '../src/servicios/movimientoServicio.js';
import { cuentaRepositorio } from '../src/repositorios/cuentaRepositorio.js';
import { categoriaRepositorio } from '../src/repositorios/categoriaRepositorio.js';
import { movimientoRepositorio } from '../src/repositorios/movimientoRepositorio.js';

console.log('================================================================');
console.log('🧪 VERIFICACIÓN AUTOMATIZADA DE ESCENARIOS GHERKIN (HU-03, 04, 05, 06)');
console.log('================================================================');

let totalPruebas = 0;
let pruebasPasadas = 0;

const assert = (descripcion, condicion) => {
  totalPruebas++;
  if (condicion) {
    console.log(`✅ [PASÓ] ${descripcion}`);
    pruebasPasadas++;
  } else {
    console.error(`❌ [FALLÓ] ${descripcion}`);
  }
};

// Mock de base de datos en memoria para probar lógica pura sin dependencia de red
const bdMemoria = {
  cuentas: [],
  categorias: [],
  movimientos: []
};

// Sobrescribir métodos de repositorios con implementación simulada en memoria
cuentaRepositorio.crear = async (usuarioId, datos) => {
  const c = { _id: `c-${Date.now()}-${Math.random()}`, usuarioId, ...datos, activo: true };
  c.save = async () => c;
  bdMemoria.cuentas.push(c);
  return c;
};
cuentaRepositorio.buscarPorId = async (usuarioId, id) => {
  return bdMemoria.cuentas.find((c) => c._id === id && c.usuarioId === usuarioId) || null;
};
cuentaRepositorio.actualizarPorId = async (usuarioId, id, datos) => {
  const idx = bdMemoria.cuentas.findIndex((c) => c._id === id && c.usuarioId === usuarioId);
  if (idx !== -1) {
    bdMemoria.cuentas[idx] = { ...bdMemoria.cuentas[idx], ...datos };
    return bdMemoria.cuentas[idx];
  }
  return null;
};
cuentaRepositorio.eliminarPorId = async (usuarioId, id) => {
  bdMemoria.cuentas = bdMemoria.cuentas.filter((c) => !(c._id === id && c.usuarioId === usuarioId));
};

categoriaRepositorio.crear = async (usuarioId, datos) => {
  const cat = { _id: `cat-${Date.now()}-${Math.random()}`, usuarioId, ...datos, activo: true };
  bdMemoria.categorias.push(cat);
  return cat;
};
categoriaRepositorio.buscarPorId = async (usuarioId, id) => {
  return bdMemoria.categorias.find((c) => c._id === id && c.usuarioId === usuarioId) || null;
};
categoriaRepositorio.buscarPorNombreYTipo = async (usuarioId, nombre, tipo) => {
  return (
    bdMemoria.categorias.find(
      (c) =>
        c.usuarioId === usuarioId &&
        c.nombre.toLowerCase() === nombre.toLowerCase() &&
        c.tipo === tipo
    ) || null
  );
};
categoriaRepositorio.actualizarPorId = async (usuarioId, id, datos) => {
  const idx = bdMemoria.categorias.findIndex((c) => c._id === id && c.usuarioId === usuarioId);
  if (idx !== -1) {
    bdMemoria.categorias[idx] = { ...bdMemoria.categorias[idx], ...datos };
    return bdMemoria.categorias[idx];
  }
  return null;
};

movimientoRepositorio.crear = async (usuarioId, datos) => {
  const m = { _id: `m-${Date.now()}-${Math.random()}`, usuarioId, ...datos };
  bdMemoria.movimientos.push(m);
  return m;
};
movimientoRepositorio.buscarPorId = async (usuarioId, id) => {
  return bdMemoria.movimientos.find((m) => m._id === id && m.usuarioId === usuarioId) || null;
};
movimientoRepositorio.actualizarPorId = async (usuarioId, id, datos) => {
  const idx = bdMemoria.movimientos.findIndex((m) => m._id === id && m.usuarioId === usuarioId);
  if (idx !== -1) {
    bdMemoria.movimientos[idx] = { ...bdMemoria.movimientos[idx], ...datos };
    return bdMemoria.movimientos[idx];
  }
  return null;
};
movimientoRepositorio.eliminarPorId = async (usuarioId, id) => {
  bdMemoria.movimientos = bdMemoria.movimientos.filter((m) => !(m._id === id && m.usuarioId === usuarioId));
};
movimientoRepositorio.contarPorCuenta = async (usuarioId, cuentaId) => {
  return bdMemoria.movimientos.filter((m) => m.usuarioId === usuarioId && m.cuentaId === cuentaId).length;
};
movimientoRepositorio.buscarConFiltrosYPaginacion = async (usuarioId, filtros, pagina, limite) => {
  let resultado = bdMemoria.movimientos.filter((m) => m.usuarioId === usuarioId);
  if (filtros.tipo) {
    resultado = resultado.filter((m) => m.tipo === filtros.tipo);
  }
  return {
    movimientos: resultado,
    paginacion: { paginaActual: pagina, limite, totalRegistros: resultado.length, totalPaginas: 1 }
  };
};

const usuario1 = 'usr-001';
const usuario2 = 'usr-002';

async function ejecutarPruebas() {
  // ===========================================================================
  // HU-03: Cuentas o Medios de Pago
  // ===========================================================================
  console.log('\n--- HU-03: Cuentas o Medios de Pago ---');

  // E1: Camino Feliz - Crear cuenta
  const cuentaCreada = await cuentaServicio.crearCuenta(usuario1, {
    nombre: 'Banco Principal',
    tipo: 'banco',
    saldoInicialEnCentavos: 100000 // $1,000.00
  });
  assert('HU-03 E1: Cuenta creada con saldo en centavos exacto', cuentaCreada.saldoActualEnCentavos === 100000);

  // E2: Alternativo - Editar nombre
  const cuentaEditada = await cuentaServicio.editarCuenta(usuario1, cuentaCreada._id, {
    nombre: 'Banco Sueldo'
  });
  assert('HU-03 E2: Nombre de cuenta actualizado exitosamente', cuentaEditada.nombre === 'Banco Sueldo');

  // E3: Error - Nombre vacío
  let errorE3 = null;
  try {
    await cuentaServicio.crearCuenta(usuario1, { nombre: ' ', tipo: 'banco' });
  } catch (err) {
    errorE3 = err;
  }
  assert('HU-03 E3: Rechaza creación de cuenta con nombre vacío (400)', errorE3 && errorE3.codigoEstado === 400);

  // ===========================================================================
  // HU-04: Categorías de Ingresos y Gastos
  // ===========================================================================
  console.log('\n--- HU-04: Categorías de Ingresos y Gastos ---');

  // E1: Camino Feliz - Crear categoría
  const categoriaGasto = await categoriaServicio.crearCategoria(usuario1, {
    nombre: 'Alimentación',
    tipo: 'GASTO',
    color: '#EF4444'
  });
  assert('HU-04 E1: Categoría GASTO creada vinculada al usuario', categoriaGasto.tipo === 'GASTO');

  const categoriaIngreso = await categoriaServicio.crearCategoria(usuario1, {
    nombre: 'Sueldo',
    tipo: 'INGRESO',
    color: '#10B981'
  });
  assert('HU-04 E1: Categoría INGRESO creada correctamente', categoriaIngreso.tipo === 'INGRESO');

  // E2: Alternativo - Modificar color
  const categoriaColorEditado = await categoriaServicio.editarCategoria(usuario1, categoriaGasto._id, {
    color: '#DC2626'
  });
  assert('HU-04 E2: Color de categoría actualizado', categoriaColorEditado.color === '#DC2626');

  // E3: Error - Nombre duplicado para el mismo usuario y tipo
  let errorE3Cat = null;
  try {
    await categoriaServicio.crearCategoria(usuario1, {
      nombre: 'Alimentación',
      tipo: 'GASTO'
    });
  } catch (err) {
    errorE3Cat = err;
  }
  assert('HU-04 E3: Rechaza duplicado para el mismo usuario y tipo con código 409', errorE3Cat && errorE3Cat.codigoEstado === 409);

  // E4: Borde - Otro usuario sí puede crear una categoría con el mismo nombre
  const categoriaUsuario2 = await categoriaServicio.crearCategoria(usuario2, {
    nombre: 'Alimentación',
    tipo: 'GASTO'
  });
  assert('HU-04 E4: Otro usuario puede registrar el mismo nombre de categoría (aislamiento)', categoriaUsuario2.usuarioId === usuario2);

  // ===========================================================================
  // HU-05: Registrar Ingresos y Gastos
  // ===========================================================================
  console.log('\n--- HU-05: Registrar Ingresos y Gastos ---');

  // E1: Camino Feliz - Registrar gasto de $45.50 (4550 centavos)
  const resMov = await movimientoServicio.registrarMovimiento(usuario1, {
    tipo: 'GASTO',
    montoEnCentavos: 4550,
    categoriaId: categoriaGasto._id,
    cuentaId: cuentaCreada._id,
    descripcion: 'Almuerzo'
  });
  assert('HU-05 E1: Saldo de la cuenta descuenta 4550 centavos exactamente', resMov.saldoActualCuentaEnCentavos === 95450);

  // E2: Alternativo - Reversión matemática al eliminar
  const resEliminar = await movimientoServicio.eliminarMovimiento(usuario1, resMov.movimiento._id);
  const cuentaTrasEliminar = await cuentaServicio.obtenerCuentaPorId(usuario1, cuentaCreada._id);
  assert('HU-05 E2: Al eliminar movimiento, el saldo se restaura íntegramente a 100000 centavos', cuentaTrasEliminar.saldoActualEnCentavos === 100000);

  // Re-crear un movimiento para probar HU-03 E4
  await movimientoServicio.registrarMovimiento(usuario1, {
    tipo: 'GASTO',
    montoEnCentavos: 1000,
    categoriaId: categoriaGasto._id,
    cuentaId: cuentaCreada._id
  });

  // HU-03 E4: Borde - No se puede eliminar una cuenta con movimientos asociados
  let errorE4Cuenta = null;
  try {
    await cuentaServicio.eliminarCuenta(usuario1, cuentaCreada._id);
  } catch (err) {
    errorE4Cuenta = err;
  }
  assert('HU-03 E4: Bloquea eliminación de cuenta con movimientos asociados con código 409', errorE4Cuenta && errorE4Cuenta.codigoEstado === 409);

  // E3: Error - Monto <= 0
  let errorE3Monto = null;
  try {
    await movimientoServicio.registrarMovimiento(usuario1, {
      tipo: 'GASTO',
      montoEnCentavos: 0,
      categoriaId: categoriaGasto._id,
      cuentaId: cuentaCreada._id
    });
  } catch (err) {
    errorE3Monto = err;
  }
  assert('HU-05 E3: Rechaza monto 0 o negativo con 400 "El monto debe ser mayor a 0"', errorE3Monto && errorE3Monto.codigoEstado === 400);

  // E4: Borde - Incompatibilidad de tipo (Categoría INGRESO en un movimiento GASTO)
  let errorE4Tipo = null;
  try {
    await movimientoServicio.registrarMovimiento(usuario1, {
      tipo: 'GASTO',
      montoEnCentavos: 5000,
      categoriaId: categoriaIngreso._id, // Categoria es INGRESO, pero movimiento es GASTO
      cuentaId: cuentaCreada._id
    });
  } catch (err) {
    errorE4Tipo = err;
  }
  assert('HU-05 E4: Rechaza categoría INGRESO en movimiento de GASTO con código 400', errorE4Tipo && errorE4Tipo.codigoEstado === 400);

  // E5: Regla Anti-Saldos Negativos - Rechaza gasto mayor al saldo disponible en cuenta con 400
  let errorE5Saldo = null;
  try {
    await movimientoServicio.registrarMovimiento(usuario1, {
      tipo: 'GASTO',
      montoEnCentavos: 5000000, // S/. 50,000.00 > saldo disponible
      categoriaId: categoriaGasto._id,
      cuentaId: cuentaCreada._id
    });
  } catch (err) {
    errorE5Saldo = err;
  }
  assert(
    'HU-05 E5: Regla Anti-Saldos Negativos - Rechaza gasto mayor al saldo disponible con código 400',
    errorE5Saldo && errorE5Saldo.codigoEstado === 400 && errorE5Saldo.mensaje.includes('Saldo insuficiente')
  );

  // ===========================================================================
  // HU-06: Historial y Filtros Dinámicos
  // ===========================================================================
  console.log('\n--- HU-06: Historial y Filtros Dinámicos ---');

  // E1: Camino Feliz - Listar movimientos
  const listado = await movimientoServicio.listarMovimientos(usuario1, { pagina: 1, limite: 10 });
  assert('HU-06 E1: Listado paginado de movimientos obtenido exitosamente', listado.movimientos.length > 0);

  // E2: Alternativo - Filtrar por tipo
  const filtradoTipo = await movimientoServicio.listarMovimientos(usuario1, { tipo: 'GASTO' });
  assert('HU-06 E2: Filtro por tipo GASTO aplicado correctamente', filtradoTipo.movimientos.every((m) => m.tipo === 'GASTO'));

  // E3: Error - Fecha inicial mayor a la final
  let errorE3Fechas = null;
  try {
    await movimientoServicio.listarMovimientos(usuario1, {
      desde: '2026-11-20',
      hasta: '2026-11-10'
    });
  } catch (err) {
    errorE3Fechas = err;
  }
  assert('HU-06 E3: Rechaza rango cronológico inverso con "La fecha inicial no puede ser mayor a la final" (400)', errorE3Fechas && errorE3Fechas.codigoEstado === 400);

  // E4: Borde - Sin resultados para filtros
  const filtradoVacio = await movimientoServicio.listarMovimientos(usuario1, { tipo: 'INGRESO' });
  assert('HU-06 E4: Filtros sin coincidencia devuelven arreglo vacío sin errores', filtradoVacio.movimientos.length === 0);

  console.log('\n================================================================');
  console.log(`🏁 RESULTADO: ${pruebasPasadas}/${totalPruebas} pruebas superadas.`);
  if (pruebasPasadas === totalPruebas) {
    console.log('🎉 TODOS LOS ESCENARIOS GHERKIN DE HU-03, HU-04, HU-05 Y HU-06 SE CUMPLEN');
  } else {
    console.error('⚠️ ALGUNAS PRUEBAS FALLARON');
  }
  console.log('================================================================');
}

ejecutarPruebas();
