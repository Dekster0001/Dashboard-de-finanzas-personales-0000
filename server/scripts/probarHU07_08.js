import { presupuestoServicio } from '../src/servicios/presupuestoServicio.js';
import { dashboardServicio } from '../src/servicios/dashboardServicio.js';
import { presupuestoRepositorio } from '../src/repositorios/presupuestoRepositorio.js';
import { dashboardRepositorio } from '../src/repositorios/dashboardRepositorio.js';

console.log('================================================================');
console.log('🧪 VERIFICACIÓN AUTOMATIZADA DE ESCENARIOS GHERKIN (HU-07 Y HU-08)');
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

// Base de datos en memoria para simular Mongoose
const bdMemoria = {
  presupuestos: [],
  movimientos: [],
  cuentas: []
};

// Sobrescribir repositorio de presupuestos
presupuestoRepositorio.buscarPorMes = async (usuarioId, mes) => {
  return (
    bdMemoria.presupuestos.find(
      (p) => String(p.usuarioId) === String(usuarioId) && p.mes === mes
    ) || null
  );
};

presupuestoRepositorio.definirPresupuesto = async (usuarioId, mes, montoLimiteEnCentavos) => {
  let p = bdMemoria.presupuestos.find(
    (item) => String(item.usuarioId) === String(usuarioId) && item.mes === mes
  );
  if (p) {
    p.montoLimiteEnCentavos = montoLimiteEnCentavos;
  } else {
    p = {
      _id: `pres-${Date.now()}-${Math.random()}`,
      usuarioId,
      mes,
      montoLimiteEnCentavos
    };
    bdMemoria.presupuestos.push(p);
  }
  return p;
};

// Sobrescribir repositorio de dashboard
dashboardRepositorio.sumarGastosPorRango = async (usuarioId, inicioFecha, finFecha) => {
  const gastos = bdMemoria.movimientos.filter(
    (m) =>
      String(m.usuarioId) === String(usuarioId) &&
      m.tipo === 'GASTO' &&
      m.fecha >= inicioFecha &&
      m.fecha <= finFecha
  );
  return gastos.reduce((total, m) => total + m.montoEnCentavos, 0);
};

dashboardRepositorio.obtenerTotalesPorTipo = async (usuarioId, inicioFecha, finFecha) => {
  const movs = bdMemoria.movimientos.filter(
    (m) =>
      String(m.usuarioId) === String(usuarioId) &&
      m.fecha >= inicioFecha &&
      m.fecha <= finFecha
  );
  let ingresosEnCentavos = 0;
  let gastosEnCentavos = 0;
  for (const m of movs) {
    if (m.tipo === 'INGRESO') ingresosEnCentavos += m.montoEnCentavos;
    if (m.tipo === 'GASTO') gastosEnCentavos += m.montoEnCentavos;
  }
  return { ingresosEnCentavos, gastosEnCentavos };
};

dashboardRepositorio.obtenerPatrimonioTotal = async (usuarioId) => {
  const cuentas = bdMemoria.cuentas.filter(
    (c) => String(c.usuarioId) === String(usuarioId) && c.activo
  );
  return cuentas.reduce((total, c) => total + c.saldoActualEnCentavos, 0);
};

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
    (m) =>
      String(m.usuarioId) === String(usuarioId) &&
      m.fecha >= fechaInicio &&
      m.fecha <= fechaFin
  );

  const mapa = {};
  for (const m of movs) {
    const mesStr = m.fecha.toISOString().substring(0, 7);
    const clave = `${mesStr}_${m.tipo}`;
    if (!mapa[clave]) {
      mapa[clave] = {
        _id: { mes: mesStr, tipo: m.tipo },
        totalEnCentavos: 0
      };
    }
    mapa[clave].totalEnCentavos += m.montoEnCentavos;
  }

  return Object.values(mapa);
};

// =============================================================================
// EJECUCIÓN DE PRUEBAS
// =============================================================================
async function ejecutarPruebas() {
  const usuario1Id = 'usr-001';
  const usuario2Id = 'usr-002';
  const mesTest = '2026-11';

  console.log('\n--- HU-07: Presupuesto Mensual y Avance ---');

  // E1 Camino Feliz: Presupuesto 200000 ($2000), gasto acumulado 50000 ($500) -> 25%, disp 150000, OK
  await presupuestoServicio.definirPresupuesto(usuario1Id, mesTest, 200000);
  bdMemoria.movimientos.push({
    usuarioId: usuario1Id,
    tipo: 'GASTO',
    montoEnCentavos: 50000,
    fecha: new Date('2026-11-10T12:00:00Z'),
    categoria: { nombre: 'Alimentación', color: '#EF4444' }
  });

  const pE1 = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, mesTest);
  assert(
    'HU-07 E1: Límite devuelto exactamente en 200000 centavos ($2000)',
    pE1.limiteEnCentavos === 200000 && pE1.limite === 200000
  );
  assert(
    'HU-07 E1: Gasto acumulado de 50000 centavos ($500)',
    pE1.gastadoEnCentavos === 50000 && pE1.gastado === 50000
  );
  assert(
    'HU-07 E1: Saldo disponible de 150000 centavos ($1500)',
    pE1.disponibleEnCentavos === 150000 && pE1.disponible === 150000
  );
  assert(
    'HU-07 E1: Porcentaje consumido exacto de 25% y estado "OK"',
    pE1.porcentajeConsumido === 25.0 && pE1.estado === 'OK'
  );

  // E2 Alternativo: Modificar límite a 300000 ($3000) -> recálculo inmediato
  const pE2 = await presupuestoServicio.definirPresupuesto(usuario1Id, mesTest, 300000);
  assert(
    'HU-07 E2: Límite actualizado a 300000 centavos y disponible recalculado a 250000',
    pE2.limiteEnCentavos === 300000 && pE2.disponibleEnCentavos === 250000
  );
  assert(
    'HU-07 E2: Porcentaje recalculado inmediatamente a 16.67%',
    pE2.porcentajeConsumido === 16.67 && pE2.estado === 'OK'
  );

  // E3 Error: Límite <= 0, no entero o vacío -> Error 400
  let errorE3Capturado = false;
  try {
    await presupuestoServicio.definirPresupuesto(usuario1Id, mesTest, -5000);
  } catch (err) {
    errorE3Capturado = err.codigoEstado === 400;
  }
  assert('HU-07 E3: Rechaza límite negativo con código 400', errorE3Capturado);

  let errorE3Cero = false;
  try {
    await presupuestoServicio.definirPresupuesto(usuario1Id, mesTest, 0);
  } catch (err) {
    errorE3Cero = err.codigoEstado === 400;
  }
  assert('HU-07 E3: Rechaza límite igual a cero con código 400', errorE3Cero);

  let errorE3Mes = false;
  try {
    await presupuestoServicio.definirPresupuesto(usuario1Id, 'mes-invalido', 10000);
  } catch (err) {
    errorE3Mes = err.codigoEstado === 400;
  }
  assert('HU-07 E3: Rechaza formato de mes inválido con código 400', errorE3Mes);

  // E4 Borde: Semáforo financiero (ALERTA >= 80%, EXCEDIDO > 100%)
  // Fijamos presupuesto a 100000 ($1000)
  await presupuestoServicio.definirPresupuesto(usuario1Id, '2026-12', 100000);

  // Caso 85% de gasto: 85000 centavos -> ALERTA
  bdMemoria.movimientos.push({
    usuarioId: usuario1Id,
    tipo: 'GASTO',
    montoEnCentavos: 85000,
    fecha: new Date('2026-12-05T10:00:00Z'),
    categoria: { nombre: 'Servicios', color: '#3B82F6' }
  });
  const pAlerta = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, '2026-12');
  assert(
    'HU-07 E4: Gasto del 85% activa semáforo en estado "ALERTA"',
    pAlerta.porcentajeConsumido === 85.0 && pAlerta.estado === 'ALERTA'
  );

  // Caso 105% de gasto: sumamos 20000 más -> total 105000 centavos -> EXCEDIDO
  bdMemoria.movimientos.push({
    usuarioId: usuario1Id,
    tipo: 'GASTO',
    montoEnCentavos: 20000,
    fecha: new Date('2026-12-10T10:00:00Z'),
    categoria: { nombre: 'Ocio', color: '#F59E0B' }
  });
  const pExcedido = await presupuestoServicio.obtenerPresupuestoMes(usuario1Id, '2026-12');
  assert(
    'HU-07 E4: Gasto del 105% activa estado "EXCEDIDO" con disponible negativo (-5000)',
    pExcedido.porcentajeConsumido === 105.0 &&
      pExcedido.estado === 'EXCEDIDO' &&
      pExcedido.disponibleEnCentavos === -5000
  );

  console.log('\n--- HU-08: Dashboard e Indicadores Gráficos ---');

  // Agregar datos para probar KPIs de noviembre:
  // Usuario 1 ya tiene gasto de 50000 en noviembre
  // Agregamos ingreso de 200000 en noviembre y cuenta con saldo 350000
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

  // E1 Camino Feliz: Resumen KPIs, gráfico dona y tendencia 6 meses
  const resumenE1 = await dashboardServicio.obtenerResumen(usuario1Id, '2026-11');
  assert(
    'HU-08 E1: Resumen calcula ingresos (200000), gastos (50000) y balance neto (150000)',
    resumenE1.ingresosEnCentavos === 200000 &&
      resumenE1.gastosEnCentavos === 50000 &&
      resumenE1.balanceNetoEnCentavos === 150000
  );
  assert(
    'HU-08 E1: Patrimonio total suma todas las cuentas activas (350000 centavos)',
    resumenE1.patrimonioTotalEnCentavos === 350000
  );

  const donaE1 = await dashboardServicio.obtenerGastosPorCategoria(usuario1Id, '2026-11');
  assert(
    'HU-08 E1: Gráfico dona devuelve categoría Alimentación al 100% de los gastos del mes',
    donaE1.length === 1 &&
      donaE1[0].categoria === 'Alimentación' &&
      donaE1[0].totalEnCentavos === 50000 &&
      donaE1[0].porcentaje === 100.0
  );

  const tendenciaE1 = await dashboardServicio.obtenerTendenciaMensual(usuario1Id, '2026-11');
  assert(
    'HU-08 E1: Tendencia mensual devuelve exactamente 6 meses continuos',
    tendenciaE1.length === 6 &&
      tendenciaE1[0].mes === '2026-06' &&
      tendenciaE1[5].mes === '2026-11'
  );
  assert(
    'HU-08 E1: Mes actual en tendencia refleja ingresos y gastos reales',
    tendenciaE1[5].ingresosEnCentavos === 200000 && tendenciaE1[5].gastosEnCentavos === 50000
  );

  // E2 Alternativo: Selector de mes en query param (ej. 2026-10 sin movimientos en ese mes)
  const resumenOctubre = await dashboardServicio.obtenerResumen(usuario1Id, '2026-10');
  assert(
    'HU-08 E2: Selector de mes dinámico: mes 2026-10 tiene ingresos 0 y gastos 0 sin fallar',
    resumenOctubre.mes === '2026-10' &&
      resumenOctubre.ingresosEnCentavos === 0 &&
      resumenOctubre.gastosEnCentavos === 0 &&
      resumenOctubre.balanceNetoEnCentavos === 0
  );

  // E3 Borde: Usuario nuevo sin datos recibe ceros, no errores
  const resumenNuevo = await dashboardServicio.obtenerResumen('usr-nuevo', '2026-11');
  assert(
    'HU-08 E3: Usuario nuevo recibe ceros en todos los KPIs de resumen',
    resumenNuevo.ingresosEnCentavos === 0 &&
      resumenNuevo.gastosEnCentavos === 0 &&
      resumenNuevo.balanceNetoEnCentavos === 0 &&
      resumenNuevo.patrimonioTotalEnCentavos === 0
  );

  const donaNuevo = await dashboardServicio.obtenerGastosPorCategoria('usr-nuevo', '2026-11');
  assert(
    'HU-08 E3: Usuario nuevo recibe arreglo vacío en por-categoría',
    Array.isArray(donaNuevo) && donaNuevo.length === 0
  );

  const tendenciaNuevo = await dashboardServicio.obtenerTendenciaMensual('usr-nuevo', '2026-11');
  assert(
    'HU-08 E3: Usuario nuevo recibe 6 meses continuos con ceros sin excepción',
    tendenciaNuevo.length === 6 &&
      tendenciaNuevo.every((m) => m.ingresosEnCentavos === 0 && m.gastosEnCentavos === 0)
  );

  const presNuevo = await presupuestoServicio.obtenerPresupuestoMes('usr-nuevo', '2026-11');
  assert(
    'HU-08 E3: Presupuesto de usuario nuevo devuelve estado SIN_PRESUPUESTO y ceros',
    presNuevo.limite === 0 &&
      presNuevo.gastado === 0 &&
      presNuevo.disponible === 0 &&
      presNuevo.porcentaje === 0 &&
      presNuevo.estado === 'SIN_PRESUPUESTO'
  );

  // E4 Aislamiento Multiinquilino (SaaS)
  // Usuario 2 registra gasto en 2026-11
  bdMemoria.movimientos.push({
    usuarioId: usuario2Id,
    tipo: 'GASTO',
    montoEnCentavos: 99000,
    fecha: new Date('2026-11-15T15:00:00Z'),
    categoria: { nombre: 'Educación', color: '#10B981' }
  });

  const resumenU1PostU2 = await dashboardServicio.obtenerResumen(usuario1Id, '2026-11');
  assert(
    'HU-08 E4: Gasto de Usuario 2 no altera los gastos de Usuario 1 (se mantienen en 50000)',
    resumenU1PostU2.gastosEnCentavos === 50000
  );

  const resumenU2 = await dashboardServicio.obtenerResumen(usuario2Id, '2026-11');
  assert(
    'HU-08 E4: Usuario 2 ve exclusivamente sus propios gastos (99000 centavos)',
    resumenU2.gastosEnCentavos === 99000
  );

  console.log('\n================================================================');
  console.log(`🏁 RESULTADO: ${pruebasPasadas}/${totalPruebas} pruebas superadas.`);
  if (pruebasPasadas === totalPruebas) {
    console.log('🎉 TODOS LOS ESCENARIOS GHERKIN DE HU-07 Y HU-08 SE CUMPLEN');
  } else {
    console.error('⚠️ ALGUNAS PRUEBAS FALLARON');
    process.exit(1);
  }
  console.log('================================================================');
}

ejecutarPruebas().catch((err) => {
  console.error('Error no controlado en la prueba:', err);
  process.exit(1);
});
