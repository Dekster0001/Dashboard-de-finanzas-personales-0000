import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno buscando en server/.env y en la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

/**
 * Normaliza la URI de MongoDB para garantizar que apunte a la base de datos finanzas_personales
 * en caso de que solo termine en '/' o no especifique base de datos.
 */
function normalizarMongoUri(uri) {
  if (!uri) return 'mongodb://localhost:27017/finanzas';
  let normalizada = uri.trim();
  if (normalizada.endsWith('/')) {
    normalizada = `${normalizada}finanzas_personales?retryWrites=true&w=majority`;
  }
  return normalizada;
}

const nodoEntorno = process.env.NODE_ENV || 'development';
const jwtSecreto = process.env.JWT_SECRETO || (nodoEntorno === 'production' ? '' : 'secreto_desarrollo_temporal_2026');

if (nodoEntorno === 'production' && !jwtSecreto) {
  throw new Error('Configuración crítica faltante: la variable JWT_SECRETO es obligatoria en producción.');
}

/**
 * Configuración centralizada de variables de entorno del servidor.
 * Proporciona valores por defecto seguros en entorno de desarrollo.
 */
export const entorno = {
  puerto: process.env.PUERTO || 5000,
  nodoEntorno,
  mongoUri: normalizarMongoUri(process.env.MONGODB_URI),
  clienteUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecreto,
  jwtExpira: process.env.JWT_EXPIRA || '1h',
  correoHost: process.env.CORREO_HOST || 'smtp.gmail.com',
  correoPuerto: Number(process.env.CORREO_PUERTO) || 587,
  correoUsuario: process.env.CORREO_USUARIO || '',
  correoClave: process.env.CORREO_CLAVE || ''
};

export default entorno;
