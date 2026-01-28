import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AssignOrderDto } from './dto/assign-order.dto';
import { UpdateEstadoGestionDto } from './dto/update-estado-gestion.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) {}

  private generateOrderCode(orderId: number): string {
    const padded = orderId.toString().padStart(6, '0');
    return `CHPC-${padded}`;
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('La orden debe contener al menos un producto');
    }

    const productIds = dto.items.map((i) => i.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Uno o más productos no existen');
    }

    let subtotal = 0;
    let totalItems = 0;

    const itemsData = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const lineTotal = product.precio * item.cantidad;
      subtotal += lineTotal;
      totalItems += item.cantidad;

      return {
        productId: product.id,
        nombre: product.nombre_producto,
        precio: product.precio,
        cantidad: item.cantidad,
        total: lineTotal,
      };
    });

    const descuento = dto.descuento ?? 0;
    const total = subtotal - descuento;

    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          codigo: '', // se actualiza después con el id real
          totalItems,
          subtotal,
          descuento,
          total,
          status: 'PENDING' as any,
          paymentMethod: dto.paymentMethod as any,
          paymentRef: dto.paymentRef,
          nombre_cliente: dto.nombre_cliente,
          email_cliente: dto.email_cliente,
          telefono: dto.telefono,
          direccion_envio: dto.direccion_envio,
          observaciones: dto.observaciones,
          items: {
            create: itemsData,
          },
        },
        include: { items: true },
      });

      const codigo = this.generateOrderCode(order.id);

      const updated = await tx.order.update({
        where: { id: order.id },
        data: { codigo },
        include: { items: true },
      });

      return updated;
    });

    // Crear notificación para administradores y vendedores
    await this.notificationsService.createNotification({
      tipo: 'NUEVO_PEDIDO' as any,
      titulo: '🛒 Nuevo Pedido Recibido',
      mensaje: `Se ha recibido un nuevo pedido #${created.codigo} por un total de $${created.total.toFixed(2)} de ${created.nombre_cliente}`,
      orderId: created.id,
      orderCodigo: created.codigo,
      destinatarios: ['admin', 'vendedor'],
    });

    // Enviar email de confirmación al cliente
    await this.mailService.sendOrderConfirmation(created.email_cliente, {
      codigo: created.codigo,
      nombre_cliente: created.nombre_cliente,
      total: created.total,
      items: created.items,
      direccion_envio: created.direccion_envio,
    });

    // Enviar notificación a administradores por email
    const admins = await this.prisma.user.findMany({
      where: { rol: 'administrador' },
      select: { email: true },
    });
    
    if (admins.length > 0) {
      await this.mailService.sendNewOrderNotificationToAdmins(
        admins.map(admin => admin.email),
        {
          codigo: created.codigo,
          nombre_cliente: created.nombre_cliente,
          email_cliente: created.email_cliente,
          total: created.total,
          totalItems: created.totalItems,
        },
      );
    }

    return created;
  }

  async findUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(id: number, userId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status as any },
    });
  }

  // Métodos para panel de vendedores
  async findAllOrders() {
    return this.prisma.order.findMany({
      include: { 
        items: true,
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignOrderToVendedor(orderId: number, vendedorId: number, dto: AssignOrderDto) {
    const order = await this.prisma.order.findUnique({ 
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Obtener información del vendedor
    const vendedor = await this.prisma.user.findUnique({
      where: { id: vendedorId },
      select: { email: true },
    });

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { 
        vendedor_id: vendedorId,
        vendedor_nombre: dto.vendedor_nombre,
        estado_gestion: 'EN_TRAMITE',
      },
      include: { items: true },
    });

    // Notificar asignación
    await this.notificationsService.createNotification({
      tipo: 'PEDIDO_ACTUALIZADO' as any,
      titulo: '👤 Pedido Asignado',
      mensaje: `El pedido #${updated.codigo} ha sido asignado a ${dto.vendedor_nombre}`,
      orderId: updated.id,
      orderCodigo: updated.codigo,
      destinatarios: ['admin', 'vendedor'],
    });

    // Enviar email al cliente
    await this.mailService.sendOrderStatusUpdate(order.email_cliente, {
      codigo: updated.codigo,
      nombre_cliente: updated.nombre_cliente,
      estado_gestion: 'EN_TRAMITE',
      vendedor_nombre: dto.vendedor_nombre,
    });

    // Enviar email al vendedor asignado
    if (vendedor) {
      await this.mailService.sendOrderAssignedToVendedor(vendedor.email, {
        codigo: updated.codigo,
        nombre_cliente: updated.nombre_cliente,
        total: updated.total,
        vendedor_nombre: dto.vendedor_nombre,
      });
    }

    return updated;
  }

  async unassignOrder(orderId: number, userId: number, userRole: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Solo el vendedor asignado o un admin puede desasignar
    if (userRole !== 'administrador' && order.vendedor_id !== userId) {
      throw new ForbiddenException('No tienes permiso para desasignar este pedido');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { 
        vendedor_id: null,
        vendedor_nombre: null,
        estado_gestion: 'PENDIENTE',
      },
      include: { items: true },
    });

    // Notificar desasignación
    await this.notificationsService.createNotification({
      tipo: 'PEDIDO_ACTUALIZADO' as any,
      titulo: '🔄 Pedido Liberado',
      mensaje: `El pedido #${updated.codigo} ha sido liberado y está disponible para asignación`,
      orderId: updated.id,
      orderCodigo: updated.codigo,
      destinatarios: ['admin', 'vendedor'],
    });

    // Enviar email al cliente notificando el cambio
    await this.mailService.sendOrderStatusUpdate(order.email_cliente, {
      codigo: updated.codigo,
      nombre_cliente: updated.nombre_cliente,
      estado_gestion: 'PENDIENTE',
    });

    return updated;
  }

  async updateEstadoGestion(orderId: number, userId: number, userRole: string, dto: UpdateEstadoGestionDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Solo el vendedor asignado o un admin pueden cambiar el estado
    if (userRole !== 'administrador' && order.vendedor_id !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar este pedido');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { estado_gestion: dto.estado_gestion as any },
      include: { items: true },
    });

    // Notificar cambio de estado
    const estadoTexto = {
      PENDIENTE: 'Pendiente ⏳',
      EN_TRAMITE: 'En Trámite 🔄',
      ATENDIDO: 'Atendido ✅',
      CANCELADO: 'Cancelado ❌',
    };

    await this.notificationsService.createNotification({
      tipo: 'PEDIDO_ACTUALIZADO' as any,
      titulo: '📊 Estado Actualizado',
      mensaje: `El pedido #${updated.codigo} cambió a: ${estadoTexto[dto.estado_gestion]}`,
      orderId: updated.id,
      orderCodigo: updated.codigo,
      destinatarios: ['admin', 'vendedor'],
    });

    // Enviar email al cliente notificando el cambio de estado
    await this.mailService.sendOrderStatusUpdate(order.email_cliente, {
      codigo: updated.codigo,
      nombre_cliente: updated.nombre_cliente,
      estado_gestion: dto.estado_gestion,
      vendedor_nombre: order.vendedor_nombre,
    });

    return updated;
  }

  async findOrdersByVendedor(vendedorId: number) {
    return this.prisma.order.findMany({
      where: { vendedor_id: vendedorId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
