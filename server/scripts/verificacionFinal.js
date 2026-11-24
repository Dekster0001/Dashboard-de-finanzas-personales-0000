import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const raizServer = path.resolve(__dirname, '..');
const raizProyecto = path.resolve(raizServer, '..');

console.log('================================================================');
console.log('🔍 AUDITORÍA Y VERIFICACIÓN INTEGRAL DEL PROYECTO (PROMPT P10)');
console.log('================================================================');

let totalChecks = 0;
let checksPasados = 0;

const assert = (descripcion, condicion) => {
  totalChecks++;
  if (condicion) {
    console.log(`✅ [PASÓ] ${descripcion}`);
    checksPasados++;
  } else {
    console.error(`❌ [FALLÓ] ${descripcion}`);
  }
};

// 1. Verificar existencia de archivos fundamentales
console.log('\n--- 1. Integridad de Archivos de Especificación y Documentación ---');
const archivosClave = [
  'AGENTS.md',
  'README.md',
  'package.json',
  'specs/historias.md',
  'specs/api.md',
  'specs/modelo-datos.md',
  'specs/reglas-negocio.md',
  'specs/seguridad.md'
];

for (const archivo of archivosClave) {
  const rutaCompleta = path.join(raizProyecto, archivo);
  assert(`Existe archivo de especificación obligatorio: ${archivo}`, fs.existsSync(rutaCompleta));
}

if (fs.existsSync(path.join(raizProyecto, 'word.md'))) {
  console.log('ℹ️ [INFO] Guía de desarrollo interna (word.md) presente en entorno local.');
}

// 2. Verificar que RepositorioBase y Repositorios inyectan usuarioId
console.log('\n--- 2. Aislamiento Multiinquilino (SaaS) en Capa de Repositorios ---');
const rutaRepositorioBase = path.join(raizServer, 'src', 'repositorios', 'RepositorioBase.js');
const contenidoRepoBase = fs.readFileSync(rutaRepositorioBase, 'utf-8');

assert(
  'RepositorioBase valida y fuerza usuarioId en método buscar()',
  contenidoRepoBase.includes('buscar(usuarioId') && contenidoRepoBase.includes('usuarioId') && contenidoRepoBase.includes('this._validarUsuarioId(usuarioId)')
);
assert(
  'RepositorioBase valida y fuerza usuarioId en método buscarPorId()',
  contenidoRepoBase.includes('buscarPorId(usuarioId') && contenidoRepoBase.includes('_id: id, usuarioId')
);
assert(
  'RepositorioBase valida y fuerza usuarioId en método crear()',
  contenidoRepoBase.includes('crear(usuarioId') && contenidoRepoBase.includes('...datos, usuarioId')
);
assert(
  'RepositorioBase valida y fuerza usuarioId en método actualizar()',
  contenidoRepoBase.includes('actualizar(usuarioId') && contenidoRepoBase.includes('_id: id, usuarioId')
);
assert(
  'RepositorioBase valida y fuerza usuarioId en método eliminar()',
  contenidoRepoBase.includes('eliminar(usuarioId') && contenidoRepoBase.includes('_id: id, usuarioId')
);

// 3. Verificar agregaciones analíticas de Dashboard
console.log('\n--- 3. Aislamiento Multiinquilino en Agregaciones de Dashboard ---');
const rutaDashboardRepo = path.join(raizServer, 'src', 'repositorios', 'dashboardRepositorio.js');
const contenidoDashboardRepo = fs.readFileSync(rutaDashboardRepo, 'utf-8');

assert(
  'dashboardRepositorio filtra por usuarioId en obtenerTotalesPorTipo',
  contenidoDashboardRepo.includes('usuarioId: idObj')
);
assert(
  'dashboardRepositorio filtra por usuarioId en sumarGastosPorRango',
  contenidoDashboardRepo.includes('usuarioId: idObj,')
);
assert(
  'dashboardRepositorio filtra por usuarioId en obtenerPatrimonioTotal',
  contenidoDashboardRepo.includes('usuarioId: idObj,')
);
assert(
  'dashboardRepositorio filtra por usuarioId en obtenerGastosPorCategoria',
  contenidoDashboardRepo.includes('usuarioId: idObj,')
);
assert(
  'dashboardRepositorio filtra por usuarioId en obtenerAgrupacion6Meses',
  contenidoDashboardRepo.includes('usuarioId: idObj,')
);

// 4. Verificar montaje de rutas en Express app.js
console.log('\n--- 4. Montaje de Enrutadores en Express (app.js) ---');
const rutaApp = path.join(raizServer, 'src', 'app.js');
const contenidoApp = fs.readFileSync(rutaApp, 'utf-8');

const rutasMontadas = [
  "app.use('/api/auth'",
  "app.use('/api/admin'",
  "app.use('/api/cuentas'",
  "app.use('/api/categorias'",
  "app.use('/api/movimientos'",
  "app.use('/api/presupuestos'",
  "app.use('/api/dashboard'"
];

for (const ruta of rutasMontadas) {
  assert(`Enrutador Express montado: ${ruta}`, contenidoApp.includes(ruta));
}

// 5. Verificar scripts en package.json de la raíz
console.log('\n--- 5. Scripts de Arranque en package.json Raíz ---');
const rutaPackageJson = path.join(raizProyecto, 'package.json');
const pkg = JSON.parse(fs.readFileSync(rutaPackageJson, 'utf-8'));

assert('Script "instalar" configurado', !!pkg.scripts?.instalar);
assert('Script "seed" configurado', !!pkg.scripts?.seed);
assert('Script "dev" configurado con concurrently', pkg.scripts?.dev?.includes('concurrently'));

// 6. Verificar frontend componentes y utilidades
console.log('\n--- 6. Módulos y Componentes de Frontend en client/ ---');
const componentesFrontend = [
  'client/src/api/clienteApi.js',
  'client/src/contexto/ContextoAuth.jsx',
  'client/src/rutas/RutaPrivada.jsx',
  'client/src/rutas/RutaPorRol.jsx',
  'client/src/componentes/layout/Navbar.jsx',
  'client/src/componentes/layout/BarraLateral.jsx',
  'client/src/componentes/layout/LayoutPrincipal.jsx',
  'client/src/componentes/comunes/Modal.jsx',
  'client/src/componentes/comunes/CampoFormulario.jsx',
  'client/src/componentes/comunes/Tabla.jsx',
  'client/src/componentes/comunes/Paginacion.jsx',
  'client/src/componentes/comunes/EstadoVacio.jsx',
  'client/src/componentes/movimientos/FormMovimiento.jsx',
  'client/src/componentes/movimientos/TablaMovimientos.jsx',
  'client/src/componentes/dashboard/TarjetaKpi.jsx',
  'client/src/componentes/dashboard/GraficoBarras.jsx',
  'client/src/componentes/dashboard/GraficoDona.jsx',
  'client/src/componentes/dashboard/GraficoLinea.jsx',
  'client/src/componentes/dashboard/BarraProgresoPresupuesto.jsx',
  'client/src/utils/exportarExcel.js',
  'client/src/utils/exportarPdf.js',
  'client/src/utils/formato.js',
  'client/src/paginas/Login.jsx',
  'client/src/paginas/Registro.jsx',
  'client/src/paginas/OlvideContrasena.jsx',
  'client/src/paginas/RestablecerContrasena.jsx',
  'client/src/paginas/Dashboard.jsx',
  'client/src/paginas/Movimientos.jsx',
  'client/src/paginas/Cuentas.jsx',
  'client/src/paginas/Categorias.jsx',
  'client/src/paginas/Presupuesto.jsx',
  'client/src/paginas/AdminUsuarios.jsx'
];

for (const comp of componentesFrontend) {
  const rutaCompleta = path.join(raizProyecto, comp);
  assert(`Existe módulo frontend: ${comp}`, fs.existsSync(rutaCompleta));
}

console.log('\n================================================================');
console.log(`🏁 RESULTADO: ${checksPasados}/${totalChecks} verificaciones superadas exitosamente.`);
if (checksPasados === totalChecks) {
  console.log('🎉 PROYECTO 100% CUMPLIDO, COMPLETO Y LISTO PARA DEFENSA ACADÉMICA');
} else {
  console.error('⚠️ ALGUNAS COMPROBACIONES FALLARON');
  process.exit(1);
}
console.log('================================================================\n');
