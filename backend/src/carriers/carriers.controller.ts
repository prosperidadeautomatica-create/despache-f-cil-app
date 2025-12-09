import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CarriersService } from './carriers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('carriers')
@Controller('carriers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Get(':carrierName/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test carrier connection (dev only)' })
  @ApiResponse({
    status: 200,
    description: 'Carrier connection test successful',
    schema: {
      type: 'object',
      properties: {
        carrier: { type: 'string' },
        status: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Carrier unavailable' })
  async testCarrier(
    @Param('carrierName') carrierName: string,
    @Req() req: Request,
  ) {
    const correlationId = (req as any).correlationId || 'unknown';
    
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return {
        carrier: carrierName,
        status: 'disabled',
        message: 'Carrier test endpoint is disabled in production',
      };
    }

    try {
      // Test with a minimal request
      const testRequest = {
        originPostal: '01001000',
        destinationPostal: '20040002',
        weight: 1.0,
        length: 10,
        width: 10,
        height: 10,
      };

      await this.carriersService.getQuote(
        carrierName,
        testRequest as any,
        correlationId,
      );

      return {
        carrier: carrierName,
        status: 'ok',
        message: 'Carrier connection test successful',
      };
    } catch (error: any) {
      return {
        carrier: carrierName,
        status: 'error',
        message: error.message || 'Carrier connection test failed',
        error: error.code || 'UNKNOWN_ERROR',
      };
    }
  }
}

