import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { cuentaServicio } from '../src/servicios/cuentaServicio.js';
import { categoriaServicio } from '../src/servicios/categoriaServicio.js';
import { movimientoServicio } from '../src/servicios/movimientoServicio.js';
import { cuentaRepositorio } from '../src/repositorios/cuentaRepositorio.js';
import { categoriaRepositorio } from '../src/repositorios/categoriaRepositorio.js';
import { movimientoRepositorio } from '../src/repositorios/movimientoRepositorio.js';

const bdMemoria = {
  cuentas: [],
  categorias: [],
  movimientos: []
};

cuentaRepositorio.crear = async (usuarioId, datos) => {
  const c = { _id: `c-${Date.now()}-${Math.random()}`, usuarioId, ...datos, activo: true };
  c.save = async () => c;
  bdMemoria.cuentas.push(c);
  return c;
};
cuentaRepositorio.buscarPorId = async (usuarioId, id) =>
  bdMemoria.cuentas.find((c) => c._id === id && c.usuarioId === usuarioId) || null;
cuentaRepositorio.actualizarPorId = async (usuarioId, id, datos) => {
  const idx = bdMemoria.cuentas.findIndex((c) => c._id === id && c.usuarioId === usuarioId);
  if (idx === -1) return null;
  bdMemoria.cuentas[idx] = { ...bdMemoria.cuentas[idx], ...datos };
  return bdMemoria.cuentas[idx];
};
cuentaRepositorio.eliminarPorId = async (usuarioId, id) => {
  bdMemoria.cuentas = bdMemoria.cuentas.filter((c) => !(c._id === id && c.usuarioId === usuarioId));
};

categoriaRepositorio.crear = async (usuarioId, datos) => {
  const cat = { _id: `cat-${Date.now()}-${Math.random()}`, usuarioId, ...datos, activo: true };
  bdMemoria.categorias.push(cat);
  return cat;
};
categoriaRepositorio.buscarPorId = async (usuarioId, id) =>
  bdMemoria.categorias.find((c) => c._id === id && c.usuarioId === usuarioId) || null;
categoriaRepositorio.buscarPorNombreYTipo = async (usuarioId, nombre, tipo) =>
  bdMemoria.categorias.find(
    (c) =>
      c.usuarioId === usuarioId &&
      c.nombre.toLowerCase() === nombre.toLowerCase() &&
      c.tipo === tipo
  ) || null;
categoriaRepositorio.actualizarPorId = async (usuarioId, id, datos) => {
  const idx = bdMemoria.categorias.findIndex((c) => c._id === id && c.usuarioId === usuarioId);
  if (idx === -1) return null;
  bdMemoria.categorias[idx] = { ...bdMemoria.categorias[idx], ...datos };
  return bdMemoria.categorias[idx];
};

movimientoRepositorio.crear = async (usuarioId, datos) => {
  const m = { _id: `m-${Date.now()}-${Math.random()}`, usuarioId, ...datos };
  bdMemoria.movimientos.push(m);
  return m;
};
movimientoRepositorio.buscarPorId = async (usuarioId, id) =>
  bdMemoria.movimientos.find((m) => m._id === id && m.usuarioId === usuarioId) || null;
movimientoRepositorio.actualizarPorId = async (usuarioId, id, datos) => {
  const idx = bdMemoria.movimientos.findIndex((m) => m._id === id && m.usuarioId === usuarioId);
  if (idx === -1) return null;
  bdMemoria.movimientos[idx] = { ...bdMemoria.movimientos[idx], ...datos };
  return bdMemoria.movimientos[idx];
};
movimientoRepositorio.eliminarPorId = async (usuarioId, id) => {
  bdMemoria.movimientos = bdMemoria.movimientos.filter((m) => !(m._id === id && m.usuarioId === usuarioId));
};
movimientoRepositorio.contarPorCuenta = async (usuarioId, cuentaId) =>
  bdMemoria.movimientos.filter((m) => m.usuarioId === usuarioId && m.cuentaId === cuentaId).length;
movimientoRepositorio.buscarConFiltrosYPaginacion = async (usuarioId, filtros, pagina, limite) => {
  let resultado = bdMemoria.movimientos.filter((m) => m.usuarioId === usuarioId);
  if (filtros.tipo) resultado = resultado.filter((m) => m.tipo === filtros.tipo);
  return {
    movimientos: resultado,
    paginacion: { paginaActual: pagina, limite, totalRegistros: resultado.length, totalPaginas: 1 }
  };
};

describe('Reglas Financieras de Cuentas, Categorías y Movimientos (HU-03 a HU-06)', () => {
  const usuario1 = 'usr-001';
  const usuario2 = 'usr-002';
  let cuentaCreada;
  let categoriaGasto;
  let categoriaIngreso;

  test('HU-03 E1: Crea cuenta con saldo en centavos exacto', async () => {
    cuentaCreada = await cuentaServicio.crearCuenta(usuario1, {
      nombre: 'Banco Principal',
      tipo: 'banco',
      saldoInicialEnCentavos: 100000
    });
    assert.equal(cuentaCreada.saldoActualEnCentavos, 100000);
  });

  test('HU-03 E2: Edita nombre de cuenta exitosamente', async () => {
    const editada = await cuentaServicio.editarCuenta(usuario1, cuentaCreada._id, {
      nombre: 'Banco Sueldo'
    });
    assert.equal(editada.nombre, 'Banco Sueldo');
  });

  test('HU-03 E3: Rechaza creación de cuenta con nombre vacío (400)', async () => {
    await assert.rejects(
      () => cuentaServicio.crearCuenta(usuario1, { nombre: ' ', tipo: 'banco' }),
      (err) => err.codigoEstado === 400
    );
  });

  test('HU-04 E1 (Gasto): Crea categoría GASTO vinculada al usuario', async () => {
    categoriaGasto = await categoriaServicio.crearCategoria(usuario1, {
      nombre: 'Alimentación',
      tipo: 'GASTO',
      color: '#EF4444'
    });
    assert.equal(categoriaGasto.tipo, 'GASTO');
  });

  test('HU-04 E1 (Ingreso): Crea categoría INGRESO vinculada al usuario', async () => {
    categoriaIngreso = await categoriaServicio.crearCategoria(usuario1, {
      nombre: 'Sueldo',
      tipo: 'INGRESO',
      color: '#10B981'
    });
    assert.equal(categoriaIngreso.tipo, 'INGRESO');
  });

  test('HU-04 E2: Modifica color de categoría', async () => {
    const editada = await categoriaServicio.editarCategoria(usuario1, categoriaGasto._id, {
      color: '#DC2626'
    });
    assert.equal(editada.color, '#DC2626');
  });

  test('HU-04 E3: Rechaza categoría duplicada para el mismo usuario y tipo (409)', async () => {
    await assert.rejects(
      () => categoriaServicio.crearCategoria(usuario1, { nombre: 'Alimentación', tipo: 'GASTO' }),
      (err) => err.codigoEstado === 409
    );
  });

  test('HU-04 E4: Permite mismo nombre de categoría para otro inquilino', async () => {
    const catU2 = await categoriaServicio.crearCategoria(usuario2, {
      nombre: 'Alimentación',
      tipo: 'GASTO'
    });
    assert.equal(catU2.usuarioId, usuario2);
  });

  test('HU-05 E1: Descuenta 4550 centavos exactamente al registrar gasto', async () => {
    const res = await movimientoServicio.registrarMovimiento(usuario1, {
      tipo: 'GASTO',
      montoEnCentavos: 4550,
      categoriaId: categoriaGasto._id,
      cuentaId: cuentaCreada._id,
      descripcion: 'Almuerzo'
    });
    assert.equal(res.saldoActualCuentaEnCentavos, 95450);

    // Restaurar para prueba E2
    await movimientoServicio.eliminarMovimiento(usuario1, res.movimiento._id);
  });

  test('HU-05 E2: Restaura el saldo íntegramente a 100000 centavos al eliminar movimiento', async () => {
    const cuenta = await cuentaServicio.obtenerCuentaPorId(usuario1, cuentaCreada._id);
    assert.equal(cuenta.saldoActualEnCentavos, 100000);
  });

  test('HU-03 E4: Bloquea eliminación de cuenta con movimientos asociados (409)', async () => {
    await movimientoServicio.registrarMovimiento(usuario1, {
      tipo: 'GASTO',
      montoEnCentavos: 1000,
      categoriaId: categoriaGasto._id,
      cuentaId: cuentaCreada._id
    });

    await assert.rejects(
      () => cuentaServicio.eliminarCuenta(usuario1, cuentaCreada._id),
      (err) => err.codigoEstado === 409
    );
  });

  test('HU-05 E3: Rechaza monto 0 o negativo con código 400', async () => {
    await assert.rejects(
      () =>
        movimientoServicio.registrarMovimiento(usuario1, {
          tipo: 'GASTO',
          montoEnCentavos: 0,
          categoriaId: categoriaGasto._id,
          cuentaId: cuentaCreada._id
        }),
      (err) => err.codigoEstado === 400
    );
  });

  test('HU-05 E4: Rechaza categoría INGRESO en movimiento GASTO con código 400', async () => {
    await assert.rejects(
      () =>
        movimientoServicio.registrarMovimiento(usuario1, {
          tipo: 'GASTO',
          montoEnCentavos: 5000,
          categoriaId: categoriaIngreso._id,
          cuentaId: cuentaCreada._id
        }),
      (err) => err.codigoEstado === 400
    );
  });

  test('HU-05 E5: Regla Anti-Saldos Negativos rechaza gasto mayor al saldo disponible (400)', async () => {
    await assert.rejects(
      () =>
        movimientoServicio.registrarMovimiento(usuario1, {
          tipo: 'GASTO',
          montoEnCentavos: 5000000,
          categoriaId: categoriaGasto._id,
          cuentaId: cuentaCreada._id
        }),
      (err) => err.codigoEstado === 400 && err.mensaje.includes('Saldo insuficiente')
    );
  });

  test('HU-06 E1: Lista movimientos paginados', async () => {
    const listado = await movimientoServicio.listarMovimientos(usuario1, { pagina: 1, limite: 10 });
    assert.equal(listado.movimientos.length > 0, true);
  });

  test('HU-06 E2: Filtra movimientos por tipo GASTO', async () => {
    const filtrado = await movimientoServicio.listarMovimientos(usuario1, { tipo: 'GASTO' });
    assert.equal(filtrado.movimientos.every((m) => m.tipo === 'GASTO'), true);
  });

  test('HU-06 E3: Rechaza rango cronológico inverso (desde > hasta) con 400', async () => {
    await assert.rejects(
      () => movimientoServicio.listarMovimientos(usuario1, { desde: '2026-11-20', hasta: '2026-11-10' }),
      (err) => err.codigoEstado === 400
    );
  });

  test('HU-06 E4: Filtros sin coincidencias devuelven arreglo vacío sin errores', async () => {
    const vacio = await movimientoServicio.listarMovimientos(usuario1, { tipo: 'INGRESO' });
    assert.equal(vacio.movimientos.length, 0);
  });
});
