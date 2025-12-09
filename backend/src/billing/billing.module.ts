import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingService } from './billing.service';

@Module({
  imports: [ConfigModule],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}

