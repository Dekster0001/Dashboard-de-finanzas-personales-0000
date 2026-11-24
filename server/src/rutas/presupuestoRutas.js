import express from 'express';
import { autenticar } from '../middlewares/autenticar.js';
import { presupuestoControlador } from '../controladores/presupuestoControlador.js';
import {
  validarParametroMes,
  validarCuerpoPresupuesto
} from '../validadores/presupuestoValidador.js';

const enrutador = express.Router();

// Todas las rutas de presupuestos requieren usuario autenticado
enrutador.use(autenticar);

// GET /api/presupuestos/:mes - Consulta límite, gastado, disponible, porcentaje y estado (OK, ALERTA, EXCEDIDO)
enrutador.get('/:mes', validarParametroMes, (req, res, next) =>
  presupuestoControlador.obtenerPresupuesto(req, res, next)
);

// PUT /api/presupuestos/:mes - Define o actualiza el monto límite mensual
enrutador.put('/:mes', validarParametroMes, validarCuerpoPresupuesto, (req, res, next) =>
  presupuestoControlador.definirPresupuesto(req, res, next)
);

// Compatibilidad: POST /api/presupuestos/:mes o POST /api/presupuestos
enrutador.post('/:mes', validarParametroMes, validarCuerpoPresupuesto, (req, res, next) =>
  presupuestoControlador.definirPresupuesto(req, res, next)
);

const asignarMesDesdeBody = (req, res, next) => {
  if (req.body.mes) {
    req.params.mes = req.body.mes;
  }
  next();
};

enrutador.post(
  '/',
  asignarMesDesdeBody,
  validarParametroMes,
  validarCuerpoPresupuesto,
  (req, res, next) => presupuestoControlador.definirPresupuesto(req, res, next)
);

export default enrutador;
