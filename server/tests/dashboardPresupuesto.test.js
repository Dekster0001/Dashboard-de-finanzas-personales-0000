import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { presupuestoServicio } from '../src/servicios/presupuestoServicio.js';
import { dashboardServicio } from '../src/servicios/dashboardServicio.js';
import { presupuestoRepositorio } from '../src/repositorios/presupuestoRepositorio.js';
import { dashboardRepositorio } from '../src/repositorios/dashboardRepositorio.js';

const bdMemoria = {
  presupuestos: [],
  movimientos: [],
  cuentas: []
};

presupuestoRepositorio.buscarPorMes = async (usuarioId, mes) =>
  bdMemoria.presupuestos.find((p) => String(p.usuarioId) === String(usuarioId) && p.mes === mes) || null;

presupuestoRepositorio.definirPresupuesto = async (usuarioId, mes, montoLimiteEnCentavos) => {
  let p = bdMemoria.presupuestos.find((item) => String(item.usuarioId) === String(usuarioId) && item.mes === mes);
  if (p) {
    p.montoLimiteEnCentavos = montoLimiteEnCentavos;
  } else {
    p = { _id: `pres-${Date.now()}-${Math.random()}`, usuarioId, mes, montoLimiteEnCentavos };
    bdMemoria.presupuestos.push(p);
  }
  return p;
};

dashboardRepositorio.sumarGastosPorRango = async (usuarioId, inicioFecha, finFecha) =>
  bdMemoria.movimientos
    .filter(
      (m) =>
        String(m.usuarioId) === String(usuarioId) &&
        m.tipo === 'GASTO' &&
        m.fecha >= inicioFecha &&
        m.fecha <= finFecha
    )
    .reduce((total, m) => total + m.montoEnCentavos, 0);

dashboardRepositorio.obtenerTotalesPorTipo = async (usuarioId, inicioFecha, finFecha) => {
  const movs = bdMemoria.movimientos.filter(
    (m) => String(m.usuarioId) === String(usuarioId) && m.fecha >= inicioFecha && m.fecha <= finFecha
  );
  return {
    ingresosEnCentavos: movs.filter((m) => m.tipo === 'INGRESO').reduce((s, m) => s + m.montoEnCentavos, 0),
    gastosEnCentavos: movs.filter((m) => m.tipo === 'GASTO').reduce((s, m) => s + m.montoEnCentavos, 0)
  };
};

dashboardRepositorio.obtenerPatrimonioTotal = async (usuarioId) =>
  bdMemoria.cuentas
    .filter((c) => String(c.usuarioId) === String(usuarioId) && c.activo)
    .reduce((total, c) => total + c.saldoActualEnCentavos, 0);

dashboardRepositorio.obtenerGastosPorCategoria = async (usuarioId, inicioFecha, finFecha) => {
  const gastos = bdMemoria.movimientos.filter(
    (m) =>
      String(m.usuarioId) === String(usuarioId) &&
      m.tipo === 'GASTO' &&
      m.fecha >= inicioFecha &&
      m.fecha <= finFecha
  );
  const categoriasMap = {};
  for (const g of gastos) {
    const cat = g.categoria || { nombre: 'Sin Categoría', color: '#94A3B8' };
    if (!categoriasMap[cat.nombre]) {
      categoriasMap[cat.nombre] = {
        categoriaId: `cat-${cat.nombre}`,
        categoria: cat.nombre,
        color: cat.color,
        totalEnCentavos: 0
      };
    }
    categoriasMap[cat.nombre].totalEnCentavos += g.montoEnCentavos;
  }
  return Object.values(categoriasMap).sort((a, b) => b.totalEnCentavos - a.totalEnCentavos);
};

dashboardRepositorio.obtenerAgrupacion6Meses = async (usuarioId, fechaInicio, fechaFin) => {
  const movs = bdMemoria.movimientos.filter(
    (m) => String(m.usuarioId) === String(usuarioId) && m.fecha >= fechaInicio && m.fecha <= fechaFin
  );
  const mapa = {};
  for (const m of movs) {
    const mesStr = m.fecha.toISOString().substring(0, 7);
    const clave = `${mesStr}_${m.tipo}`;
    if (!mapa[clave]) mapa[clave] = { _id: { mes: mesStr, tipo: m.tipo }, totalEnCentavos: 0 };
    mapa[clave].totalEnCentavos += m.montoEnCentavos;
  }
  return Object.values(mapa);
};

describe('Presupuesto Mensual y Analítica de Dashboard (HU-07 y HU-08)', () => {
  const usuario1Id = 'usr-001';
  const usuario2Id = 'usr-002';
  const mesTest = '2026-11';

  test('HU-07 E1 (Límite): Devuelve límite exacto en 200000 centavos', async () => {
    await presupuestoServicio.definirPresupuesto(usuario1Id, mesTest, 200000);
    bdMemoria.movimientos.push({
      usuarioId: usuario1Id,
      tipo: 'GASTO',
      montoEnCentavos: 50000,
      fecha: new Date('2026-11-10T12:00:00Z'),
      categoria: { nombre: 'Alimentación', color: '#EF4444' }
    });
    const p = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, mesTest);
    assert.equal(p.limiteEnCentavos, 200000);
  });

  test('HU-07 E1 (Gastado): Devuelve gasto acumulado de 50000 centavos', async () => {
    const p = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, mesTest);
    assert.equal(p.gastadoEnCentavos, 50000);
  });

  test('HU-07 E1 (Disponible): Devuelve saldo disponible de 150000 centavos', async () => {
    const p = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, mesTest);
    assert.equal(p.disponibleEnCentavos, 150000);
  });

  test('HU-07 E1 (Semáforo): Devuelve 25% consumido y estado "OK"', async () => {
    const p = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, mesTest);
    assert.equal(p.porcentajeConsumido, 25.0);
    assert.equal(p.estado, 'OK');
  });

  test('HU-07 E2 (Recálculo): Actualiza límite a 300000 y disponible a 250000', async () => {
    const p = await presupuestoServicio.definirPresupuesto(usuario1Id, mesTest, 300000);
    assert.equal(p.limiteEnCentavos, 300000);
    assert.equal(p.disponibleEnCentavos, 250000);
  });

  test('HU-07 E2 (Porcentaje): Recalcula porcentaje inmediatamente a 16.67%', async () => {
    const p = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, mesTest);
    assert.equal(p.porcentajeConsumido, 16.67);
    assert.equal(p.estado, 'OK');
  });

  test('HU-07 E3 (Negativo): Rechaza límite negativo con código 400', async () => {
    await assert.rejects(
      () => presupuestoServicio.definirPresupuesto(usuario1Id, mesTest, -5000),
      (err) => err.codigoEstado === 400
    );
  });

  test('HU-07 E3 (Cero): Rechaza límite igual a cero con código 400', async () => {
    await assert.rejects(
      () => presupuestoServicio.definirPresupuesto(usuario1Id, mesTest, 0),
      (err) => err.codigoEstado === 400
    );
  });

  test('HU-07 E3 (Mes inválido): Rechaza formato de mes inválido con código 400', async () => {
    await assert.rejects(
      () => presupuestoServicio.definirPresupuesto(usuario1Id, 'mes-invalido', 10000),
      (err) => err.codigoEstado === 400
    );
  });

  test('HU-07 E4 (Alerta): Gasto del 85% activa semáforo en estado "ALERTA"', async () => {
    await presupuestoServicio.definirPresupuesto(usuario1Id, '2026-12', 100000);
    bdMemoria.movimientos.push({
      usuarioId: usuario1Id,
      tipo: 'GASTO',
      montoEnCentavos: 85000,
      fecha: new Date('2026-12-05T10:00:00Z'),
      categoria: { nombre: 'Servicios', color: '#3B82F6' }
    });
    const p = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, '2026-12');
    assert.equal(p.porcentajeConsumido, 85.0);
    assert.equal(p.estado, 'ALERTA');
  });

  test('HU-07 E4 (Excedido): Gasto del 105% activa estado "EXCEDIDO" con disponible negativo', async () => {
    bdMemoria.movimientos.push({
      usuarioId: usuario1Id,
      tipo: 'GASTO',
      montoEnCentavos: 20000,
      fecha: new Date('2026-12-10T10:00:00Z'),
      categoria: { nombre: 'Ocio', color: '#F59E0B' }
    });
    const p = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, '2026-12');
    assert.equal(p.porcentajeConsumido, 105.0);
    assert.equal(p.estado, 'EXCEDIDO');
    assert.equal(p.disponibleEnCentavos, -5000);
  });

  test('HU-08 E1 (KPIs): Calcula ingresos (200000), gastos (50000) y balance neto (150000)', async () => {
    bdMemoria.movimientos.push({
      usuarioId: usuario1Id,
      tipo: 'INGRESO',
      montoEnCentavos: 200000,
      fecha: new Date('2026-11-01T09:00:00Z')
    });
    bdMemoria.cuentas.push({
      usuarioId: usuario1Id,
      nombre: 'Banco Principal',
      saldoActualEnCentavos: 350000,
      activo: true
    });
    const r = await dashboardServicio.obtenerResumen(usuario1Id, '2026-11');
    assert.equal(r.ingresosEnCentavos, 200000);
    assert.equal(r.gastosEnCentavos, 50000);
    assert.equal(r.balanceNetoEnCentavos, 150000);
  });

  test('HU-08 E1 (Patrimonio): Suma todas las cuentas activas (350000 centavos)', async () => {
    const r = await dashboardServicio.obtenerResumen(usuario1Id, '2026-11');
    assert.equal(r.patrimonioTotalEnCentavos, 350000);
  });

  test('HU-08 E1 (Dona): Devuelve Alimentación con categoriaId y porcentaje 100%', async () => {
    const dona = await dashboardServicio.obtenerGastosPorCategoria(usuario1Id, '2026-11');
    assert.equal(dona.length, 1);
    assert.equal(dona[0].categoria, 'Alimentación');
    assert.equal(Boolean(dona[0].categoriaId), true);
    assert.equal(dona[0].porcentaje, 100.0);
  });

  test('HU-08 E1 (Tendencia 6m): Devuelve exactamente 6 meses continuos', async () => {
    const t = await dashboardServicio.obtenerTendenciaMensual(usuario1Id, '2026-11');
    assert.equal(t.length, 6);
    assert.equal(t[0].mes, '2026-06');
    assert.equal(t[5].mes, '2026-11');
  });

  test('HU-08 E1 (Mes actual tendencia): Refleja ingresos y gastos reales en el último mes', async () => {
    const t = await dashboardServicio.obtenerTendenciaMensual(usuario1Id, '2026-11');
    assert.equal(t[5].ingresosEnCentavos, 200000);
    assert.equal(t[5].gastosEnCentavos, 50000);
  });

  test('HU-08 E2: Mes sin movimientos (2026-10) devuelve ceros sin fallar', async () => {
    const r = await dashboardServicio.obtenerResumen(usuario1Id, '2026-10');
    assert.equal(r.mes, '2026-10');
    assert.equal(r.ingresosEnCentavos, 0);
    assert.equal(r.gastosEnCentavos, 0);
  });

  test('HU-08 E3 (Usuario nuevo resumen): Recibe ceros en todos los KPIs', async () => {
    const r = await dashboardServicio.obtenerResumen('usr-nuevo', '2026-11');
    assert.equal(r.ingresosEnCentavos, 0);
    assert.equal(r.gastosEnCentavos, 0);
    assert.equal(r.patrimonioTotalEnCentavos, 0);
  });

  test('HU-08 E3 (Usuario nuevo dona): Recibe arreglo vacío', async () => {
    const d = await dashboardServicio.obtenerGastosPorCategoria('usr-nuevo', '2026-11');
    assert.deepEqual(d, []);
  });

  test('HU-08 E3 (Usuario nuevo tendencia): Recibe 6 meses con ceros', async () => {
    const t = await dashboardServicio.obtenerTendenciaMensual('usr-nuevo', '2026-11');
    assert.equal(t.length, 6);
    assert.equal(t.every((m) => m.ingresosEnCentavos === 0 && m.gastosEnCentavos === 0), true);
  });

  test('HU-08 E3 (Usuario nuevo presupuesto): Devuelve estado SIN_PRESUPUESTO', async () => {
    const p = await presupuestoServicio.obtenerPresupuestoMes('usr-nuevo', '2026-11');
    assert.equal(p.estado, 'SIN_PRESUPUESTO');
    assert.equal(p.limiteEnCentavos, 0);
  });

  test('HU-08 E4 (Aislamiento U1): Gastos de usuario 2 no contaminan al usuario 1', async () => {
    bdMemoria.movimientos.push({
      usuarioId: usuario2Id,
      tipo: 'GASTO',
      montoEnCentavos: 99000,
      fecha: new Date('2026-11-15T15:00:00Z'),
      categoria: { nombre: 'Educación', color: '#10B981' }
    });
    const r1 = await dashboardServicio.obtenerResumen(usuario1Id, '2026-11');
    assert.equal(r1.gastosEnCentavos, 50000);
  });

  test('HU-08 E4 (Aislamiento U2): Usuario 2 ve exclusivamente sus 99000 centavos', async () => {
    const r2 = await dashboardServicio.obtenerResumen(usuario2Id, '2026-11');
    assert.equal(r2.gastosEnCentavos, 99000);
  });
});
