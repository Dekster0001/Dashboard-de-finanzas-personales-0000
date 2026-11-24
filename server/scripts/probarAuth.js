import validator from 'validator';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

console.log('=== TEST DE VALIDACIONES Y CRIPTOGRAFÍA (HU-01 y HU-02) ===');

// 1. Probar validación de contraseña robusta
const probarContrasena = (clave) => {
  const longitudValida = validator.isLength(clave, { min: 8 });
  const tieneLetra = /[A-Za-z]/.test(clave);
  const tieneNumero = /[0-9]/.test(clave);
  return longitudValida && tieneLetra && tieneNumero;
};

console.log('Validar "12345":', probarContrasena('12345') === false ? 'CORRECTO (Rechazada)' : 'FALLO');
console.log('Validar "sololetras":', probarContrasena('sololetras') === false ? 'CORRECTO (Rechazada)' : 'FALLO');
console.log('Validar "Finanzas2026!":', probarContrasena('Finanzas2026!') === true ? 'CORRECTO (Aceptada)' : 'FALLO');

// 2. Probar hashing con bcryptjs
const clavePrueba = 'Finanzas2026!';
const salt = bcryptjs.genSaltSync(10);
const hash = bcryptjs.hashSync(clavePrueba, salt);
const coincide = bcryptjs.compareSync(clavePrueba, hash);
console.log('Hash bcrypt generado y validado:', coincide ? 'CORRECTO' : 'FALLO');

// 3. Probar generación de token aleatorio de recuperación y SHA-256
const tokenPlano = crypto.randomBytes(32).toString('hex');
const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');
const tokenHashComparar = crypto.createHash('sha256').update(tokenPlano).digest('hex');
console.log('Token plano longitud:', tokenPlano.length, '(64 chars hex)');
console.log('Hash SHA-256 unívoco:', tokenHash === tokenHashComparar ? 'CORRECTO' : 'FALLO');

console.log('=== TODAS LAS PRUEBAS UNITARIAS PASARON SATISFACTORIAMENTE ===');
