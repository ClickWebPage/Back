import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Subject } from 'rxjs';

@Injectable()
export class NotificationsService {
  // Subject para enviar notificaciones en tiempo real
  private notificationSubject = new Subject<any>();

  constructor(private prisma: PrismaService) {}

  async createNotification(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        tipo: dto.tipo as any,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        orderId: dto.orderId,
        orderCodigo: dto.orderCodigo,
        destinatarios: dto.destinatarios,
        leido_por: [],
      },
    });

    // Emitir notificación en tiempo real
    this.notificationSubject.next(notification);

    return notification;
  }

  async getNotificationsForUser(userId: number, userRole: string) {
    // Obtener todas las notificaciones dirigidas al rol del usuario
    const notifications = await this.prisma.notification.findMany({
      where: {
        destinatarios: {
          has: userRole,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limitar a las últimas 50 notificaciones
    });

    // Marcar cuáles han sido leídas por este usuario
    return notifications.map(notif => ({
      ...notif,
      leida: notif.leido_por.includes(userId),
    }));
  }

  async getUnreadCount(userId: number, userRole: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        destinatarios: {
          has: userRole,
        },
        NOT: {
          leido_por: {
            has: userId,
          },
        },
      },
    });

    return notifications.length;
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return null;
    }

    // Agregar el userId a leido_por si no está ya
    if (!notification.leido_por.includes(userId)) {
      return this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          leido_por: {
            push: userId,
          },
        },
      });
    }

    return notification;
  }

  async markAllAsRead(userId: number, userRole: string) {
    // Obtener todas las notificaciones no leídas para este usuario
    const notifications = await this.prisma.notification.findMany({
      where: {
        destinatarios: {
          has: userRole,
        },
        NOT: {
          leido_por: {
            has: userId,
          },
        },
      },
    });

    // Actualizar cada una
    const updates = notifications.map(notif =>
      this.prisma.notification.update({
        where: { id: notif.id },
        data: {
          leido_por: {
            push: userId,
          },
        },
      })
    );

    await Promise.all(updates);

    return { success: true, count: notifications.length };
  }

  // Para SSE (Server-Sent Events)
  getNotificationObservable() {
    return this.notificationSubject.asObservable();
  }
}
