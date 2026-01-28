import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { WorkOrderStatus } from '@prisma/client';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  /**
   * Crear una nueva orden de trabajo
   * Accesible por: administrador, tecnico, cliente
   */
  @Post()
  @Roles(Role.ADMIN, Role.TECNICO, Role.CLIENTE)
  create(@Body() createWorkOrderDto: CreateWorkOrderDto, @Request() req: any) {
    const userId = (req.user?.userId || req.user?.id) as number;
    return this.workOrdersService.create(createWorkOrderDto, userId);
  }
  /**
   * Obtener todas las órdenes de trabajo con filtros
   * Accesible por: administrador, tecnico
   */
  @Get()
  @Roles(Role.ADMIN, Role.TECNICO)
  findAll(
    @Query('estado') estado?: WorkOrderStatus,
    @Query('tecnico_id') tecnicoId?: string,
    @Query('disponibles') disponibles?: string,
  ) {
    const filters: {
      estado?: WorkOrderStatus;
      tecnico_id?: number;
      disponibles?: boolean;
    } = {};
    if (estado) {
      filters.estado = estado;
    }
    if (tecnicoId) {
      filters.tecnico_id = parseInt(tecnicoId, 10);
    }
    if (disponibles === 'true') {
      filters.disponibles = true;
    }
    return this.workOrdersService.findAll(filters);
  }
  /**
   * Obtener estadísticas de órdenes de trabajo
   * Accesible por: administrador, tecnico
   */
  @Get('statistics')
  @Roles(Role.ADMIN, Role.TECNICO)
  getStatistics(@Query('tecnico_id') tecnicoId?: string) {
    const tecnico = tecnicoId ? parseInt(tecnicoId, 10) : undefined;
    return this.workOrdersService.getStatistics(tecnico);
  }
  /**
   * Obtener una orden de trabajo por ID
   * Accesible por: administrador, tecnico, cliente (solo sus órdenes)
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.TECNICO, Role.CLIENTE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workOrdersService.findOne(id);
  }
  /**
   * Obtener una orden por tracking ID
   * Accesible por: todos (para consulta pública)
   */
  @Get('tracking/:trackingId')
  findByTrackingId(@Param('trackingId') trackingId: string) {
    return this.workOrdersService.findByTrackingId(trackingId);
  }
  /**
   * Actualizar una orden de trabajo
   * Accesible por: administrador, tecnico (solo si está asignado)
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.TECNICO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkOrderDto: UpdateWorkOrderDto,
    @Request() req: any,
  ) {
    const userId = (req.user?.userId || req.user?.id) as number;
    const userRole = req.user?.rol as string;
    return this.workOrdersService.update(id, updateWorkOrderDto, userId, userRole);
  }

  /**
   * Asignar un técnico a una orden de trabajo
   * Accesible por: administrador, tecnico (auto-asignación)
   */
  @Post(':id/asignar')
  @Roles(Role.ADMIN, Role.TECNICO)
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignDto: AssignWorkOrderDto,
    @Request() req: any,
  ) {
    const userId = (req.user?.userId || req.user?.id) as number;
    const userRole = req.user?.rol as string;
    const tecnicoNombre =
      assignDto.tecnico_nombre ||
      `${req.user?.nombre || ''} ${req.user?.apellido || ''}`.trim();
    return this.workOrdersService.assignTechnician(
      id,
      userId,
      tecnicoNombre,
      userRole,
    );
  }

  /**
   * Desasignar un técnico de una orden de trabajo
   * Accesible por: administrador, tecnico (solo si está asignado)
   */
  @Delete(':id/desasignar')
  @Roles(Role.ADMIN, Role.TECNICO)
  unassign(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = (req.user?.userId || req.user?.id) as number;
    const userRole = req.user?.rol as string;
    return this.workOrdersService.unassignTechnician(id, userId, userRole);
  }

  /**
   * Actualizar el estado de una orden de trabajo
   * Accesible por: administrador, tecnico (solo si está asignado)
   */
  @Patch(':id/estado')
  @Roles(Role.ADMIN, Role.TECNICO)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req: any,
  ) {
    const userId = (req.user?.userId || req.user?.id) as number;
    const userRole = req.user?.rol as string;
    return this.workOrdersService.updateStatus(
      id,
      updateStatusDto.estado,
      userId,
      userRole,
    );
  }

  /**
   * Eliminar (cancelar) una orden de trabajo
   * Accesible por: administrador
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = (req.user?.userId || req.user?.id) as number;
    const userRole = req.user?.rol as string;
    return this.workOrdersService.remove(id, userId, userRole);
  }
}
