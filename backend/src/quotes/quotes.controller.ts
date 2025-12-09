import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { QuoteRequestDto } from './dto/quote-request.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentClient } from '../auth/decorators/current-client.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('quotes')
@Controller('quotes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shipping quote' })
  @ApiResponse({
    status: 201,
    description: 'Quote created successfully',
    type: QuoteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Carrier unavailable' })
  async createQuote(
    @Body() request: QuoteRequestDto,
    @CurrentClient() client: any,
    @Req() req: Request,
  ): Promise<QuoteResponseDto> {
    const correlationId = (req as any).correlationId || 'unknown';
    const quote = await this.quotesService.createQuote(
      client.clientId,
      request,
      correlationId,
    );
    return this.mapToResponseDto(quote);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of quotes' })
  @ApiResponse({
    status: 200,
    description: 'List of quotes',
    type: [QuoteResponseDto],
  })
  async getQuotes(
    @Query() filters: PaginationDto,
    @CurrentClient() client: any,
  ) {
    const result = await this.quotesService.getQuotes(client.clientId, filters);
    return {
      quotes: result.quotes.map((q) => this.mapToResponseDto(q)),
      nextCursor: result.nextCursor,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  @ApiResponse({
    status: 200,
    description: 'Quote details',
    type: QuoteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  async getQuote(
    @Param('id') quoteId: string,
    @CurrentClient() client: any,
  ): Promise<QuoteResponseDto> {
    const quote = await this.quotesService.getQuote(client.clientId, quoteId);
    return this.mapToResponseDto(quote);
  }

  private mapToResponseDto(quote: any): QuoteResponseDto {
    return {
      quoteId: quote.quoteId,
      carrier: quote.carrier,
      service: quote.service,
      negotiatedCost: quote.negotiatedCost,
      finalPrice: quote.finalPrice,
      status: quote.status,
      createdAt: quote.createdAt,
      correlationId: quote.correlationId,
      estimatedDelivery: quote.estimatedDelivery,
      originPostal: quote.originPostal,
      destinationPostal: quote.destinationPostal,
      weight: quote.weight,
      dimensions: quote.dimensions,
      serviceOptions: quote.serviceOptions,
      declaredValue: quote.declaredValue,
    };
  }
}

