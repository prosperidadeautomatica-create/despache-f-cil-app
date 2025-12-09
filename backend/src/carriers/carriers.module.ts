import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CarriersService } from './carriers.service';
import { CarriersController } from './carriers.controller';
import { FrenetAdapter } from './adapters/frenet.adapter';
import { CircuitBreakerService } from './circuit-breaker.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, HttpModule, AuthModule],
  controllers: [CarriersController],
  providers: [CarriersService, FrenetAdapter, CircuitBreakerService],
  exports: [CarriersService],
})
export class CarriersModule {}

