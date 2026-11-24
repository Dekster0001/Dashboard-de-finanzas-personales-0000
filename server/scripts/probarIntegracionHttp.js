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

/**
 * Prueba de Integración HTTP real contra la aplicación Express completa
 * (enrutadores, passport-jwt, validadores, controladores, servicios y manejadorErrores).
 */

let total = 0;
let pasadas = 0;

function afirmar(descripcion, condicion) {
  total++;
  if (condicion) {
    console.log(`✅ [PASÓ] ${descripcion}`);
    pasadas++;
  } else {
    console.error(`❌ [FALLÓ] ${descripcion}`);
  }
}

// Almacén en memoria compatible con métodos de Mongoose usados en servicios
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
    if (u.intentosFallidosLogin >= 5) {
      u.bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000);
    }
  };
  u.restablecerIntentos = async () => {
    u.intentosFallidosLogin = 0;
    u.bloqueadoHasta = null;
  };
  u.save = async () => u;
  return u;
}

// Stubs de repositorios (conservando la lógica real de Express, Passport, Validadores, Controladores y Servicios)
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

async function peticion(baseUrl, ruta, { metodo = 'GET', token = null, cuerpo = null } = {}) {
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

async function ejecutar() {
  const servidor = app.listen(0);
  const { port } = servidor.address();
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    console.log('================================================================');
    console.log('🌐 PRUEBA DE INTEGRACIÓN HTTP REAL (EXPRESS + CONTRATOS API)');
    console.log('================================================================');

    // 1. Salud
    const salud = await peticion(baseUrl, '/salud');
    afirmar('GET /api/salud responde 200 OK', salud.status === 200 && salud.json.estado === 'exito');

    // 2. Registro y login con correo con punto (Gmail)
    const reg1 = await peticion(baseUrl, '/auth/registro', {
      metodo: 'POST',
      cuerpo: { nombre: 'Ana López', correo: 'ana.lopez@gmail.com', contrasena: 'Password2026!' }
    });
    afirmar('POST /api/auth/registro con punto en correo responde 201', reg1.status === 201);

    const log1 = await peticion(baseUrl, '/auth/login', {
      metodo: 'POST',
      cuerpo: { correo: 'ana.lopez@gmail.com', contrasena: 'Password2026!' }
    });
    afirmar('POST /api/auth/login con el mismo correo con punto responde 200', log1.status === 200 && Boolean(log1.json.datos?.token));
    const tokenU1 = log1.json.datos.token;

    // Segundo usuario + usuario ADMIN
    const reg2 = await peticion(baseUrl, '/auth/registro', {
      metodo: 'POST',
      cuerpo: { nombre: 'Luis Pérez', correo: 'luis@demo.com', contrasena: 'Password2026!' }
    });
    const tokenU2 = reg2.json.datos.token;

    const hashAdmin = await bcryptjs.hash('Admin2026!', 10);
    await usuarioRepositorio.crear({ nombre: 'Admin', correo: 'admin@demo.com', contrasenaHash: hashAdmin, rol: 'ADMIN', activo: true });
    const logAdmin = await peticion(baseUrl, '/auth/login', {
      metodo: 'POST',
      cuerpo: { correo: 'admin@demo.com', contrasena: 'Admin2026!' }
    });
    const tokenAdmin = logAdmin.json.datos.token;

    // 3. Restablecer contraseña exige tokenRecuperacion
    const resetInvalido = await peticion(baseUrl, '/auth/restablecer-contrasena', {
      metodo: 'POST',
      cuerpo: { token: 'abc', nuevaContrasena: 'Password2026!' }
    });
    afirmar('POST /api/auth/restablecer-contrasena rechaza campo antiguo "token" con 400', resetInvalido.status === 400);

    // 4. Cuentas activas/inactivas + desactivación
    const ctaRes = await peticion(baseUrl, '/cuentas', {
      metodo: 'POST',
      token: tokenU1,
      cuerpo: { nombre: 'BCP Sueldo', tipo: 'banco', saldoInicialEnCentavos: 100000 }
    });
    afirmar('POST /api/cuentas crea cuenta activa', ctaRes.status === 201 && ctaRes.json.datos.activo === true);
    const cuentaId = ctaRes.json.datos._id;

    // Categoría con paréntesis para probar escape RegExp
    const catRes = await peticion(baseUrl, '/categorias', {
      metodo: 'POST',
      token: tokenU1,
      cuerpo: { nombre: 'Servicios (Luz/Agua)', tipo: 'GASTO', color: '#3B82F6' }
    });
    afirmar('POST /api/categorias con paréntesis no lanza 500 (escape RegExp)', catRes.status === 201);
    const categoriaId = catRes.json.datos._id;

    // Movimiento + GET /api/movimientos/:id + defensa IDOR
    const movRes = await peticion(baseUrl, '/movimientos', {
      metodo: 'POST',
      token: tokenU1,
      cuerpo: { tipo: 'GASTO', montoEnCentavos: 25000, categoriaId, cuentaId, descripcion: 'Recibo luz' }
    });
    afirmar('POST /api/movimientos descuenta saldo (75000)', movRes.status === 201 && movRes.json.datos.saldoActualCuentaEnCentavos === 75000);
    const movId = movRes.json.datos.movimiento._id;

    const getMovDueno = await peticion(baseUrl, `/movimientos/${movId}`, { token: tokenU1 });
    afirmar('GET /api/movimientos/:id responde 200 al propietario', getMovDueno.status === 200);

    const getMovAjeno = await peticion(baseUrl, `/movimientos/${movId}`, { token: tokenU2 });
    afirmar('GET /api/movimientos/:id responde 404 ante intento IDOR de otro usuario', getMovAjeno.status === 404);

    // Dashboard Patrimonio Total y por-categoría
    const dashResumen = await peticion(baseUrl, '/dashboard/resumen?mes=2026-11', { token: tokenU1 });
    afirmar('GET /api/dashboard/resumen calcula patrimonioTotalEnCentavos real (75000)', dashResumen.status === 200 && dashResumen.json.datos.patrimonioTotalEnCentavos === 75000);

    const dashCat = await peticion(baseUrl, '/dashboard/por-categoria?mes=2026-11', { token: tokenU1 });
    afirmar(
      'GET /api/dashboard/por-categoria incluye categoriaId y categoria',
      dashCat.status === 200 && Boolean(dashCat.json.datos[0]?.categoriaId) && dashCat.json.datos[0]?.categoria === 'Servicios (Luz/Agua)'
    );

    // Desactivar cuenta y comprobar ?incluirInactivas=true
    const editarInactiva = await peticion(baseUrl, `/cuentas/${cuentaId}`, {
      metodo: 'PUT',
      token: tokenU1,
      cuerpo: { activo: false }
    });
    afirmar('PUT /api/cuentas/:id permite desactivar cuenta (activo: false)', editarInactiva.status === 200 && editarInactiva.json.datos.activo === false);

    const listarSoloActivas = await peticion(baseUrl, '/cuentas', { token: tokenU1 });
    const listarConInactivas = await peticion(baseUrl, '/cuentas?incluirInactivas=true', { token: tokenU1 });
    afirmar(
      'GET /api/cuentas excluye inactivas por defecto y las incluye con ?incluirInactivas=true',
      listarSoloActivas.json.datos.length === 0 && listarConInactivas.json.datos.length === 1
    );

    // Middleware encadenado en POST /api/presupuestos con mes inválido
    const presInvalido = await peticion(baseUrl, '/presupuestos', {
      metodo: 'POST',
      token: tokenU1,
      cuerpo: { mes: 'invalido', montoLimiteEnCentavos: 100000 }
    });
    afirmar('POST /api/presupuestos con mes inválido responde 400', presInvalido.status === 400);

    // Admin RBAC + Paginación + Búsqueda + PATCH
    const adminProhibido = await peticion(baseUrl, '/admin/usuarios', { token: tokenU1 });
    afirmar('GET /api/admin/usuarios rechaza USUARIO con 403 Forbidden', adminProhibido.status === 403);

    const adminLista = await peticion(baseUrl, '/admin/usuarios?busqueda=ana&pagina=1&limite=5', { token: tokenAdmin });
    afirmar(
      'GET /api/admin/usuarios retorna { usuarios, paginacion } filtrado',
      adminLista.status === 200 &&
        Array.isArray(adminLista.json.datos?.usuarios) &&
        adminLista.json.datos.usuarios.length === 1 &&
        adminLista.json.datos.paginacion?.totalRegistros === 1
    );

    const uuidU2 = reg2.json.datos.usuario.uuid;
    const patchRol = await peticion(baseUrl, `/admin/usuarios/${uuidU2}/rol`, {
      metodo: 'PATCH',
      token: tokenAdmin,
      cuerpo: { rol: 'ADMIN' }
    });
    afirmar('PATCH /api/admin/usuarios/:id/rol actualiza rol a ADMIN (200)', patchRol.status === 200 && patchRol.json.datos.rol === 'ADMIN');

    console.log('\n================================================================');
    console.log(`🏁 RESULTADO HTTP: ${pasadas}/${total} pruebas superadas.`);
    console.log('================================================================');
    if (pasadas !== total) {
      process.exitCode = 1;
    }
  } finally {
    servidor.close();
  }
}

ejecutar().catch((err) => {
  console.error('Error fatal en prueba HTTP:', err);
  process.exit(1);
});
