import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import app from '../src/app.js';
import { usuarioRepositorio } from '../src/repositorios/usuarioRepositorio.js';
import { cuentaRepositorio } from '../src/repositorios/cuentaRepositorio.js';
import { categoriaRepositorio } from '../src/repositorios/categoriaRepositorio.js';
import { movimientoRepositorio } from '../src/repositorios/movimientoRepositorio.js';
import { presupuestoRepositorio } from '../src/repositorios/presupuestoRepositorio.js';
import { dashboardRepositorio } from '../src/repositorios/dashboardRepositorio.js';

const bd = {
  usuarios: [],
  cuentas: [],
  categorias: [],
  movimientos: [],
  presupuestos: []
};

function envolverUsuario(u) {
  u.compararContrasena = async (clave) => bcryptjs.compare(clave, u.contrasenaHash);
  u.generarTokenRecuperacion = () => {
    const plano = crypto.randomBytes(32).toString('hex');
    u.tokenRecuperacionHash = crypto.createHash('sha256').update(plano).digest('hex');
    u.tokenRecuperacionExpira = new Date(Date.now() + 30 * 60 * 1000);
    return plano;
  };
  u.estaBloqueado = () => Boolean(u.bloqueadoHasta && u.bloqueadoHasta > new Date());
  u.registrarIntentoFallido = async () => {
    u.intentosFallidosLogin += 1;
    if (u.intentosFallidosLogin >= 5) u.bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000);
  };
  u.restablecerIntentos = async () => {
    u.intentosFallidosLogin = 0;
    u.bloqueadoHasta = null;
  };
  u.save = async () => u;
  return u;
}

usuarioRepositorio.crear = async (datos) => {
  const nuevo = envolverUsuario({
    _id: `usr-${bd.usuarios.length + 1}`,
    id: `usr-${bd.usuarios.length + 1}`,
    uuid: uuidv4(),
    intentosFallidosLogin: 0,
    bloqueadoHasta: null,
    creadoEn: new Date(),
    ...datos
  });
  bd.usuarios.push(nuevo);
  return nuevo;
};
usuarioRepositorio.buscarPorCorreo = async (correo) =>
  bd.usuarios.find((u) => u.correo === correo.toLowerCase().trim()) || null;
usuarioRepositorio.buscarPorCorreoConCredenciales = async (correo) =>
  bd.usuarios.find((u) => u.correo === correo.toLowerCase().trim()) || null;
usuarioRepositorio.buscarPorUuid = async (uuid) =>
  bd.usuarios.find((u) => u.uuid === uuid) || null;
usuarioRepositorio.buscarPorId = async (id) =>
  bd.usuarios.find((u) => u._id === id) || null;
usuarioRepositorio.buscarPorTokenRecuperacion = async (hash) =>
  bd.usuarios.find((u) => u.tokenRecuperacionHash === hash && u.tokenRecuperacionExpira > new Date()) || null;
usuarioRepositorio.guardar = async (u) => u;
usuarioRepositorio.listarConPaginacion = async ({ busqueda = '', pagina = 1, limite = 10 } = {}) => {
  let filtrados = bd.usuarios;
  if (busqueda && busqueda.trim()) {
    const regex = new RegExp(busqueda.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filtrados = filtrados.filter((u) => regex.test(u.nombre) || regex.test(u.correo));
  }
  const paginaNum = Math.max(1, Number(pagina) || 1);
  const limiteNum = Math.max(1, Number(limite) || 10);
  const inicio = (paginaNum - 1) * limiteNum;
  return {
    usuarios: filtrados.slice(inicio, inicio + limiteNum),
    paginacion: {
      paginaActual: paginaNum,
      limite: limiteNum,
      totalRegistros: filtrados.length,
      totalPaginas: Math.ceil(filtrados.length / limiteNum) || 1
    }
  };
};

cuentaRepositorio.crear = async (usuarioId, datos) => {
  const c = { _id: `cta-${bd.cuentas.length + 1}`, usuarioId, ...datos, save: async () => c };
  bd.cuentas.push(c);
  return c;
};
cuentaRepositorio.listarActivas = async (usuarioId, incluirInactivas = false) =>
  bd.cuentas.filter((c) => c.usuarioId === usuarioId && (incluirInactivas || c.activo !== false));
cuentaRepositorio.buscarPorId = async (usuarioId, id) =>
  bd.cuentas.find((c) => c._id === id && c.usuarioId === usuarioId) || null;
cuentaRepositorio.actualizarPorId = async (usuarioId, id, datos) => {
  const idx = bd.cuentas.findIndex((c) => c._id === id && c.usuarioId === usuarioId);
  if (idx === -1) return null;
  bd.cuentas[idx] = { ...bd.cuentas[idx], ...datos, save: async () => bd.cuentas[idx] };
  return bd.cuentas[idx];
};

categoriaRepositorio.crear = async (usuarioId, datos) => {
  const cat = { _id: `cat-${bd.categorias.length + 1}`, usuarioId, ...datos };
  bd.categorias.push(cat);
  return cat;
};
categoriaRepositorio.buscarPorId = async (usuarioId, id) =>
  bd.categorias.find((c) => c._id === id && c.usuarioId === usuarioId) || null;
categoriaRepositorio.buscarPorNombreYTipo = async (usuarioId, nombre, tipo) => {
  const esc = nombre.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = new RegExp(`^${esc}$`, 'i');
  return bd.categorias.find((c) => c.usuarioId === usuarioId && rx.test(c.nombre) && c.tipo === tipo) || null;
};

movimientoRepositorio.crear = async (usuarioId, datos) => {
  const m = { _id: `mov-${bd.movimientos.length + 1}`, usuarioId, ...datos };
  bd.movimientos.push(m);
  return m;
};
movimientoRepositorio.buscarPorId = async (usuarioId, id) =>
  bd.movimientos.find((m) => m._id === id && m.usuarioId === usuarioId) || null;
movimientoRepositorio.buscarDetallePorId = async (usuarioId, id) =>
  bd.movimientos.find((m) => m._id === id && m.usuarioId === usuarioId) || null;
movimientoRepositorio.contarPorCuenta = async (usuarioId, cuentaId) =>
  bd.movimientos.filter((m) => m.usuarioId === usuarioId && m.cuentaId === cuentaId).length;
movimientoRepositorio.buscarConFiltrosYPaginacion = async (usuarioId, filtros, pagina = 1, limite = 10) => {
  const res = bd.movimientos.filter((m) => m.usuarioId === usuarioId);
  return {
    movimientos: res.slice((pagina - 1) * limite, pagina * limite),
    paginacion: {
      paginaActual: pagina,
      limite,
      totalRegistros: res.length,
      totalPaginas: Math.ceil(res.length / limite) || 1
    }
  };
};

presupuestoRepositorio.buscarPorMes = async (usuarioId, mes) =>
  bd.presupuestos.find((p) => p.usuarioId === usuarioId && p.mes === mes) || null;
presupuestoRepositorio.definirPresupuesto = async (usuarioId, mes, montoLimiteEnCentavos) => {
  const existente = bd.presupuestos.find((p) => p.usuarioId === usuarioId && p.mes === mes);
  if (existente) {
    existente.montoLimiteEnCentavos = montoLimiteEnCentavos;
    return existente;
  }
  const p = { _id: `pres-${bd.presupuestos.length + 1}`, usuarioId, mes, montoLimiteEnCentavos };
  bd.presupuestos.push(p);
  return p;
};

dashboardRepositorio.obtenerTotalesPorTipo = async (usuarioId) => {
  const movs = bd.movimientos.filter((m) => m.usuarioId === usuarioId);
  return {
    ingresosEnCentavos: movs.filter((m) => m.tipo === 'INGRESO').reduce((s, m) => s + m.montoEnCentavos, 0),
    gastosEnCentavos: movs.filter((m) => m.tipo === 'GASTO').reduce((s, m) => s + m.montoEnCentavos, 0)
  };
};
dashboardRepositorio.obtenerPatrimonioTotal = async (usuarioId) =>
  bd.cuentas.filter((c) => c.usuarioId === usuarioId && c.activo === true).reduce((s, c) => s + c.saldoActualEnCentavos, 0);
dashboardRepositorio.obtenerGastosPorCategoria = async (usuarioId) => {
  const gastos = bd.movimientos.filter((m) => m.usuarioId === usuarioId && m.tipo === 'GASTO');
  const map = {};
  for (const g of gastos) {
    const cat = bd.categorias.find((c) => c._id === g.categoriaId) || { nombre: 'Sin Categoría', color: '#94A3B8' };
    if (!map[g.categoriaId]) {
      map[g.categoriaId] = { categoriaId: g.categoriaId, categoria: cat.nombre, color: cat.color, totalEnCentavos: 0 };
    }
    map[g.categoriaId].totalEnCentavos += g.montoEnCentavos;
  }
  return Object.values(map);
};
dashboardRepositorio.sumarGastosPorRango = async (usuarioId) =>
  bd.movimientos.filter((m) => m.usuarioId === usuarioId && m.tipo === 'GASTO').reduce((s, m) => s + m.montoEnCentavos, 0);
dashboardRepositorio.obtenerAgrupacion6Meses = async () => [];

describe('Pruebas de Integración HTTP sobre Express (Contratos API + Seguridad)', () => {
  let servidor;
  let baseUrl;
  let tokenU1;
  let tokenU2;
  let uuidU2;
  let tokenAdmin;
  let cuentaId;
  let categoriaId;
  let movId;

  async function peticion(ruta, { metodo = 'GET', token = null, cuerpo = null } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const resp = await fetch(`${baseUrl}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    const json = await resp.json();
    return { status: resp.status, json };
  }

  before(async () => {
    servidor = app.listen(0);
    const { port } = servidor.address();
    baseUrl = `http://127.0.0.1:${port}/api`;
  });

  after(() => {
    servidor?.close();
  });

  test('GET /api/salud responde 200 OK', async () => {
    const res = await peticion('/salud');
    assert.equal(res.status, 200);
    assert.equal(res.json.estado, 'exito');
  });

  test('POST /api/auth/registro con punto en correo responde 201', async () => {
    const res = await peticion('/auth/registro', {
      metodo: 'POST',
      cuerpo: { nombre: 'Ana López', correo: 'ana.lopez@gmail.com', contrasena: 'Password2026!' }
    });
    assert.equal(res.status, 201);
  });

  test('POST /api/auth/login con el mismo correo con punto responde 200', async () => {
    const res = await peticion('/auth/login', {
      metodo: 'POST',
      cuerpo: { correo: 'ana.lopez@gmail.com', contrasena: 'Password2026!' }
    });
    assert.equal(res.status, 200);
    assert.equal(Boolean(res.json.datos?.token), true);
    tokenU1 = res.json.datos.token;

    const reg2 = await peticion('/auth/registro', {
      metodo: 'POST',
      cuerpo: { nombre: 'Luis Pérez', correo: 'luis@demo.com', contrasena: 'Password2026!' }
    });
    tokenU2 = reg2.json.datos.token;
    uuidU2 = reg2.json.datos.usuario.uuid;

    const hashAdmin = await bcryptjs.hash('Admin2026!', 10);
    await usuarioRepositorio.crear({ nombre: 'Admin', correo: 'admin@demo.com', contrasenaHash: hashAdmin, rol: 'ADMIN', activo: true });
    const logAdmin = await peticion('/auth/login', {
      metodo: 'POST',
      cuerpo: { correo: 'admin@demo.com', contrasena: 'Admin2026!' }
    });
    tokenAdmin = logAdmin.json.datos.token;
  });

  test('POST /api/auth/restablecer-contrasena rechaza campo antiguo "token" con 400', async () => {
    const res = await peticion('/auth/restablecer-contrasena', {
      metodo: 'POST',
      cuerpo: { token: 'abc', nuevaContrasena: 'Password2026!' }
    });
    assert.equal(res.status, 400);
  });

  test('POST /api/cuentas crea cuenta activa', async () => {
    const res = await peticion('/cuentas', {
      metodo: 'POST',
      token: tokenU1,
      cuerpo: { nombre: 'BCP Sueldo', tipo: 'banco', saldoInicialEnCentavos: 100000 }
    });
    assert.equal(res.status, 201);
    assert.equal(res.json.datos.activo, true);
    cuentaId = res.json.datos._id;
  });

  test('POST /api/categorias con paréntesis no lanza 500 (escape RegExp)', async () => {
    const res = await peticion('/categorias', {
      metodo: 'POST',
      token: tokenU1,
      cuerpo: { nombre: 'Servicios (Luz/Agua)', tipo: 'GASTO', color: '#3B82F6' }
    });
    assert.equal(res.status, 201);
    categoriaId = res.json.datos._id;
  });

  test('POST /api/movimientos descuenta saldo exactamente (75000)', async () => {
    const res = await peticion('/movimientos', {
      metodo: 'POST',
      token: tokenU1,
      cuerpo: { tipo: 'GASTO', montoEnCentavos: 25000, categoriaId, cuentaId, descripcion: 'Recibo luz' }
    });
    assert.equal(res.status, 201);
    assert.equal(res.json.datos.saldoActualCuentaEnCentavos, 75000);
    movId = res.json.datos.movimiento._id;
  });

  test('GET /api/movimientos/:id responde 200 al propietario', async () => {
    const res = await peticion(`/movimientos/${movId}`, { token: tokenU1 });
    assert.equal(res.status, 200);
  });

  test('GET /api/movimientos/:id responde 404 ante intento IDOR de otro usuario', async () => {
    const res = await peticion(`/movimientos/${movId}`, { token: tokenU2 });
    assert.equal(res.status, 404);
  });

  test('GET /api/dashboard/resumen calcula patrimonioTotalEnCentavos real (75000)', async () => {
    const res = await peticion('/dashboard/resumen?mes=2026-11', { token: tokenU1 });
    assert.equal(res.status, 200);
    assert.equal(res.json.datos.patrimonioTotalEnCentavos, 75000);
  });

  test('GET /api/dashboard/por-categoria incluye categoriaId y categoria', async () => {
    const res = await peticion('/dashboard/por-categoria?mes=2026-11', { token: tokenU1 });
    assert.equal(res.status, 200);
    assert.equal(Boolean(res.json.datos[0]?.categoriaId), true);
    assert.equal(res.json.datos[0]?.categoria, 'Servicios (Luz/Agua)');
  });

  test('PUT /api/cuentas/:id permite desactivar cuenta (activo: false)', async () => {
    const res = await peticion(`/cuentas/${cuentaId}`, {
      metodo: 'PUT',
      token: tokenU1,
      cuerpo: { activo: false }
    });
    assert.equal(res.status, 200);
    assert.equal(res.json.datos.activo, false);
  });

  test('GET /api/cuentas excluye inactivas por defecto y las incluye con ?incluirInactivas=true', async () => {
    const soloActivas = await peticion('/cuentas', { token: tokenU1 });
    const conInactivas = await peticion('/cuentas?incluirInactivas=true', { token: tokenU1 });
    assert.equal(soloActivas.json.datos.length, 0);
    assert.equal(conInactivas.json.datos.length, 1);
  });

  test('POST /api/presupuestos con mes inválido responde 400', async () => {
    const res = await peticion('/presupuestos', {
      metodo: 'POST',
      token: tokenU1,
      cuerpo: { mes: 'invalido', montoLimiteEnCentavos: 100000 }
    });
    assert.equal(res.status, 400);
  });

  test('GET /api/admin/usuarios rechaza USUARIO con 403 Forbidden', async () => {
    const res = await peticion('/admin/usuarios', { token: tokenU1 });
    assert.equal(res.status, 403);
  });

  test('GET /api/admin/usuarios retorna { usuarios, paginacion } filtrado', async () => {
    const res = await peticion('/admin/usuarios?busqueda=ana&pagina=1&limite=5', { token: tokenAdmin });
    assert.equal(res.status, 200);
    assert.equal(Array.isArray(res.json.datos?.usuarios), true);
    assert.equal(res.json.datos.usuarios.length, 1);
    assert.equal(res.json.datos.paginacion?.totalRegistros, 1);
  });

  test('PATCH /api/admin/usuarios/:id/rol actualiza rol a ADMIN (200)', async () => {
    const res = await peticion(`/admin/usuarios/${uuidU2}/rol`, {
      metodo: 'PATCH',
      token: tokenAdmin,
      cuerpo: { rol: 'ADMIN' }
    });
    assert.equal(res.status, 200);
    assert.equal(res.json.datos.rol, 'ADMIN');
  });
});
