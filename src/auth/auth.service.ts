import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    // Crear notificación para administradores sobre nuevo registro
    try {
      await this.notificationsService.createNotification({
        tipo: NotificationType.NUEVO_USUARIO,
        titulo: '👤 Nuevo usuario registrado',
        mensaje: `Se ha registrado un nuevo usuario: ${user.nombre} ${user.apellido} (${user.email})`,
        orderId: undefined,
        orderCodigo: undefined,
        destinatarios: ['admin'],
      });
    } catch (error) {
      // No bloquear el registro por fallos en notificaciones
      console.error('Error al crear notificación de nuevo usuario:', error);
    }

    // Enviar email de bienvenida (no bloquea el registro si falla)
    try {
      if (user.email) {
        await this.mailService.sendWelcomeEmail(user.email, {
          nombre: user.nombre,
          apellido: user.apellido,
        });
      }
    } catch (error) {
      // Solo registramos el error en logs; el flujo de registro continúa
      console.error('Error al enviar email de bienvenida:', error);
    }

    // Crear objeto sin campos sensibles
    const resultado = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      username: user.username,
      email: user.email,
      telefono: user.telefono,
      direccion: user.direccion,
      rol: user.rol,
      fecha_creacion: user.fecha_creacion,
    };

    return {
      mensaje: 'Usuario registrado exitosamente',
      usuario: resultado,
    };
  }

  /**
   * Login de usuario con generación de tokens
   */
  async login(loginDto: LoginDto) {
    // Buscar usuario
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // SISTEMA DE BLOQUEO DESACTIVADO
    // Si deseas reactivarlo, descomenta las siguientes líneas:
    /*
    const isBlocked = await this.usersService.isUserBlocked(user.id);
    if (isBlocked && user.bloqueado_hasta) {
      const minutosRestantes = Math.ceil(
        (user.bloqueado_hasta.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Usuario bloqueado temporalmente. Intente nuevamente en ${minutosRestantes} minutos`,
      );
    }
    */

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      // SISTEMA DE BLOQUEO DESACTIVADO - No incrementa intentos fallidos
      // Si deseas reactivarlo, descomenta las siguientes líneas:
      /*
      await this.usersService.incrementFailedAttempts(user.id);

      const attemptsLeft = 5 - (user.intentos_fallidos + 1);
      if (attemptsLeft > 0) {
        throw new UnauthorizedException(
          `Credenciales inválidas. Le quedan ${attemptsLeft} intentos`,
        );
      } else {
        throw new UnauthorizedException(
          'Cuenta bloqueada por 15 minutos debido a múltiples intentos fallidos',
        );
      }
      */
      
      // Simplemente retorna error de credenciales inválidas
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Resetear intentos fallidos en caso de login exitoso
    await this.usersService.resetFailedAttempts(user.id);

    // Actualizar último acceso
    await this.usersService.updateLastAccess(user.id);

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.username, user.rol);

    // Guardar refresh token hasheado
    await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

    // Crear objeto sin campos sensibles
    const userWithoutPassword = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      username: user.username,
      email: user.email,
      telefono: user.telefono,
      direccion: user.direccion,
      rol: user.rol,
      fecha_creacion: user.fecha_creacion,
      ultimo_acceso: user.ultimo_acceso,
    };

    return {
      mensaje: 'Inicio de sesión exitoso',
      ...tokens,
      usuario: userWithoutPassword,
    };
  }

  /**
   * Cerrar sesión (invalidar refresh token)
   */
  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return {
      mensaje: 'Sesión cerrada exitosamente',
    };
  }

  /**
   * Refrescar access token usando refresh token
   */
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Acceso denegado');
    }

    // Verificar refresh token
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refresh_token,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Generar nuevos tokens
    const tokens = await this.generateTokens(user.id, user.username, user.rol);

    // Actualizar refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  /**
   * Generar access token y refresh token
   */
  private async generateTokens(userId: number, username: string, rol: string) {
    const payload = {
      sub: userId,
      username: username,
      rol: rol,
    };

    const [accessToken, refreshToken] = await Promise.all([
      // Access Token (15 minutos)
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_SECRET') ||
          'chpc-secret-key-2025',
        expiresIn: '15m',
      }),
      // Refresh Token (7 días)
      this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'chpc-refresh-secret-2025',
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Validar usuario para JWT Strategy
   */
  async validateUser(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(
    forgotPasswordDto: ForgotPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { email } = forgotPasswordDto;
    // Buscar usuario por email
    const user = await this.usersService.findByEmail(email);
    // IMPORTANTE: No revelar si el email existe o no (seguridad)
    if (!user) {
      return {
        mensaje:
          'Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    // Verificar rate limiting - no más de 3 intentos en 15 minutos
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentTokens = await this.prisma.passwordResetToken.count({
      where: {
        usuario_id: user.id,
        fecha_creacion: {
          gte: fifteenMinutesAgo,
        },
      },
    });

    if (recentTokens >= 3) {
      // No revelar el límite alcanzado al usuario
      return {
        mensaje:
          'Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    // Invalidar tokens anteriores del usuario
    await this.prisma.passwordResetToken.updateMany({
      where: {
        usuario_id: user.id,
        usado: false,
      },
      data: {
        usado: true,
      },
    });

    // Generar token único y seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Configurar expiración (1 hora)
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 60);

    // Guardar token en la base de datos
    await this.prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        usuario_id: user.id,
        fecha_expiracion: expirationDate,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });

    // Crear URL de reseteo
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://192.168.2.117:8080';
    const resetUrl = `${frontendUrl}/restablecer-password?token=${resetToken}`;

    // Enviar email con el enlace de recuperación
    try {
      this.logger.log(
        `Intentando enviar email de recuperación a: ${user.email}`,
      );
      this.logger.log(`URL de recuperación: ${resetUrl}`);
      const emailSent = await this.mailService.sendPasswordResetEmail(
        user.email,
        {
          nombre: user.nombre,
          resetUrl: resetUrl,
          resetToken: resetToken,
        },
      );
      if (emailSent) {
        this.logger.log(
          `Email de recuperación enviado exitosamente a: ${user.email}`,
        );
      } else {
        this.logger.warn(
          `El servicio de email retornó false para: ${user.email}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error al enviar email de recuperación a ${user.email}:`,
        error instanceof Error ? error.stack : error,
      );
      // No revelar el error al usuario por seguridad
    }

    return {
      mensaje:
        'Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
    };
  }

  /**
   * Verificar validez de token de reset
   */
  async verifyResetToken(token: string) {
    // Buscar todos los tokens no usados y no expirados
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: {
        usado: false,
        fecha_expiracion: {
          gt: new Date(),
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
          },
        },
      },
    });

    // Verificar el token contra los hashes
    for (const dbToken of tokens) {
      const isValid = await bcrypt.compare(token, dbToken.token);
      if (isValid) {
        return {
          valido: true,
          email: dbToken.usuario.email,
          nombre: dbToken.usuario.nombre,
        };
      }
    }

    throw new BadRequestException(
      'El token de recuperación es inválido o ha expirado',
    );
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Buscar tokens válidos
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: {
        usado: false,
        fecha_expiracion: {
          gt: new Date(),
        },
      },
      include: {
        usuario: true,
      },
    });

    // Verificar token
    let validToken: (typeof tokens)[0] | null = null;
    for (const dbToken of tokens) {
      const isValid = await bcrypt.compare(token, dbToken.token);
      if (isValid) {
        validToken = dbToken;
        break;
      }
    }

    if (!validToken) {
      throw new BadRequestException(
        'El token de recuperación es inválido o ha expirado',
      );
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña del usuario Y limpiar bloqueo
    await this.prisma.user.update({
      where: { id: validToken.usuario_id },
      data: { 
        password: hashedPassword,
        intentos_fallidos: 0,
        bloqueado_hasta: null,
      },
    });

    // Marcar token como usado
    await this.prisma.passwordResetToken.update({
      where: { id: validToken.id },
      data: { usado: true },
    });

    // Invalidar todos los refresh tokens del usuario (cerrar todas las sesiones)
    await this.usersService.updateRefreshToken(validToken.usuario_id, null);

    // Enviar email de confirmación
    try {
      await this.mailService.sendPasswordChangedEmail(
        validToken.usuario.email,
        {
          nombre: validToken.usuario.nombre,
        },
      );
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
    }

    return {
      mensaje:
        'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
    };
  }
}
