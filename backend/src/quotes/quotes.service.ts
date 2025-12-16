import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { v4 as uuidv4 } from 'uuid';
import { FirestoreService } from '../firestore/firestore.service';
import { CarriersService } from '../carriers/carriers.service';
import { BillingService } from '../billing/billing.service';
import { QuoteRequestDto } from './dto/quote-request.dto';
import { Quote, QuoteStatus } from './interfaces/quote.interface';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private firestoreService: FirestoreService,
    private carriersService: CarriersService,
    private billingService: BillingService,
    private i18n: I18nService,
  ) {}

  async createQuote(
    clientId: string,
    request: QuoteRequestDto,
    correlationId: string,
  ): Promise<Quote> {
    const quoteId = uuidv4();
    const startTime = Date.now();

    // Convert DTO to plain object for Firestore serialization
    // Use JSON.parse/stringify to ensure it's a completely plain object
    const requestPayload = JSON.parse(JSON.stringify({
      originPostal: request.originPostal,
      destinationPostal: request.destinationPostal,
      weight: request.weight,
      length: request.length,
      width: request.width,
      height: request.height,
      serviceOptions: request.serviceOptions || undefined,
      declaredValue: request.declaredValue || undefined,
    }));

    const quote: Quote = {
      quoteId,
      clientId,
      carrier: 'frenet', // Default carrier for MVP
      service: '',
      negotiatedCost: 0,
      finalPrice: 0,
      status: 'processing',
      createdAt: new Date().toISOString(),
      correlationId,
      originPostal: request.originPostal,
      destinationPostal: request.destinationPostal,
      weight: request.weight,
      dimensions: {
        length: request.length,
        width: request.width,
        height: request.height,
      },
      serviceOptions: request.serviceOptions,
      declaredValue: request.declaredValue,
      requestPayload,
    };

    try {
      // Get quote from carrier
      const carrierResponse = await this.carriersService.getQuote(
        'frenet',
        request,
        correlationId,
      );

      // Calculate final price
      const finalPrice = this.billingService.calculateFinalPrice(
        carrierResponse.negotiatedCost,
      );

      // Update quote with carrier response
      quote.negotiatedCost = carrierResponse.negotiatedCost;
      quote.finalPrice = finalPrice;
      quote.service = carrierResponse.serviceName || carrierResponse.carrierServiceId;
      quote.estimatedDelivery = carrierResponse.estimatedDelivery;
      quote.status = 'success';
      quote.carrierResponse = carrierResponse.raw;
      quote.metadata = {
        carrier: 'frenet',
        serviceType: carrierResponse.carrierServiceId,
      };

      // Persist to Firestore
      await this.firestoreService.createQuote(clientId, quote);

      const duration = Date.now() - startTime;
      this.logger.log(
        `[${correlationId}] Quote created successfully: ${quoteId} (${duration}ms)`,
      );

      return quote;
    } catch (error: any) {
      // Handle carrier errors
      quote.status =
        error.code === 'CARRIER_TIMEOUT' ? 'carrier_timeout' : 'error';
      quote.carrierResponse = {
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      };

      // Persist failed quote
      await this.firestoreService.createQuote(clientId, quote).catch((err) => {
        this.logger.error(
          `[${correlationId}] Failed to persist error quote: ${err.message}`,
        );
      });

      const duration = Date.now() - startTime;
      this.logger.error(
        `[${correlationId}] Quote creation failed: ${quoteId} (${duration}ms) - ${error.message}`,
      );

      throw new HttpException(
        {
          code: error.code || 'QUOTE_ERROR',
          message: error.message || this.i18n.t('quote.FAILED_TO_CREATE'),
          correlationId,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getQuote(clientId: string, quoteId: string): Promise<Quote> {
    const quote = await this.firestoreService.getQuote(clientId, quoteId);
    if (!quote) {
      throw new HttpException(
        this.i18n.t('quote.QUOTE_NOT_FOUND'),
        HttpStatus.NOT_FOUND,
      );
    }
    return quote;
  }

  async getQuotes(
    clientId: string,
    filters?: {
      limit?: number;
      cursor?: string;
      status?: string;
      carrier?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ quotes: Quote[]; nextCursor?: string }> {
    return this.firestoreService.getQuotes(clientId, filters);
  }
}

