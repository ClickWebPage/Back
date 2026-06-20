import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { FilterProductsDto } from './dto/filter-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
@Controller('tienda/productos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDEDOR)
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  // Endpoint para admin - muestra TODOS los productos sin filtros de stock/precio
  @Get('admin/todos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDEDOR)
  async findAllAdmin(@Query() filters: FilterProductsDto) {
    console.log('=== PRODUCTS CONTROLLER - findAllAdmin (sin filtros de stock) ===');
    return await this.productsService.findAllAdmin(filters);
  }

  @Get()
  async findAll(@Query() filters: FilterProductsDto) {
    try {
      console.log('=== PRODUCTS CONTROLLER - findAll ===');
      console.log('Received filters:', JSON.stringify(filters));
      const result = await this.productsService.findAll(filters);
      console.log('Controller result count:', result.data.length, 'of', result.total);
      return result;
    } catch (error) {
      console.error('=== CONTROLLER ERROR ===');
      console.error('Error in controller:', error);
      throw error;
    }
  }

  @Get('marcas/lista')
  async getMarcas() {
    return await this.productsService.getMarcas();
  }

  @Get('categorias/lista')
  async getCategorias() {
    return await this.productsService.getCategorias();
  }

  @Get(':codigo')
  async findOne(@Param('codigo', ParseIntPipe) codigo: number) {
    const producto = await this.productsService.findOne(codigo);
    if (!producto) {
      throw new NotFoundException(`Producto con código ${codigo} no encontrado`);
    }
    return producto;
  }

  @Put(':codigo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.VENDEDOR)
  async update(
    @Param('codigo', ParseIntPipe) codigo: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    console.log('=== CONTROLLER UPDATE - Codigo:', codigo, '===');
    console.log('=== CONTROLLER UPDATE - Body:', JSON.stringify(updateProductDto) ,'===');
    return await this.productsService.update(codigo, updateProductDto);
  }

  @Delete(':codigo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('codigo', ParseIntPipe) codigo: number) {
    console.log('=== CONTROLLER DELETE - Codigo:', codigo, '===');
    console.log('=== ATENCIÓN: Se está eliminando un producto ===');
    return await this.productsService.remove(codigo);
  }
}
