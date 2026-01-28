import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo usuario con contraseña hasheada
   */
  async create(userData: {
    nombre: string;
    apellido: string;
    username: string;
    email: string;
    password: string;
    telefono?: string;
    direccion?: string;
    rol?: string;
  }): Promise<User> {
    // Verificar si el usuario o email ya existe
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está registrado');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  /**
   * Buscar usuario por nombre de usuario
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: number): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Actualizar refresh token del usuario
   */
  async updateRefreshToken(
    userId: number,
    refreshToken: string | null,
  ): Promise<void> {
    const hashedToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token: hashedToken },
    });
  }

  /**
   * Actualizar último acceso
   */
  async updateLastAccess(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { ultimo_acceso: new Date() },
    });
  }

  /**
   * Incrementar intentos fallidos de login
   */
  async incrementFailedAttempts(userId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;

    const newAttempts = user.intentos_fallidos + 1;

    // Si alcanza 5 intentos fallidos, bloquear por 15 minutos
    if (newAttempts >= 5) {
      const bloqueadoHasta = new Date();
      bloqueadoHasta.setMinutes(bloqueadoHasta.getMinutes() + 15);
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          intentos_fallidos: newAttempts,
          bloqueado_hasta: bloqueadoHasta,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { intentos_fallidos: newAttempts },
      });
    }
  }

  /**
   * Resetear intentos fallidos
   */
  async resetFailedAttempts(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        intentos_fallidos: 0,
        bloqueado_hasta: null,
      },
    });
  }

  /**
   * Verificar si el usuario está bloqueado
   */
  async isUserBlocked(userId: number): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.bloqueado_hasta) return false;

    const now = new Date();
    if (now < user.bloqueado_hasta) {
      return true;
    }

    // Si el bloqueo expiró, resetear intentos
    await this.resetFailedAttempts(userId);
    return false;
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(
    userId: number,
    updateData: {
      telefono?: string;
      direccion?: string;
    },
  ): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: number, nuevaPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Obtener todos los usuarios (solo admin)
   */
  async findAll(): Promise<User[]> {
    return await this.prisma.user.findMany({
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  /**
   * Crear usuario desde panel de administrador
   */
  async createUserByAdmin(createUserDto: CreateUserAdminDto): Promise<User> {
    // Verificar si el usuario o email ya existe
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está registrado');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return await this.prisma.user.create({
      data: {
        nombre: createUserDto.nombre,
        apellido: createUserDto.apellido,
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
        telefono: createUserDto.telefono,
        direccion: createUserDto.direccion,
        rol: createUserDto.rol,
      },
    });
  }

  /**
   * Actualizar usuario desde panel de administrador
   */
  async updateUserByAdmin(
    id: number,
    updateUserDto: UpdateUserAdminDto,
  ): Promise<User> {
    // Verificar que el usuario existe
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se intenta actualizar username, verificar que no exista
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('El nombre de usuario ya está registrado');
      }
    }

    // Si se intenta actualizar email, verificar que no exista
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        fecha_actualizacion: new Date(),
      },
    });
  }

  /**
   * Eliminar usuario (solo admin)
   */
  async deleteUser(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // No permitir eliminar al propio administrador
    // Esta validación se hace en el controller con el userId del token

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
