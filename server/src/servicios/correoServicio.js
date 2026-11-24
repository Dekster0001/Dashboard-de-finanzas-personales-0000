import nodemailer from 'nodemailer';
import { entorno } from '../config/entorno.js';

class CorreoServicio {
  constructor() {
    this.transporte = this.inicializarTransporte();
  }

  inicializarTransporte() {
    if (!entorno.correoUsuario || !entorno.correoClave) {
      console.warn('[Correo] Credenciales SMTP no configuradas. Los correos se mostrarán en la consola.');
      return null;
    }

    return nodemailer.createTransport({
      host: entorno.correoHost,
      port: entorno.correoPuerto,
      secure: entorno.correoPuerto === 465,
      auth: {
        user: entorno.correoUsuario,
        pass: entorno.correoClave
      }
    });
  }

  async enviarCorreoRecuperacion(destinatario, nombre, tokenPlano) {
    const enlaceRecuperacion = `${entorno.clienteUrl}/restablecer-contrasena?token=${tokenPlano}`;
    const asunto = 'Recuperación de Contraseña - Dashboard de Finanzas Personales';
    const contenidoHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Dashboard de Finanzas Personales</h2>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Has solicitado restablecer la contraseña de tu cuenta.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${enlaceRecuperacion}" 
             style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="font-size: 13px; color: #64748b;">
          Este enlace expira en <strong>30 minutos</strong> y es de un solo uso.<br />
          Si no realizaste esta solicitud, puedes ignorar este mensaje.
        </p>
      </div>
    `;

    if (!this.transporte) {
      console.log('================================================================');
      console.log(`✉️ [SIMULACIÓN DE CORREO ENVIADO]`);
      console.log(`Para: ${destinatario}`);
      console.log(`Enlace: ${enlaceRecuperacion}`);
      console.log('================================================================');
      return true;
    }

    try {
      await this.transporte.sendMail({
        from: `"Finanzas Personales" <${entorno.correoUsuario}>`,
        to: destinatario,
        subject: asunto,
        html: contenidoHtml
      });
      return true;
    } catch (error) {
      console.error(`[Correo] Error al enviar correo a ${destinatario}:`, error.message);
      return false;
    }
  }
}

export const correoServicio = new CorreoServicio();
export default correoServicio;
