import mongoose from 'mongoose';

/**
 * Esquema de Mongoose para la entidad Cuenta / Medio de Pago (HU-03).
 * Soporta saldos inicial y actual en centavos enteros para eliminar imprecisiones contables.
 */
const esquemaCuenta = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuarioId es obligatorio'],
      index: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre de la cuenta es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede superar los 50 caracteres']
    },
    tipo: {
      type: String,
      enum: {
        values: ['efectivo', 'banco', 'tarjeta', 'billetera'],
        message: "El tipo de cuenta '{VALUE}' no es válido. Debe ser efectivo, banco, tarjeta o billetera."
      },
      required: [true, 'El tipo de cuenta es obligatorio']
    },
    saldoInicialEnCentavos: {
      type: Number,
      required: [true, 'El saldo inicial en centavos es obligatorio'],
      validate: {
        validator: Number.isInteger,
        message: 'El saldo inicial debe ser un número entero en centavos'
      },
      default: 0
    },
    saldoActualEnCentavos: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'El saldo actual debe ser un número entero en centavos'
      },
      default: 0
    },
    color: {
      type: String,
      default: '#3B82F6'
    },
    activo: {
      type: Boolean,
      default: true
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

// Índice compuesto para listado optimizado de cuentas activas por inquilino
esquemaCuenta.index({ usuarioId: 1, activo: 1 });

export const ModeloCuenta = mongoose.model('Cuenta', esquemaCuenta, 'cuentas');
export default ModeloCuenta;
