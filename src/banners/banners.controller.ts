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
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermisoTemporalGuard } from '../auth/guards/permiso-temporal.guard';
import { RequierePermiso } from '../auth/decorators/permiso-temporal.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Banners')
@Controller('tienda/banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los banners' })
  async findAll() {
    const data = await this.bannersService.findAll();
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un banner por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.bannersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermisoTemporalGuard)
  @RequierePermiso('banners')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo banner (administradores o vendedores con permiso)' })
  async create(@Body() createBannerDto: CreateBannerDto) {
    return await this.bannersService.create(createBannerDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermisoTemporalGuard)
  @RequierePermiso('banners')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un banner existente (administradores o vendedores con permiso)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
  ) {
    return await this.bannersService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermisoTemporalGuard)
  @RequierePermiso('banners')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un banner (administradores o vendedores con permiso)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.bannersService.remove(id);
  }
}
