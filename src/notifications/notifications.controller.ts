import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Req,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Observable, map, interval } from 'rxjs';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.rol;

    return this.notificationsService.getNotificationsForUser(userId, userRole);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.rol;

    const count = await this.notificationsService.getUnreadCount(userId, userRole);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    return this.notificationsService.markAsRead(parseInt(id), userId);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.rol;

    return this.notificationsService.markAllAsRead(userId, userRole);
  }

  // Server-Sent Events para notificaciones en tiempo real
  @Sse('stream')
  streamNotifications(@Req() req: any): Observable<MessageEvent> {
    const userId = req.user.sub;
    const userRole = req.user.rol;

    // Combinar notificaciones nuevas con polling cada 30 segundos
    return new Observable<MessageEvent>((observer) => {
      // Enviar contador inicial inmediatamente
      this.notificationsService.getUnreadCount(userId, userRole).then(count => {
        observer.next({
          data: JSON.stringify({ count }),
          type: 'count',
        } as any);
      });

      // Suscribirse a nuevas notificaciones
      const subscription = this.notificationsService
        .getNotificationObservable()
        .subscribe((notification) => {
          // Solo enviar si el usuario tiene el rol adecuado
          if (notification.destinatarios.includes(userRole)) {
            observer.next({
              data: JSON.stringify({ notification, userId }),
              type: 'notification',
            } as any);
          }
        });

      // Polling cada 30 segundos para sincronizar
      const pollInterval = setInterval(async () => {
        const count = await this.notificationsService.getUnreadCount(
          userId,
          userRole,
        );
        observer.next({
          data: JSON.stringify({ count }),
          type: 'count',
        } as any);
      }, 30000);

      // Cleanup
      return () => {
        subscription.unsubscribe();
        clearInterval(pollInterval);
      };
    });
  }
}
