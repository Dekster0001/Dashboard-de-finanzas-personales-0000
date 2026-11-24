import mongoose from 'mongoose';
import { entorno } from './entorno.js';

/**
 * Establece la conexión a la base de datos MongoDB Atlas a través de Mongoose.
 * Registra eventos del ciclo de vida de la conexión para facilitar la depuración y defensa en clase.
 */
export const conectarBaseDatos = async () => {
  try {
    const conexion = await mongoose.connect(entorno.mongoUri);
    const esAtlas = conexion.connection.host.includes('mongodb.net');
    const tipo = esAtlas ? 'MongoDB Atlas (Nube)' : 'MongoDB Local';
    console.log(`[Base de Datos] Conectado exitosamente a ${tipo}: ${conexion.connection.host}/${conexion.connection.name}`);
    return conexion;
  } catch (error) {
    console.error(`[Base de Datos] Error al conectar con MongoDB: ${error.message}`);
    if (entorno.nodoEntorno === 'production') {
      process.exit(1);
    }
  }
};

mongoose.connection.on('connected', () => {
  console.log('[Base de Datos] Conexión establecida con el servidor de MongoDB.');
});

mongoose.connection.on('error', (error) => {
  console.error(`[Base de Datos] Error en la conexión activa: ${error.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[Base de Datos] Conexión con MongoDB perdida o desconectada.');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[Base de Datos] Conexión a MongoDB cerrada por terminación del servidor.');
  process.exit(0);
});

export default conectarBaseDatos;
