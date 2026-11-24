import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const raizServer = path.resolve(__dirname, '..');
const raizProyecto = path.resolve(raizServer, '..');

describe('Auditoría Estructural del Sistema (Specs, Capas, Rutas y Frontend)', () => {
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
    test(`Existe archivo obligatorio: ${archivo}`, () => {
      assert.equal(fs.existsSync(path.join(raizProyecto, archivo)), true);
    });
  }

  const contenidoRepoBase = fs.readFileSync(
    path.join(raizServer, 'src', 'repositorios', 'RepositorioBase.js'),
    'utf-8'
  );

  test('RepositorioBase valida y fuerza usuarioId en buscar()', () => {
    assert.equal(
      contenidoRepoBase.includes('buscar(usuarioId') &&
        contenidoRepoBase.includes('this._validarUsuarioId(usuarioId)'),
      true
    );
  });

  test('RepositorioBase valida y fuerza usuarioId en buscarPorId()', () => {
    assert.equal(
      contenidoRepoBase.includes('buscarPorId(usuarioId') &&
        contenidoRepoBase.includes('_id: id, usuarioId'),
      true
    );
  });

  test('RepositorioBase valida y fuerza usuarioId en crear()', () => {
    assert.equal(
      contenidoRepoBase.includes('crear(usuarioId') &&
        contenidoRepoBase.includes('...datos, usuarioId'),
      true
    );
  });

  test('RepositorioBase valida y fuerza usuarioId en actualizar()', () => {
    assert.equal(
      contenidoRepoBase.includes('actualizar(usuarioId') &&
        contenidoRepoBase.includes('_id: id, usuarioId'),
      true
    );
  });

  test('RepositorioBase valida y fuerza usuarioId en eliminar()', () => {
    assert.equal(
      contenidoRepoBase.includes('eliminar(usuarioId') &&
        contenidoRepoBase.includes('_id: id, usuarioId'),
      true
    );
  });

  const contenidoDashboardRepo = fs.readFileSync(
    path.join(raizServer, 'src', 'repositorios', 'dashboardRepositorio.js'),
    'utf-8'
  );

  test('dashboardRepositorio filtra por usuarioId en obtenerTotalesPorTipo', () => {
    assert.equal(contenidoDashboardRepo.includes('usuarioId: idObj'), true);
  });

  test('dashboardRepositorio filtra por usuarioId en sumarGastosPorRango', () => {
    assert.equal(contenidoDashboardRepo.includes('usuarioId: idObj,'), true);
  });

  test('dashboardRepositorio filtra por usuarioId en obtenerPatrimonioTotal', () => {
    assert.equal(
      contenidoDashboardRepo.includes('usuarioId: idObj,') &&
        contenidoDashboardRepo.includes('activo: true'),
      true
    );
  });

  test('dashboardRepositorio filtra por usuarioId en obtenerGastosPorCategoria', () => {
    assert.equal(contenidoDashboardRepo.includes('usuarioId: idObj,'), true);
  });

  test('dashboardRepositorio filtra por usuarioId en obtenerAgrupacion6Meses', () => {
    assert.equal(contenidoDashboardRepo.includes('usuarioId: idObj,'), true);
  });

  const contenidoApp = fs.readFileSync(path.join(raizServer, 'src', 'app.js'), 'utf-8');
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
    test(`Enrutador Express montado: ${ruta}`, () => {
      assert.equal(contenidoApp.includes(ruta), true);
    });
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(raizProyecto, 'package.json'), 'utf-8'));

  test('Script "instalar" configurado en package.json raíz', () => {
    assert.equal(Boolean(pkg.scripts?.instalar), true);
  });

  test('Script "seed" configurado en package.json raíz', () => {
    assert.equal(Boolean(pkg.scripts?.seed), true);
  });

  test('Script "dev" configurado con concurrently en package.json raíz', () => {
    assert.equal(Boolean(pkg.scripts?.dev?.includes('concurrently')), true);
  });

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
    test(`Existe módulo frontend: ${comp}`, () => {
      assert.equal(fs.existsSync(path.join(raizProyecto, comp)), true);
    });
  }
});
