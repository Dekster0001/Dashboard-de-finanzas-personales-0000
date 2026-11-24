import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { puede, ACCIONES } from '../src/politicas/permisos.js';
import { RepositorioBase } from '../src/repositorios/RepositorioBase.js';
import { autorizar } from '../src/middlewares/autorizar.js';

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

describe('Seguridad RBAC y Aislamiento Multiinquilino IDOR (HU-10)', () => {
  test('E1: ADMIN tiene permiso para listar usuarios', () => {
    assert.equal(puede(adminMock, ACCIONES.LISTAR_USUARIOS), true);
  });

  test('E1: ADMIN tiene permiso para cambiar el rol de otro usuario', () => {
    assert.equal(puede(adminMock, ACCIONES.CAMBIAR_ROL_USUARIO, usuarioMock1), true);
  });

  test('E1: ADMIN tiene permiso para activar/desactivar la cuenta de otro usuario', () => {
    assert.equal(puede(adminMock, ACCIONES.CAMBIAR_ESTADO_USUARIO, usuarioMock1), true);
  });

  test('E2: USUARIO regular NO tiene permiso para listar usuarios', () => {
    assert.equal(puede(usuarioMock1, ACCIONES.LISTAR_USUARIOS), false);
  });

  test('E2: USUARIO regular NO tiene permiso para cambiar roles', () => {
    assert.equal(puede(usuarioMock1, ACCIONES.CAMBIAR_ROL_USUARIO, usuarioMock2), false);
  });

  test('E2: USUARIO regular SÍ puede gestionar sus propias finanzas', () => {
    assert.equal(puede(usuarioMock1, ACCIONES.GESTIONAR_FINANZAS_PROPIAS), true);
  });

  test('E3: Middleware autorizar intercepta a USUARIO con HTTP 403', () => {
    const middlewareAdmin = autorizar('ADMIN');
    let errorCapturado = null;
    middlewareAdmin({ usuario: usuarioMock1 }, {}, (err) => {
      errorCapturado = err;
    });
    assert.equal(errorCapturado?.codigoEstado, 403);
  });

  test('E3: Middleware autorizar responde mensaje formal esperado', () => {
    const middlewareAdmin = autorizar('ADMIN');
    let errorCapturado = null;
    middlewareAdmin({ usuario: usuarioMock1 }, {}, (err) => {
      errorCapturado = err;
    });
    assert.equal(errorCapturado?.mensaje, 'No tienes permisos para acceder a este recurso.');
  });

  test('E3: Middleware autorizar permite el paso a rol ADMIN', () => {
    const middlewareAdmin = autorizar('ADMIN');
    let pasoSinError = false;
    middlewareAdmin({ usuario: adminMock }, {}, (err) => {
      if (!err) pasoSinError = true;
    });
    assert.equal(pasoSinError, true);
  });

  test('E4: ADMIN no puede auto-revocar su propio rol', () => {
    assert.equal(puede(adminMock, ACCIONES.CAMBIAR_ROL_USUARIO, adminMock), false);
  });

  test('E4: ADMIN no puede auto-desactivar su propia cuenta', () => {
    assert.equal(puede(adminMock, ACCIONES.CAMBIAR_ESTADO_USUARIO, adminMock), false);
  });

  const modeloSimulado = {
    findOne: async (query) => {
      if (query._id === 'mov-999' && query.usuarioId === usuarioMock2._id) {
        return { _id: 'mov-999', usuarioId: usuarioMock2._id, monto: 5000 };
      }
      return null;
    }
  };
  const repoSimulado = new RepositorioBase(modeloSimulado);

  test('E4 (IDOR): RepositorioBase retorna null al consultar recurso ajeno', async () => {
    const res = await repoSimulado.buscarPorId(usuarioMock1._id, 'mov-999');
    assert.equal(res, null);
  });

  test('E4 (Propietario): RepositorioBase retorna el recurso si usuarioId coincide', async () => {
    const res = await repoSimulado.buscarPorId(usuarioMock2._id, 'mov-999');
    assert.equal(res?._id, 'mov-999');
  });
});
