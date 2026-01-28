import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/roles.enum';
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user: {
    userId: number;
    username: string;
    rol: string;
  };
}

@Controller('usuarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtener perfil del usuario autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async getProfile(@Request() req: AuthRequest) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return { mensaje: 'Usuario no encontrado' };
    }

    // Crear objeto sin campos sensibles
    const perfil = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      username: user.username,
      email: user.email,
      telefono: user.telefono,
      direccion: user.direccion,
      rol: user.rol,
      fecha_creacion: user.fecha_creacion,
      fecha_actualizacion: user.fecha_actualizacion,
      ultimo_acceso: user.ultimo_acceso,
    };

    return perfil;
  }

  /**
   * Actualizar perfil del usuario
   */
  @UseGuards(JwtAuthGuard)
  @Patch('perfil')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() req: AuthRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      req.user.userId,
      updateProfileDto,
    ); // <- Agregado el paréntesis de cierre

    // Crear objeto sin campos sensibles
    const perfil = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      username: user.username,
      email: user.email,
      telefono: user.telefono,
      direccion: user.direccion,
      rol: user.rol,
      fecha_creacion: user.fecha_creacion,
      fecha_actualizacion: user.fecha_actualizacion,
    };
    return perfil; // <- Probablemente también necesites retornar el objeto
  }

  /**
   * Cambiar contraseña
   */
  @UseGuards(JwtAuthGuard)
  @Patch('cambiar-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: AuthRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      req.user.userId,
      changePasswordDto.nuevaPassword,
    );
    return {
      mensaje: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Obtener todos los usuarios (solo rol ADMIN y VENDEDOR)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDEDOR)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();

    // Devolver usuarios sin campos sensibles
    return users.map((user) => ({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      username: user.username,
      email: user.email,
      telefono: user.telefono,
      direccion: user.direccion,
      rol: user.rol,
      fecha_creacion: user.fecha_creacion,
      fecha_actualizacion: user.fecha_actualizacion,
      ultimo_acceso: user.ultimo_acceso,
    }));
  }

  /**
   * Crear nuevo usuario (solo rol ADMIN)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserAdminDto) {
    const user = await this.usersService.createUserByAdmin(createUserDto);

    // Devolver usuario sin campos sensibles
    return {
      mensaje: 'Usuario creado exitosamente',
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email,
        telefono: user.telefono,
        direccion: user.direccion,
        rol: user.rol,
        fecha_creacion: user.fecha_creacion,
      },
    };
  }

  /**
   * Actualizar usuario (solo rol ADMIN)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserAdminDto,
  ) {
    const user = await this.usersService.updateUserByAdmin(id, updateUserDto);

    // Devolver usuario sin campos sensibles
    return {
      mensaje: 'Usuario actualizado exitosamente',
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        email: user.email,
        telefono: user.telefono,
        direccion: user.direccion,
        rol: user.rol,
        fecha_actualizacion: user.fecha_actualizacion,
      },
    };
  }

  /**
   * Eliminar usuario (solo rol ADMIN)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    // No permitir que el admin se elimine a sí mismo
    if (req.user.userId === id) {
      throw new BadRequestException('No puedes eliminar tu propia cuenta');
    }

    await this.usersService.deleteUser(id);

    return {
      mensaje: 'Usuario eliminado exitosamente',
    };
  }
}
