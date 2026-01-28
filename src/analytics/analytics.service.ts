import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getKPIs() {
    const ventasTotales = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } },
    });

    const totalOrdenes = await this.prisma.order.count({
      where: { status: { not: 'CANCELLED' } },
    });

    const productosVendidos = await this.prisma.orderItem.aggregate({
      _sum: { cantidad: true },
    });

    const clientesActivos = await this.prisma.user.count({
      where: {
        rol: 'cliente',
        orders: { some: {} },
      },
    });

    return {
      ventasTotales: ventasTotales._sum.total || 0,
      totalOrdenes,
      productosVendidos: productosVendidos._sum.cantidad || 0,
      clientesActivos,
    };
  }

  async getVentasPorPeriodo(periodo: string) {
    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'month';

    switch (periodo) {
      case '7dias':
        startDate = new Date(now.setDate(now.getDate() - 7));
        groupBy = 'day';
        break;
      case '30dias':
        startDate = new Date(now.setDate(now.getDate() - 30));
        groupBy = 'day';
        break;
      case '3meses':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        groupBy = 'month';
        break;
      case 'año':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        groupBy = 'month';
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
        groupBy = 'day';
    }

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    const grouped = this.groupByPeriod(orders, groupBy);
    return {
      labels: grouped.map((g) => g.label),
      ventas: grouped.map((g) => g.total),
    };
  }

  async getProductosTop(limite: number = 10) {
    const productos = await this.prisma.orderItem.groupBy({
      by: ['nombre'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: limite,
    });

    return {
      productos: productos.map((p) => p.nombre),
      cantidades: productos.map((p) => p._sum.cantidad || 0),
    };
  }

  async getVentasPorCategoria() {
    // Por ahora usaremos categorías basadas en palabras clave en los nombres
    const items = await this.prisma.orderItem.findMany({
      select: {
        nombre: true,
        total: true,
      },
    });

    const categorias = new Map<string, number>();
    items.forEach((item) => {
      const categoria = this.determinarCategoria(item.nombre);
      const actual = categorias.get(categoria) || 0;
      categorias.set(categoria, actual + item.total);
    });

    return {
      categorias: Array.from(categorias.keys()),
      ventas: Array.from(categorias.values()),
    };
  }

  async getOrdenesRecientes(limite: number = 10) {
    const ordenes = await this.prisma.order.findMany({
      take: limite,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return ordenes.map((orden) => ({
      id: orden.id,
      codigo: orden.codigo,
      cliente: `${orden.user.nombre} ${orden.user.apellido}`,
      fecha: orden.createdAt,
      total: orden.total,
      status: orden.status,
    }));
  }

  private groupByPeriod(
    orders: { createdAt: Date; total: number }[],
    groupBy: 'day' | 'month',
  ) {
    const grouped = new Map<string, number>();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = `${date.getDate()}/${date.getMonth() + 1}`;
      } else {
        const months = [
          'Ene',
          'Feb',
          'Mar',
          'Abr',
          'May',
          'Jun',
          'Jul',
          'Ago',
          'Sep',
          'Oct',
          'Nov',
          'Dic',
        ];
        key = months[date.getMonth()];
      }

      const current = grouped.get(key) || 0;
      grouped.set(key, current + order.total);
    });

    return Array.from(grouped.entries()).map(([label, total]) => ({
      label,
      total,
    }));
  }

  private determinarCategoria(nombre: string): string {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('laptop') || nombreLower.includes('notebook'))
      return 'Laptops';
    if (nombreLower.includes('monitor') || nombreLower.includes('pantalla'))
      return 'Monitores';
    if (nombreLower.includes('teclado') || nombreLower.includes('keyboard'))
      return 'Teclados';
    if (nombreLower.includes('mouse') || nombreLower.includes('ratón'))
      return 'Mouses';
    if (nombreLower.includes('impresora') || nombreLower.includes('printer'))
      return 'Impresoras';
    if (nombreLower.includes('cámara') || nombreLower.includes('camera'))
      return 'Cámaras';
    return 'Accesorios';
  }
}
