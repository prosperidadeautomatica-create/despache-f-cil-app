import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { AuthModule } from '../auth/auth.module';
import { CarriersModule } from '../carriers/carriers.module';
import { BillingModule } from '../billing/billing.module';
import { FirestoreModule } from '../firestore/firestore.module';

@Module({
  imports: [AuthModule, CarriersModule, BillingModule, FirestoreModule],
  controllers: [QuotesController],
  providers: [QuotesService],
  exports: [QuotesService],
})
export class QuotesModule {}

