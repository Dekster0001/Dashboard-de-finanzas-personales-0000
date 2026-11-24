import express from 'express';
import { autenticar } from '../middlewares/autenticar.js';
import { dashboardControlador } from '../controladores/dashboardControlador.js';

const enrutador = express.Router();

// Todas las rutas analíticas del dashboard requieren autenticación
enrutador.use(autenticar);

// GET /api/dashboard/resumen?mes=AAAA-MM
enrutador.get('/resumen', (req, res, next) =>
  dashboardControlador.obtenerResumen(req, res, next)
);

// GET /api/dashboard/por-categoria?mes=AAAA-MM
enrutador.get('/por-categoria', (req, res, next) =>
  dashboardControlador.obtenerPorCategoria(req, res, next)
);

// GET /api/dashboard/tendencia-mensual?mes=AAAA-MM
enrutador.get('/tendencia-mensual', (req, res, next) =>
  dashboardControlador.obtenerTendenciaMensual(req, res, next)
);

export default enrutador;
