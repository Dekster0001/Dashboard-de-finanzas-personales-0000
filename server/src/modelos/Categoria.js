import mongoose from 'mongoose';

/**
 * Esquema de Mongoose para la entidad Categoría (HU-04).
 * Clasifica los movimientos en INGRESO o GASTO con color identificador para Chart.js.
 */
const esquemaCategoria = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuarioId es obligatorio'],
      index: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede superar los 50 caracteres']
    },
    tipo: {
      type: String,
      enum: {
        values: ['INGRESO', 'GASTO'],
        message: "El tipo de categoría debe ser 'INGRESO' o 'GASTO'"
      },
      required: [true, 'El tipo de categoría es obligatorio']
    },
    color: {
      type: String,
      default: '#10B981',
      trim: true
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

// Índice compuesto de unicidad por inquilino: (usuarioId, nombre, tipo)
esquemaCategoria.index({ usuarioId: 1, nombre: 1, tipo: 1 }, { unique: true });

export const ModeloCategoria = mongoose.model('Categoria', esquemaCategoria, 'categorias');
export default ModeloCategoria;
