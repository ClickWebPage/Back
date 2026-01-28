import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CreatePermisoTemporalDto } from './dto/create-permiso-temporal.dto';
import { UpdatePermisoTemporalDto } from './dto/update-permiso-temporal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

interface AuthRequest extends Request {
  user: {
    userId: number;
    username: string;
    rol: string;
  };
}

@Controller('permisos-temporales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  /**
   * Crear un permiso temporal (solo ADMIN)
   */
  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreatePermisoTemporalDto,
    @Request() req: AuthRequest,
  ) {
    const permiso = await this.permisosService.create(
      createDto,
      req.user.username,
    );

    return {
      mensaje: 'Permiso temporal otorgado exitosamente',
      permiso,
    };
  }

  /**
   * Obtener todos los permisos temporales (solo ADMIN)
   */
  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return await this.permisosService.findAll();
  }

  /**
   * Obtener permisos activos del usuario autenticado
   */
  @Get('mis-permisos')
  async getMisPermisos(@Request() req: AuthRequest) {
    return await this.permisosService.findActiveByUserId(req.user.userId);
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  @Get('verificar/:tipoPermiso')
  async verificarPermiso(
    @Param('tipoPermiso') tipoPermiso: string,
    @Request() req: AuthRequest,
  ) {
    const tienePermiso = await this.permisosService.verificarPermiso(
      req.user.userId,
      tipoPermiso,
    );

    return {
      tienePermiso,
      tipoPermiso,
    };
  }

  /**
   * Obtener permisos de un usuario específico (solo ADMIN)
   */
  @Get('usuario/:userId')
  @Roles(Role.ADMIN)
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.permisosService.findByUserId(userId);
  }

  /**
   * Actualizar permiso temporal (solo ADMIN)
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePermisoTemporalDto,
  ) {
    const permiso = await this.permisosService.update(id, updateDto);

    return {
      mensaje: 'Permiso actualizado exitosamente',
      permiso,
    };
  }

  /**
   * Revocar permiso temporal (solo ADMIN)
   */
  @Patch(':id/revocar')
  @Roles(Role.ADMIN)
  async revocar(@Param('id', ParseIntPipe) id: number) {
    const permiso = await this.permisosService.revocar(id);

    return {
      mensaje: 'Permiso revocado exitosamente',
      permiso,
    };
  }

  /**
   * Eliminar permiso temporal (solo ADMIN)
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.permisosService.delete(id);

    return {
      mensaje: 'Permiso eliminado exitosamente',
    };
  }
}
