import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from './dto/update-service-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { Request as ExpressRequest } from 'express';
import { Prisma, ServiceOrder } from '@prisma/client';

interface AuthRequest extends ExpressRequest {
  user: {
    userId: number;
    username: string;
    rol: string;
  };
}

@Controller('ordenes-servicio')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: AuthRequest,
    @Body() dto: CreateServiceOrderDto,
  ): Promise<ServiceOrder> {
    return this.serviceOrdersService.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findMyServiceOrders(
    @Request() req: AuthRequest,
  ): Promise<Prisma.ServiceOrderGetPayload<{ include: { product: true } }>[]> {
    return this.serviceOrdersService.findUserServiceOrders(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Request() req: AuthRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Prisma.ServiceOrderGetPayload<{ include: { product: true; user: true } }>> {
    return this.serviceOrdersService.findOneForUser(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/estado')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceOrderStatusDto,
  ): Promise<ServiceOrder> {
    return this.serviceOrdersService.updateStatus(id, dto);
  }
}
