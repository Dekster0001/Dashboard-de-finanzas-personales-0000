import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { entorno } from '../src/config/entorno.js';
import { conectarBaseDatos } from '../src/config/db.js';

import { ModeloUsuario } from '../src/modelos/Usuario.js';
import { ModeloCuenta } from '../src/modelos/Cuenta.js';
import { ModeloCategoria } from '../src/modelos/Categoria.js';
import { ModeloMovimiento } from '../src/modelos/Movimiento.js';
import { ModeloPresupuesto } from '../src/modelos/Presupuesto.js';

/**
 * Script Idempotente de Población de Datos Iniciales (Seed).
 * Inserta usuarios de prueba, cuentas, categorías, presupuestos y más de 60 movimientos.
 * Si se ejecuta varias veces, refresca limpiamente los datos de demostración.
 */
async function ejecutarSeed() {
  console.log('================================================================');
  console.log('🌱 INICIANDO POBLACIÓN DE DATOS INICIALES (SEED IDEMPOTENTE)');
  console.log('================================================================');

  await conectarBaseDatos();

  try {
    const correosPrueba = ['admin@demo.com', 'usuario1@demo.com', 'usuario2@demo.com'];

    // 1. Limpieza idempotente: buscar IDs de usuarios existentes de prueba
    const usuariosExistentes = await ModeloUsuario.find({ correo: { $in: correosPrueba } });
    const idsExistentes = usuariosExistentes.map((u) => u._id);

    if (idsExistentes.length > 0) {
      console.log(`[Seed] Limpiando datos previos de ${idsExistentes.length} usuario(s) de prueba...`);
      await Promise.all([
        ModeloMovimiento.deleteMany({ usuarioId: { $in: idsExistentes } }),
        ModeloPresupuesto.deleteMany({ usuarioId: { $in: idsExistentes } }),
        ModeloCuenta.deleteMany({ usuarioId: { $in: idsExistentes } }),
        ModeloCategoria.deleteMany({ usuarioId: { $in: idsExistentes } }),
        ModeloUsuario.deleteMany({ _id: { $in: idsExistentes } })
      ]);
    }

    // 2. Creación de Usuarios de Prueba
    console.log('[Seed] Creando usuarios del sistema (1 ADMIN, 2 USUARIO)...');
    const hashAdmin = await bcrypt.hash('Admin123!', 10);
    const hashUsuario = await bcrypt.hash('Usuario123!', 10);

    const [admin, usuario1, usuario2] = await ModeloUsuario.create([
      {
        uuid: uuidv4(),
        nombre: 'Administrador General',
        correo: 'admin@demo.com',
        contrasenaHash: hashAdmin,
        rol: 'ADMIN',
        activo: true
      },
      {
        uuid: uuidv4(),
        nombre: 'Carlos Finanzas',
        correo: 'usuario1@demo.com',
        contrasenaHash: hashUsuario,
        rol: 'USUARIO',
        activo: true
      },
      {
        uuid: uuidv4(),
        nombre: 'María Inversora',
        correo: 'usuario2@demo.com',
        contrasenaHash: hashUsuario,
        rol: 'USUARIO',
        activo: true
      }
    ]);

    // 3. Creación de Cuentas para Usuario 1
    console.log('[Seed] Creando cuentas bancarias y billeteras en Soles (S/.)...');
    const cuentasU1 = await ModeloCuenta.create([
      {
        usuarioId: usuario1._id,
        nombre: 'BCP - Cuenta Sueldo',
        tipo: 'banco',
        saldoInicialEnCentavos: 350000, // S/. 3,500.00
        saldoActualEnCentavos: 350000,
        color: '#2563eb',
        activo: true
      },
      {
        usuarioId: usuario1._id,
        nombre: 'Billetera Digital Yape / Plin',
        tipo: 'billetera',
        saldoInicialEnCentavos: 45000, // S/. 450.00
        saldoActualEnCentavos: 45000,
        color: '#7c3aed',
        activo: true
      },
      {
        usuarioId: usuario1._id,
        nombre: 'Efectivo en Billetera',
        tipo: 'efectivo',
        saldoInicialEnCentavos: 80000, // S/. 800.00
        saldoActualEnCentavos: 80000,
        color: '#10b981',
        activo: true
      }
    ]);

    // Cuentas para Usuario 2 (Aislamiento)
    const cuentasU2 = await ModeloCuenta.create([
      {
        usuarioId: usuario2._id,
        nombre: 'BBVA - Ahorros Soles',
        tipo: 'banco',
        saldoInicialEnCentavos: 200000, // S/. 2,000.00
        saldoActualEnCentavos: 200000,
        color: '#0284c7',
        activo: true
      }
    ]);

    // 4. Creación de Categorías para Usuario 1
    console.log('[Seed] Creando categorías financieras...');
    const categoriasU1 = await ModeloCategoria.create([
      // Ingresos
      { usuarioId: usuario1._id, nombre: 'Sueldo / Nómina', tipo: 'INGRESO', color: '#10b981' },
      { usuarioId: usuario1._id, nombre: 'Proyectos Freelance', tipo: 'INGRESO', color: '#06b6d4' },
      { usuarioId: usuario1._id, nombre: 'Rendimientos e Inversiones', tipo: 'INGRESO', color: '#8b5cf6' },
      // Gastos
      { usuarioId: usuario1._id, nombre: 'Supermercado y Alimentación', tipo: 'GASTO', color: '#ef4444' },
      { usuarioId: usuario1._id, nombre: 'Transporte y Metropolitano', tipo: 'GASTO', color: '#f59e0b' },
      { usuarioId: usuario1._id, nombre: 'Vivienda y Alquiler', tipo: 'GASTO', color: '#6366f1' },
      { usuarioId: usuario1._id, nombre: 'Servicios Básicos (Luz/Agua/Net)', tipo: 'GASTO', color: '#3b82f6' },
      { usuarioId: usuario1._id, nombre: 'Salud y Farmacia', tipo: 'GASTO', color: '#14b8a6' },
      { usuarioId: usuario1._id, nombre: 'Restaurantes y Menú Diario', tipo: 'GASTO', color: '#f97316' },
      { usuarioId: usuario1._id, nombre: 'Entretenimiento y Ocio', tipo: 'GASTO', color: '#ec4899' },
      { usuarioId: usuario1._id, nombre: 'Educación y Universidad', tipo: 'GASTO', color: '#a855f7' }
    ]);

    // Categorías para Usuario 2
    const categoriasU2 = await ModeloCategoria.create([
      { usuarioId: usuario2._id, nombre: 'Sueldo', tipo: 'INGRESO', color: '#10b981' },
      { usuarioId: usuario2._id, nombre: 'Alimentación', tipo: 'GASTO', color: '#ef4444' }
    ]);

    // Mapas auxiliares para asociación
    const catSalarioU1 = categoriasU1.find((c) => c.nombre.includes('Sueldo'));
    const catFreelanceU1 = categoriasU1.find((c) => c.nombre.includes('Freelance'));
    const catComidaU1 = categoriasU1.find((c) => c.nombre.includes('Alimentación'));
    const catTransporteU1 = categoriasU1.find((c) => c.nombre.includes('Transporte'));
    const catViviendaU1 = categoriasU1.find((c) => c.nombre.includes('Vivienda'));
    const catServiciosU1 = categoriasU1.find((c) => c.nombre.includes('Servicios'));
    const catSaludU1 = categoriasU1.find((c) => c.nombre.includes('Salud'));
    const catOcioU1 = categoriasU1.find((c) => c.nombre.includes('Entretenimiento'));

    const ctaBancoU1 = cuentasU1[0];
    const ctaYapeU1 = cuentasU1[1];
    const ctaEfectivoU1 = cuentasU1[2];

    // 5. Creación de ~60 Movimientos Financieros distribuidos en los últimos 6 meses
    console.log('[Seed] Generando más de 60 transacciones distribuidas en 6 meses en Soles (S/.)...');
    const listaMovimientos = [];
    const meses = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

    let acumuladorBanco = ctaBancoU1.saldoInicialEnCentavos;
    let acumuladorYape = ctaYapeU1.saldoInicialEnCentavos;
    let acumuladorEfectivo = ctaEfectivoU1.saldoInicialEnCentavos;

    for (const mesStr of meses) {
      // 1. Ingreso fijo de Sueldo mensual
      listaMovimientos.push({
        usuarioId: usuario1._id,
        cuentaId: ctaBancoU1._id,
        categoriaId: catSalarioU1._id,
        tipo: 'INGRESO',
        montoEnCentavos: 280000, // S/. 2,800.00
        fecha: new Date(`${mesStr}-01T09:00:00Z`),
        descripcion: `Sueldo mensual depositado en BCP Sueldo - ${mesStr}`
      });
      acumuladorBanco += 280000;

      // 2. Ingreso Freelance mensual
      listaMovimientos.push({
        usuarioId: usuario1._id,
        cuentaId: ctaYapeU1._id,
        categoriaId: catFreelanceU1._id,
        tipo: 'INGRESO',
        montoEnCentavos: 45000, // S/. 450.00
        fecha: new Date(`${mesStr}-15T16:30:00Z`),
        descripcion: `Pago por consultoría de desarrollo web por Yape - ${mesStr}`
      });
      acumuladorYape += 45000;

      // 3. Gasto de Vivienda / Alquiler
      listaMovimientos.push({
        usuarioId: usuario1._id,
        cuentaId: ctaBancoU1._id,
        categoriaId: catViviendaU1._id,
        tipo: 'GASTO',
        montoEnCentavos: 75000, // S/. 750.00
        fecha: new Date(`${mesStr}-05T11:00:00Z`),
        descripcion: `Alquiler mensual de departamento`
      });
      acumuladorBanco -= 75000;

      // 4. Servicios básicos
      listaMovimientos.push({
        usuarioId: usuario1._id,
        cuentaId: ctaBancoU1._id,
        categoriaId: catServiciosU1._id,
        tipo: 'GASTO',
        montoEnCentavos: 18500, // S/. 185.00
        fecha: new Date(`${mesStr}-10T14:00:00Z`),
        descripcion: `Recibo de luz (Enel/Luz del Sur), agua (Sedapal) e internet`
      });
      acumuladorBanco -= 18500;

      // 5-8. Cuatro gastos de supermercado por mes
      const diasSuper = ['03', '11', '18', '25'];
      for (const dia of diasSuper) {
        listaMovimientos.push({
          usuarioId: usuario1._id,
          cuentaId: ctaBancoU1._id,
          categoriaId: catComidaU1._id,
          tipo: 'GASTO',
          montoEnCentavos: 12500, // S/. 125.00
          fecha: new Date(`${mesStr}-${dia}T18:00:00Z`),
          descripcion: `Compras de despensa en supermercado (Plaza Vea / Metro)`
        });
        acumuladorBanco -= 12500;
      }

      // 9-10. Gastos de transporte en Yape
      listaMovimientos.push({
        usuarioId: usuario1._id,
        cuentaId: ctaYapeU1._id,
        categoriaId: catTransporteU1._id,
        tipo: 'GASTO',
        montoEnCentavos: 4200, // S/. 42.00
        fecha: new Date(`${mesStr}-08T08:30:00Z`),
        descripcion: `Recarga de tarjeta Metropolitano y pasajes de combi`
      });
      acumuladorYape -= 4200;

      listaMovimientos.push({
        usuarioId: usuario1._id,
        cuentaId: ctaYapeU1._id,
        categoriaId: catTransporteU1._id,
        tipo: 'GASTO',
        montoEnCentavos: 3800, // S/. 38.00
        fecha: new Date(`${mesStr}-22T19:00:00Z`),
        descripcion: `Servicio de taxi por aplicativo (Yape)`
      });
      acumuladorYape -= 3800;

      // 11. Ocio y salidas en efectivo
      listaMovimientos.push({
        usuarioId: usuario1._id,
        cuentaId: ctaEfectivoU1._id,
        categoriaId: catOcioU1._id,
        tipo: 'GASTO',
        montoEnCentavos: 5500, // S/. 55.00
        fecha: new Date(`${mesStr}-14T21:00:00Z`),
        descripcion: `Cena de menú criollo y cine de fin de semana`
      });
      acumuladorEfectivo -= 5500;

      // 12. Salud o farmacia
      listaMovimientos.push({
        usuarioId: usuario1._id,
        cuentaId: ctaEfectivoU1._id,
        categoriaId: catSaludU1._id,
        tipo: 'GASTO',
        montoEnCentavos: 2800, // S/. 28.00
        fecha: new Date(`${mesStr}-20T10:15:00Z`),
        descripcion: `Medicinas y artículos de botica Inkafarma`
      });
      acumuladorEfectivo -= 2800;

      // 13. Reposición o ingreso menor en efectivo
      listaMovimientos.push({
        usuarioId: usuario1._id,
        cuentaId: ctaEfectivoU1._id,
        categoriaId: catFreelanceU1._id,
        tipo: 'INGRESO',
        montoEnCentavos: 8000, // S/. 80.00
        fecha: new Date(`${mesStr}-02T10:00:00Z`),
        descripcion: `Ingreso en efectivo por asesorías menores`
      });
      acumuladorEfectivo += 8000;
    }

    // Insertar movimientos de Usuario 1 (12 movimientos * 6 meses = 72 movimientos)
    await ModeloMovimiento.insertMany(listaMovimientos);

    // Actualizar saldos calculados exactos en las cuentas de Usuario 1
    await ModeloCuenta.findByIdAndUpdate(ctaBancoU1._id, { saldoActualEnCentavos: acumuladorBanco });
    await ModeloCuenta.findByIdAndUpdate(ctaYapeU1._id, { saldoActualEnCentavos: acumuladorYape });
    await ModeloCuenta.findByIdAndUpdate(ctaEfectivoU1._id, { saldoActualEnCentavos: acumuladorEfectivo });

    // Movimientos para Usuario 2 (Aislamiento Multiinquilino SaaS)
    await ModeloMovimiento.create([
      {
        usuarioId: usuario2._id,
        cuentaId: cuentasU2[0]._id,
        categoriaId: categoriasU2[0]._id,
        tipo: 'INGRESO',
        montoEnCentavos: 180000,
        fecha: new Date('2026-11-01T10:00:00Z'),
        descripcion: 'Salario Usuario 2'
      },
      {
        usuarioId: usuario2._id,
        cuentaId: cuentasU2[0]._id,
        categoriaId: categoriasU2[1]._id,
        tipo: 'GASTO',
        montoEnCentavos: 35000,
        fecha: new Date('2026-11-08T15:00:00Z'),
        descripcion: 'Supermercado Usuario 2'
      }
    ]);
    await ModeloCuenta.findByIdAndUpdate(cuentasU2[0]._id, { saldoActualEnCentavos: 200000 + 180000 - 35000 });

    // 6. Creación de Presupuestos Mensuales para Usuario 1
    console.log('[Seed] Creando presupuestos mensuales con límites en Soles (S/.)...');
    await ModeloPresupuesto.create([
      { usuarioId: usuario1._id, mes: '2026-06', montoLimiteEnCentavos: 200000 }, // S/. 2,000.00
      { usuarioId: usuario1._id, mes: '2026-07', montoLimiteEnCentavos: 220000 }, // S/. 2,200.00 (Fiestas Patrias)
      { usuarioId: usuario1._id, mes: '2026-08', montoLimiteEnCentavos: 220000 },
      { usuarioId: usuario1._id, mes: '2026-09', montoLimiteEnCentavos: 200000 },
      { usuarioId: usuario1._id, mes: '2026-10', montoLimiteEnCentavos: 200000 },
      { usuarioId: usuario1._id, mes: '2026-11', montoLimiteEnCentavos: 220000 }
    ]);

    console.log('================================================================');
    console.log('🎉 SEED COMPLETADO EXITOSAMENTE');
    console.log('================================================================');
    console.log('Total registros creados:');
    console.log(` • Usuarios:      3 (1 ADMIN, 2 USUARIOS)`);
    console.log(` • Cuentas:       4`);
    console.log(` • Categorías:    12`);
    console.log(` • Movimientos:   ${listaMovimientos.length + 2}`);
    console.log(` • Presupuestos:  6`);
    console.log('================================================================');
    console.log('🔑 CREDENCIALES DE ACCESO PARA DEMOSTRACIÓN ACADÉMICA:');
    console.log('----------------------------------------------------------------');
    console.log(' ROL          CORREO              CONTRASEÑA   DESCRIPCIÓN');
    console.log('----------------------------------------------------------------');
    console.log(' [ADMIN]      admin@demo.com      Admin123!    Panel de gestión RBAC');
    console.log(' [USUARIO]    usuario1@demo.com   Usuario123!  Dashboard completo (70+ movs)');
    console.log(' [USUARIO]    usuario2@demo.com   Usuario123!  Inquilino 2 (datos aislados)');
    console.log('================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar el seed de datos:', error);
    process.exit(1);
  }
}

ejecutarSeed();
