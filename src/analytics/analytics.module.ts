import { Module } from '@nestjs/common';
import { AnalyticsController, AnalyticsTrackingController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  controllers: [AnalyticsController, AnalyticsTrackingController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
