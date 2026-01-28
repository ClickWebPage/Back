import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: any;
  html?: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Envía un email genérico
   */
  async sendMail(options: EmailOptions): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email enviado exitosamente a ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error al enviar email a ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Envía notificación de nuevo pedido al cliente
   */
  async sendOrderConfirmation(
    email: string,
    orderData: {
      codigo: string;
      nombre_cliente: string;
      total: number;
      items: any[];
      direccion_envio: string;
    },
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: `🛍️ Confirmación de Pedido #${orderData.codigo}`,
      template: './order-confirmation',
      context: {
        nombre: orderData.nombre_cliente,
        codigo: orderData.codigo,
        total: orderData.total.toFixed(2),
        items: orderData.items,
        direccion: orderData.direccion_envio,
        fecha: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
    });
  }

  /**
   * Envía notificación de cambio de estado de pedido
   */
  async sendOrderStatusUpdate(
    email: string,
    orderData: {
      codigo: string;
      nombre_cliente: string;
      estado_gestion: string;
      vendedor_nombre?: string | null;
    },
  ): Promise<boolean> {
    const estadoTexto = {
      PENDIENTE: 'Pendiente de atención',
      EN_TRAMITE: 'En proceso de gestión',
      ATENDIDO: 'Completamente atendido',
      CANCELADO: 'Cancelado',
    };

    const estadoEmoji = {
      PENDIENTE: '⏳',
      EN_TRAMITE: '🔄',
      ATENDIDO: '✅',
      CANCELADO: '❌',
    };

    return this.sendMail({
      to: email,
      subject: `${estadoEmoji[orderData.estado_gestion]} Actualización de Pedido #${orderData.codigo}`,
      template: './order-status-update',
      context: {
        nombre: orderData.nombre_cliente,
        codigo: orderData.codigo,
        estado: estadoTexto[orderData.estado_gestion],
        emoji: estadoEmoji[orderData.estado_gestion],
        vendedor: orderData.vendedor_nombre,
        fecha: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    });
  }

  /**
   * Envía notificación de pedido asignado a vendedor
   */
  async sendOrderAssignedToVendedor(
    vendedorEmail: string,
    orderData: {
      codigo: string;
      nombre_cliente: string;
      total: number;
      vendedor_nombre: string;
    },
  ): Promise<boolean> {
    return this.sendMail({
      to: vendedorEmail,
      subject: `📋 Nuevo Pedido Asignado #${orderData.codigo}`,
      template: './order-assigned',
      context: {
        vendedor: orderData.vendedor_nombre,
        codigo: orderData.codigo,
        cliente: orderData.nombre_cliente,
        total: orderData.total.toFixed(2),
        fecha: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    });
  }

  /**
   * Envía email de bienvenida a nuevo usuario
   */
  async sendWelcomeEmail(
    email: string,
    userData: {
      nombre: string;
      apellido: string;
    },
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: '🎉 Bienvenido a CHPC - Tu cuenta ha sido creada',
      template: './welcome',
      context: {
        nombre: userData.nombre,
        apellido: userData.apellido,
        fecha: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
    });
  }

  /**
   * Envía email de recuperación de contraseña
   */
  async sendPasswordResetEmail(
    email: string,
    resetData: {
      nombre: string;
      resetToken: string;
      resetUrl: string;
    },
  ): Promise<boolean> {
    this.logger.log(`Preparando email de recuperación para: ${email}`);
    this.logger.log(`Template: ./password-reset`);
    this.logger.log(`Contexto: nombre=${resetData.nombre}, resetUrl=${resetData.resetUrl}`);
    
    return this.sendMail({
      to: email,
      subject: '🔐 Recuperación de Contraseña - CHPC',
      template: './password-reset',
      context: {
        nombre: resetData.nombre,
        resetUrl: resetData.resetUrl,
        expiracion: '1 hora',
      },
    });
  }

  /**
   * Envía notificación de cambio de contraseña exitoso
   */
  async sendPasswordChangedEmail(
    email: string,
    userData: {
      nombre: string;
    },
  ): Promise<boolean> {
    return this.sendMail({
      to: email,
      subject: '✅ Contraseña Actualizada - CHPC',
      template: './password-changed',
      context: {
        nombre: userData.nombre,
        fecha: new Date().toLocaleString('es-ES', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      },
    });
  }

  /**
   * Envía notificación de nuevo pedido a administradores
   */
  async sendNewOrderNotificationToAdmins(
    adminEmails: string[],
    orderData: {
      codigo: string;
      nombre_cliente: string;
      email_cliente: string;
      total: number;
      totalItems: number;
    },
  ): Promise<boolean> {
    const promises = adminEmails.map(email =>
      this.sendMail({
        to: email,
        subject: `🔔 Nuevo Pedido Recibido #${orderData.codigo}`,
        template: './new-order-admin',
        context: {
          codigo: orderData.codigo,
          cliente: orderData.nombre_cliente,
          email_cliente: orderData.email_cliente,
          total: orderData.total.toFixed(2),
          items: orderData.totalItems,
          fecha: new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      }),
    );

    const results = await Promise.all(promises);
    return results.every(result => result === true);
  }

  /**
   * Envía email con plantilla HTML personalizada
   */
  async sendCustomEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<boolean> {
    return this.sendMail({
      to,
      subject,
      html: htmlContent,
    });
  }

  /**
   * Envía email simple de texto
   */
  async sendTextEmail(
    to: string,
    subject: string,
    textContent: string,
  ): Promise<boolean> {
    return this.sendMail({
      to,
      subject,
      text: textContent,
    });
  }
}
