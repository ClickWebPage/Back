import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { GarantiasService } from './garantias.service';
import { CreateGarantiaDto } from './dto/create-garantia.dto';
import { UpdateGarantiaDto } from './dto/update-garantia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('garantias')
export class GarantiasController {
  constructor(private readonly garantiasService: GarantiasService) {}

  // Endpoints públicos
  @Get('activas')
  findAllActive() {
    return this.garantiasService.findAllActive();
  }

  @Get('marca/:marca')
  findByMarca(@Param('marca') marca: string) {
    return this.garantiasService.findByMarca(marca);
  }

  // Endpoints protegidos (solo admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createGarantiaDto: CreateGarantiaDto) {
    return this.garantiasService.create(createGarantiaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.garantiasService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('marcas-productos')
  getMarcasProductos() {
    return this.garantiasService.getMarcasProductos();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.garantiasService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGarantiaDto: UpdateGarantiaDto,
  ) {
    return this.garantiasService.update(id, updateGarantiaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.garantiasService.remove(id);
  }
}
