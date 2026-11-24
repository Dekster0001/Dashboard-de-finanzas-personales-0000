import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Esquema de Mongoose para la entidad Usuario.
 * Gestiona credenciales, roles (ADMIN | USUARIO), recuperación de clave y control de intentos.
 */
const esquemaUsuario = new mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      default: () => uuidv4(),
      index: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre completo es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede superar los 100 caracteres']
    },
    correo: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    contrasenaHash: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false
    },
    rol: {
      type: String,
      enum: {
        values: ['ADMIN', 'USUARIO'],
        message: 'El rol {VALUE} no es válido. Debe ser ADMIN o USUARIO'
      },
      default: 'USUARIO'
    },
    tokenRecuperacionHash: {
      type: String,
      select: false
    },
    tokenRecuperacionExpira: {
      type: Date,
      select: false
    },
    activo: {
      type: Boolean,
      default: true
    },
    intentosFallidosLogin: {
      type: Number,
      default: 0
    },
    bloqueadoHasta: {
      type: Date,
      default: null
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

esquemaUsuario.methods.compararContrasena = async function (contrasenaPlana) {
  return await bcryptjs.compare(contrasenaPlana, this.contrasenaHash);
};

esquemaUsuario.methods.generarTokenRecuperacion = function () {
  const tokenPlano = crypto.randomBytes(32).toString('hex');
  this.tokenRecuperacionHash = crypto
    .createHash('sha256')
    .update(tokenPlano)
    .digest('hex');
  this.tokenRecuperacionExpira = new Date(Date.now() + 30 * 60 * 1000);
  return tokenPlano;
};

esquemaUsuario.methods.estaBloqueado = function () {
  if (!this.bloqueadoHasta) return false;
  return this.bloqueadoHasta > new Date();
};

esquemaUsuario.methods.registrarIntentoFallido = async function () {
  this.intentosFallidosLogin += 1;
  const LIMITE_INTENTOS = 5;
  const MINUTOS_BLOQUEO = 15;

  if (this.intentosFallidosLogin >= LIMITE_INTENTOS) {
    this.bloqueadoHasta = new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000);
  }
  await this.save();
};

esquemaUsuario.methods.restablecerIntentos = async function () {
  this.intentosFallidosLogin = 0;
  this.bloqueadoHasta = null;
  await this.save();
};

export const ModeloUsuario = mongoose.model('Usuario', esquemaUsuario, 'usuarios');
export default ModeloUsuario;
