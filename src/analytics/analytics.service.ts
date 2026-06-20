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

  // =========================================
  // Métodos para Tracking de Visitas
  // =========================================

  async trackPageView(data: {
    ruta: string;
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
    session_id?: string;
    usuario_id?: number;
  }) {
    return this.prisma.pageView.create({
      data: {
        ruta: data.ruta,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        referrer: data.referrer,
        session_id: data.session_id,
        usuario_id: data.usuario_id,
      },
    });
  }

  async trackProductView(data: {
    producto_id: number;
    producto_nombre?: string;
    marca?: string;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    usuario_id?: number;
  }) {
    return this.prisma.productView.create({
      data: {
        producto_id: data.producto_id,
        producto_nombre: data.producto_nombre,
        marca: data.marca,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        session_id: data.session_id,
        usuario_id: data.usuario_id,
      },
    });
  }

  async trackBrandView(data: {
    marca: string;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    usuario_id?: number;
  }) {
    return this.prisma.brandView.create({
      data: {
        marca: data.marca,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        session_id: data.session_id,
        usuario_id: data.usuario_id,
      },
    });
  }

  // =========================================
  // Métodos para Obtener Métricas de Visitas
  // =========================================

  /**
   * Obtiene los IDs de usuarios que tienen alguno de los roles indicados.
   * Se usa para incluir/excluir visitas de staff en los reportes.
   */
  private async getUserIdsByRoles(roles: string[]): Promise<number[]> {
    if (!roles || roles.length === 0) return [];
    const users = await this.prisma.user.findMany({
      where: { rol: { in: roles } },
      select: { id: true },
    });
    return users.map((u) => u.id);
  }

  /**
   * Construye el filtro de usuario_id basado en los roles a excluir/incluir.
   * excluirRoles: excluye visitas de usuarios con esos roles (ej: admin, vendedor, tecnico)
   * soloRoles: sólo incluye visitas de usuarios con esos roles
   * Si ninguno se proporciona, no aplica filtro por rol.
   */
  private async buildRoleFilter(
    excluirRoles?: string[],
    soloRoles?: string[],
  ): Promise<object> {
    if (soloRoles && soloRoles.length > 0) {
      const ids = await this.getUserIdsByRoles(soloRoles);
      return { usuario_id: { in: ids } };
    }
    if (excluirRoles && excluirRoles.length > 0) {
      const ids = await this.getUserIdsByRoles(excluirRoles);
      if (ids.length === 0) return {};
      return { NOT: { usuario_id: { in: ids } } };
    }
    return {};
  }

  async getPageViewsStats(
    periodo: string = '30dias',
    excluirRoles?: string[],
    soloRoles?: string[],
  ) {
    const startDate = this.getStartDate(periodo);
    const roleFilter = await this.buildRoleFilter(excluirRoles, soloRoles);

    const baseWhere = {
      fecha_visita: { gte: startDate },
      ...roleFilter,
    };

    const totalViews = await this.prisma.pageView.count({
      where: baseWhere,
    });

    const uniqueVisitors = await this.prisma.pageView.groupBy({
      by: ['session_id'],
      where: {
        ...baseWhere,
        session_id: { not: null },
      },
    });

    const topPages = await this.prisma.pageView.groupBy({
      by: ['ruta'],
      _count: { id: true },
      where: baseWhere,
      orderBy: {
        _count: { id: 'desc' },
      },
      take: 10,
    });

    const viewsByDate = await this.prisma.pageView.findMany({
      where: baseWhere,
      select: {
        fecha_visita: true,
      },
    });

    const groupedByDate = this.groupViewsByPeriod(viewsByDate, periodo);

    return {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      topPages: topPages.map((p) => ({
        ruta: p.ruta,
        visitas: p._count.id,
      })),
      viewsByDate: {
        labels: groupedByDate.map((g) => g.label),
        visitas: groupedByDate.map((g) => g.count),
      },
    };
  }

  async getProductViewsStats(
    periodo: string = '30dias',
    limite: number = 20,
    excluirRoles?: string[],
    soloRoles?: string[],
  ) {
    const startDate = this.getStartDate(periodo);
    const roleFilter = await this.buildRoleFilter(excluirRoles, soloRoles);

    const baseWhere = {
      fecha_visita: { gte: startDate },
      ...roleFilter,
    };

    const topProducts = await this.prisma.productView.groupBy({
      by: ['producto_id', 'producto_nombre'],
      _count: { id: true },
      where: baseWhere,
      orderBy: {
        _count: { id: 'desc' },
      },
      take: limite,
    });

    const totalViews = await this.prisma.productView.count({
      where: baseWhere,
    });

    return {
      totalViews,
      topProducts: topProducts.map((p) => ({
        producto_id: p.producto_id,
        producto_nombre: p.producto_nombre || `Producto ${p.producto_id}`,
        visitas: p._count.id,
      })),
    };
  }

  async getBrandViewsStats(
    periodo: string = '30dias',
    limite: number = 20,
    excluirRoles?: string[],
    soloRoles?: string[],
  ) {
    const startDate = this.getStartDate(periodo);
    const roleFilter = await this.buildRoleFilter(excluirRoles, soloRoles);

    const baseWhere = {
      fecha_visita: { gte: startDate },
      ...roleFilter,
    };

    const topBrands = await this.prisma.brandView.groupBy({
      by: ['marca'],
      _count: { id: true },
      where: {
        ...baseWhere,
        marca: { not: undefined as unknown as string },
      },
      orderBy: {
        _count: { id: 'desc' },
      },
      take: limite,
    });

    const totalViews = await this.prisma.brandView.count({
      where: baseWhere,
    });

    return {
      totalViews,
      topBrands: topBrands.map((b) => ({
        marca: b.marca,
        visitas: (b._count as { id: number }).id,
      })),
    };
  }

  async getVisitorsOverview(
    periodo: string = '30dias',
    excluirRoles?: string[],
    soloRoles?: string[],
  ) {
    const startDate = this.getStartDate(periodo);
    const roleFilter = await this.buildRoleFilter(excluirRoles, soloRoles);

    const baseWhere = {
      fecha_visita: { gte: startDate },
      ...roleFilter,
    };

    const pageViews = await this.prisma.pageView.count({
      where: baseWhere,
    });

    const productViews = await this.prisma.productView.count({
      where: baseWhere,
    });

    const brandViews = await this.prisma.brandView.count({
      where: baseWhere,
    });

    const uniqueVisitors = await this.prisma.pageView.groupBy({
      by: ['session_id'],
      where: {
        ...baseWhere,
        session_id: { not: null },
      },
    });

    return {
      periodo,
      totalPageViews: pageViews,
      totalProductViews: productViews,
      totalBrandViews: brandViews,
      uniqueVisitors: uniqueVisitors.length,
      totalInteractions: pageViews + productViews + brandViews,
    };
  }

  // =========================================
  // Métodos Auxiliares
  // =========================================

  private getStartDate(periodo: string): Date {
    const now = new Date();
    switch (periodo) {
      case '7dias':
        return new Date(now.setDate(now.getDate() - 7));
      case '30dias':
        return new Date(now.setDate(now.getDate() - 30));
      case '3meses':
        return new Date(now.setMonth(now.getMonth() - 3));
      case 'año':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  }

  private groupViewsByPeriod(
    views: { fecha_visita: Date }[],
    periodo: string,
  ) {
    const groupBy = periodo === '7dias' || periodo === '30dias' ? 'day' : 'month';
    const grouped = new Map<string, number>();

    views.forEach((view) => {
      const date = new Date(view.fecha_visita);
      let key: string;

      if (groupBy === 'day') {
        key = `${date.getDate()}/${date.getMonth() + 1}`;
      } else {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        key = months[date.getMonth()];
      }

      const current = grouped.get(key) || 0;
      grouped.set(key, current + 1);
    });

    return Array.from(grouped.entries()).map(([label, count]) => ({
      label,
      count,
    }));
  }
}

