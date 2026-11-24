import { puede, ACCIONES } from '../src/politicas/permisos.js';
import { RepositorioBase } from '../src/repositorios/RepositorioBase.js';
import { autorizar } from '../src/middlewares/autorizar.js';

console.log('================================================================');
console.log('🧪 VERIFICACIÓN AUTOMATIZADA DE ESCENARIOS GHERKIN PARA HU-10');
console.log('================================================================');

// Fixtures de prueba simulados
const adminMock = {
  _id: '673cf0000000000000000001',
  uuid: 'uuid-admin-01',
  nombre: 'Administrador Demo',
  correo: 'admin@demo.com',
  rol: 'ADMIN',
  activo: true
};

const usuarioMock1 = {
  _id: '673cf0000000000000000002',
  uuid: 'uuid-user-01',
  nombre: 'Carlos Usuario',
  correo: 'carlos@demo.com',
  rol: 'USUARIO',
  activo: true
};

const usuarioMock2 = {
  _id: '673cf0000000000000000003',
  uuid: 'uuid-user-02',
  nombre: 'María Usuario',
  correo: 'maria@demo.com',
  rol: 'USUARIO',
  activo: true
};

let pruebasPasadas = 0;
let totalPruebas = 0;

const assert = (descripcion, condicion) => {
  totalPruebas++;
  if (condicion) {
    console.log(`✅ [PASÓ] ${descripcion}`);
    pruebasPasadas++;
  } else {
    console.error(`❌ [FALLÓ] ${descripcion}`);
  }
};

// =============================================================================
// ESCENARIO 1: CAMINO FELIZ (Rol ADMIN tiene acceso completo a gestión)
// =============================================================================
console.log('\n--- ESCENARIO 1: Camino Feliz (ADMIN) ---');
assert(
  'ADMIN tiene permiso para listar usuarios del sistema',
  puede(adminMock, ACCIONES.LISTAR_USUARIOS) === true
);
assert(
  'ADMIN tiene permiso para cambiar el rol de otro usuario',
  puede(adminMock, ACCIONES.CAMBIAR_ROL_USUARIO, usuarioMock1) === true
);
assert(
  'ADMIN tiene permiso para activar o desactivar la cuenta de otro usuario',
  puede(adminMock, ACCIONES.CAMBIAR_ESTADO_USUARIO, usuarioMock1) === true
);

// =============================================================================
// ESCENARIO 2: FLUJO ALTERNATIVO (Rol USUARIO solo accede a recursos propios)
// =============================================================================
console.log('\n--- ESCENARIO 2: Flujo Alternativo (USUARIO regular) ---');
assert(
  'USUARIO regular NO tiene permiso para listar usuarios',
  puede(usuarioMock1, ACCIONES.LISTAR_USUARIOS) === false
);
assert(
  'USUARIO regular NO tiene permiso para cambiar roles',
  puede(usuarioMock1, ACCIONES.CAMBIAR_ROL_USUARIO, usuarioMock2) === false
);
assert(
  'USUARIO regular SÍ tiene permiso para gestionar sus finanzas propias',
  puede(usuarioMock1, ACCIONES.GESTIONAR_FINANZAS_PROPIAS) === true
);

// =============================================================================
// ESCENARIO 3: MANEJO DE ERRORES (Middleware autorizar rechaza con 403)
// =============================================================================
console.log('\n--- ESCENARIO 3: Manejo de Errores (403 Forbidden) ---');
const middlewareAdmin = autorizar('ADMIN');

// Simular petición de un usuario regular a ruta de admin
const reqUsuario = { usuario: usuarioMock1 };
const resMock = {};
let errorCapturado = null;
const nextMock = (err) => {
  errorCapturado = err;
};

middlewareAdmin(reqUsuario, resMock, nextMock);

assert(
  'Middleware autorizar intercepta a usuario regular con ErrorApp',
  errorCapturado !== null && errorCapturado.codigoEstado === 403
);
assert(
  'Mensaje exacto de autorización denegada: "No tienes permisos para acceder a este recurso."',
  errorCapturado && errorCapturado.mensaje === 'No tienes permisos para acceder a este recurso.'
);

// Simular petición de un administrador
let pasoNextAdmin = false;
middlewareAdmin({ usuario: adminMock }, resMock, (err) => {
  if (!err) pasoNextAdmin = true;
});
assert('Middleware autorizar permite el paso sin errores a rol ADMIN', pasoNextAdmin === true);

// =============================================================================
// ESCENARIO 4: CASOS DE BORDE (Aislamiento IDOR en RepositorioBase y regla auto-rol)
// =============================================================================
console.log('\n--- ESCENARIO 4: Casos de Borde (IDOR y Auto-Rol) ---');

// 4.1 Regla especial: Un administrador NO puede auto-quitarse su propio rol
assert(
  'ADMIN no puede auto-revocar su propio rol de administrador',
  puede(adminMock, ACCIONES.CAMBIAR_ROL_USUARIO, adminMock) === false
);
assert(
  'ADMIN no puede auto-desactivar su propia cuenta de acceso',
  puede(adminMock, ACCIONES.CAMBIAR_ESTADO_USUARIO, adminMock) === false
);

// 4.2 Aislamiento en RepositorioBase ante recursos de otros usuarios (IDOR)
const modeloSimulado = {
  findOne: async (query) => {
    // Simular que el recurso con ID 999 pertenece únicamente a usuarioMock2
    if (query._id === 'mov-999' && query.usuarioId === usuarioMock2._id) {
      return { _id: 'mov-999', usuarioId: usuarioMock2._id, monto: 5000 };
    }
    return null; // Si el usuarioId no coincide, retorna null
  }
};

const repoSimulado = new RepositorioBase(modeloSimulado);

// Intentar consultar el recurso del usuario 2 usando las credenciales del usuario 1
const resultadoIdor = await repoSimulado.buscarPorId(usuarioMock1._id, 'mov-999');
assert(
  'RepositorioBase retorna null ante intento de consultar recurso ajeno (evita IDOR derivando en 404)',
  resultadoIdor === null
);

// Consultar el mismo recurso con el usuario dueño real
const resultadoDueno = await repoSimulado.buscarPorId(usuarioMock2._id, 'mov-999');
assert(
  'RepositorioBase retorna el recurso correctamente si el usuarioId coincide con el token',
  resultadoDueno !== null && resultadoDueno._id === 'mov-999'
);

console.log('\n================================================================');
console.log(`🏁 RESULTADO: ${pruebasPasadas}/${totalPruebas} pruebas superadas.`);
if (pruebasPasadas === totalPruebas) {
  console.log('🎉 TODOS LOS ESCENARIOS GHERKIN DE HU-10 SE CUMPLEN ESTRICTAMENTE');
} else {
  console.error('⚠️ ALGUNAS PRUEBAS FALLARON');
}
console.log('================================================================');
