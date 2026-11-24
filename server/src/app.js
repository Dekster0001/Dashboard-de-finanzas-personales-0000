import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport';
import { entorno } from './config/entorno.js';
import { configurarPassport } from './config/passport.js';
import { ErrorApp } from './utils/ErrorApp.js';
import { manejadorErrores } from './middlewares/manejadorErrores.js';
import authRutas from './rutas/authRutas.js';
import adminRutas from './rutas/adminRutas.js';
import cuentaRutas from './rutas/cuentaRutas.js';
import categoriaRutas from './rutas/categoriaRutas.js';
import movimientoRutas from './rutas/movimientoRutas.js';
import presupuestoRutas from './rutas/presupuestoRutas.js';
import dashboardRutas from './rutas/dashboardRutas.js';

// Inicializar Express
const app = express();

// =============================================================================
// MIDDLEWARES DE SEGURIDAD Y UTILIDAD
// =============================================================================

app.use(helmet());

app.use(
  cors({
    origin: entorno.clienteUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

if (entorno.nodoEntorno === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Configurar e inicializar Passport para JWT
configurarPassport();
app.use(passport.initialize());

// =============================================================================
// RUTAS PRINCIPALES DEL SISTEMA
// =============================================================================

// Comprobación de salud del servidor
app.get('/api/salud', (req, res) => {
  const estados = { 0: 'desconectado', 1: 'conectado', 2: 'conectando', 3: 'desconectando' };
  const estadoBD = estados[mongoose.connection.readyState] || 'desconocido';

  return res.status(200).json({
    estado: 'exito',
    mensaje: 'Servidor del Dashboard de Finanzas Personales operativo',
    entorno: entorno.nodoEntorno,
    baseDatos: {
      estado: estadoBD,
      host: mongoose.connection.host || 'sin conexion activa'
    },
    fechaHora: new Date().toISOString()
  });
});

// Rutas de autenticación
app.use('/api/auth', authRutas);

// Rutas de administración (RBAC - HU-10)
app.use('/api/admin', adminRutas);

// Rutas de Cuentas, Categorías y Movimientos (HU-03, HU-04, HU-05, HU-06)
app.use('/api/cuentas', cuentaRutas);
app.use('/api/categorias', categoriaRutas);
app.use('/api/movimientos', movimientoRutas);

// Rutas de Presupuestos y Dashboard (HU-07, HU-08)
app.use('/api/presupuestos', presupuestoRutas);
app.use('/api/dashboard', dashboardRutas);

// =============================================================================
// GESTIÓN DE RUTAS NO ENCONTRADAS (404) Y MANEJADOR DE ERRORES
// =============================================================================

app.all('*', (req, res, next) => {
  next(new ErrorApp(`No se encontró la ruta '${req.originalUrl}' en este servidor`, 404));
});

app.use(manejadorErrores);

export default app;
