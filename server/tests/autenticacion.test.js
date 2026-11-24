import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { esContrasenaRobusta, esCorreoValido } from '../src/validadores/reglasValidacion.js';

describe('Validaciones de Autenticación y Criptografía (HU-01 y HU-02)', () => {
  test('Rechaza contraseña corta ("12345")', () => {
    assert.equal(esContrasenaRobusta('12345'), false);
  });

  test('Rechaza contraseña sin números ("sololetras")', () => {
    assert.equal(esContrasenaRobusta('sololetras'), false);
  });

  test('Acepta contraseña robusta ("Finanzas2026!")', () => {
    assert.equal(esContrasenaRobusta('Finanzas2026!'), true);
  });

  test('Valida formato de correo electrónico con Validator.js', () => {
    assert.equal(esCorreoValido('usuario@finanzas.pe'), true);
    assert.equal(esCorreoValido('correo_invalido'), false);
  });

  test('Genera y verifica hash bcryptjs con 10 rondas de salt', () => {
    const clave = 'Finanzas2026!';
    const salt = bcryptjs.genSaltSync(10);
    const hash = bcryptjs.hashSync(clave, salt);
    assert.equal(bcryptjs.compareSync(clave, hash), true);
  });

  test('Genera token aleatorio de 64 caracteres hexadecimales y hash SHA-256 unívoco', () => {
    const tokenPlano = crypto.randomBytes(32).toString('hex');
    const tokenHashA = crypto.createHash('sha256').update(tokenPlano).digest('hex');
    const tokenHashB = crypto.createHash('sha256').update(tokenPlano).digest('hex');
    assert.equal(tokenPlano.length, 64);
    assert.equal(tokenHashA, tokenHashB);
  });
});
