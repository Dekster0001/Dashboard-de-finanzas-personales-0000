import mongoose from 'mongoose';

/**
 * Esquema de Mongoose para la colección de Presupuestos Mensuales.
 * Cumple con el principio de un solo presupuesto global mensual por usuario.
 * Todos los límites se registran en centavos enteros para evitar imprecisiones de redondeo.
 */
const esquemaPresupuesto = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El ID de usuario es obligatorio.'],
      index: true
    },
    mes: {
      type: String,
      required: [true, 'El mes es obligatorio en formato AAAA-MM.'],
      trim: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'El formato del mes debe ser AAAA-MM (ej. 2026-11).']
    },
    montoLimiteEnCentavos: {
      type: Number,
      required: [true, 'El monto límite en centavos es obligatorio.'],
      validate: {
        validator: function (v) {
          return Number.isInteger(v) && v > 0;
        },
        message: 'El monto límite debe ser un número entero positivo en centavos mayor a 0.'
      }
    }
  },
  {
    timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' },
    versionKey: false
  }
);

// Índice único compuesto: garantiza un único presupuesto por mes para cada usuario (KISS)
esquemaPresupuesto.index({ usuarioId: 1, mes: 1 }, { unique: true });

export const ModeloPresupuesto = mongoose.model('Presupuesto', esquemaPresupuesto);
export default ModeloPresupuesto;
