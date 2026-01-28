import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BannersModule } from './banners/banners.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PromotionsModule } from './promotions/promotions.module';
import { SiteConfigModule } from './site-config/site-config.module';
import { PermisosModule } from './permisos/permisos.module';
import { ImagesModule } from './images/images.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Base de datos con Prisma
    PrismaModule,
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    BannersModule,
    ProductsModule,
    OrdersModule,
    ServiceOrdersModule,
    WorkOrdersModule,
    AnalyticsModule,
    PromotionsModule,
    SiteConfigModule,
    PermisosModule,
    ImagesModule,
    NotificationsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
