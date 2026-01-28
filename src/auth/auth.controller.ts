import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Query,
  Ip,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user: {
    userId: number;
    username: string;
    rol: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registro de nuevo usuario
   * POST /auth/registro
   */
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * Login de usuario
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * Logout (invalidar refresh token)
   * POST /auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: AuthRequest) {
    return await this.authService.logout(req.user.userId);
  }

  /**
   * Refrescar access token
   * POST /auth/refresh
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Request() req: AuthRequest,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    return await this.authService.refreshTokens(
      req.user.userId,
      refreshTokenDto.refresh_token,
    );
  }

  /**
   * Verificar si el token es válido
   * GET /auth/verificar
   */
  @UseGuards(JwtAuthGuard)
  @Get('verificar')
  verify(@Request() req: AuthRequest) {
    return {
      valido: true,
      usuario: {
        id: req.user.userId,
        username: req.user.username,
        rol: req.user.rol,
      },
    };
  }

  /**
   * Solicitar recuperación de contraseña
   * POST /auth/forgot-password
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return await this.authService.requestPasswordReset(
      forgotPasswordDto,
      ip,
      userAgent,
    );
  }

  /**
   * Verificar token de recuperación
   * GET /auth/verify-reset-token?token=xxx
   */
  @Get('verify-reset-token')
  @HttpCode(HttpStatus.OK)
  async verifyResetToken(@Query('token') token: string) {
    return await this.authService.verifyResetToken(token);
  }

  /**
   * Restablecer contraseña con token
   * POST /auth/reset-password
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
