import app from './app.js';
import { conectarBaseDatos } from './config/db.js';
import { entorno } from './config/entorno.js';

process.on('uncaughtException', (error) => {
  console.error('[Servidor] Excepción no capturada crítica:', error);
  process.exit(1);
});

const iniciarServidor = async () => {
  await conectarBaseDatos();

  const servidor = app.listen(entorno.puerto, () => {
    console.log(`====================================================`);
    console.log(`🚀 Servidor ejecutándose en modo: [${entorno.nodoEntorno}]`);
    console.log(`📡 URL local: http://localhost:${entorno.puerto}`);
    console.log(`🩺 Ruta de comprobación de salud: http://localhost:${entorno.puerto}/api/salud`);
    console.log(`🌐 Cliente autorizado (CORS): ${entorno.clienteUrl}`);
    console.log(`====================================================`);
  });

  process.on('unhandledRejection', (error) => {
    console.error('[Servidor] Rechazo de promesa no controlado:', error);
    servidor.close(() => {
      process.exit(1);
    });
  });
};

iniciarServidor();
