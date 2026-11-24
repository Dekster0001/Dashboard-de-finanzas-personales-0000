import mongoose from 'mongoose';

/**
 * Esquema de Mongoose para la entidad Movimiento Financiero (HU-05 y HU-06).
 * Registra ingresos y gastos con precisión exacta en centavos enteros.
 */
const esquemaMovimiento = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuarioId es obligatorio'],
      index: true
    },
    cuentaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cuenta',
      required: [true, 'La cuenta bancaria o medio de pago es obligatorio'],
      index: true
    },
    categoriaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoría del movimiento es obligatoria'],
      index: true
    },
    tipo: {
      type: String,
      enum: {
        values: ['INGRESO', 'GASTO'],
        message: "El tipo de movimiento debe ser 'INGRESO' o 'GASTO'"
      },
      required: [true, 'El tipo de movimiento es obligatorio']
    },
    montoEnCentavos: {
      type: Number,
      required: [true, 'El monto en centavos es obligatorio'],
      validate: {
        validator: function (v) {
          return Number.isInteger(v) && v > 0;
        },
        message: 'El monto debe ser un número entero en centavos mayor a 0'
      }
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha del movimiento es obligatoria'],
      default: Date.now
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [250, 'La descripción no puede superar los 250 caracteres'],
      default: ''
    }
  },
  {
    timestamps: {
      createdAt: 'creadoEn',
      updatedAt: 'actualizadoEn'
    },
    versionKey: false
  }
);

// Índices compuestos para optimizar consultas de historial y dashboard
esquemaMovimiento.index({ usuarioId: 1, fecha: -1 });
esquemaMovimiento.index({ usuarioId: 1, cuentaId: 1 });
esquemaMovimiento.index({ usuarioId: 1, categoriaId: 1 });

export const ModeloMovimiento = mongoose.model('Movimiento', esquemaMovimiento, 'movimientos');
export default ModeloMovimiento;
