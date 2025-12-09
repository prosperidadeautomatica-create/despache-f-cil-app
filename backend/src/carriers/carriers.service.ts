import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuoteRequestDto } from '../quotes/dto/quote-request.dto';
import { NormalizedCarrierResponse } from './interfaces/normalized-carrier-response.interface';
import { CarrierAdapter } from './interfaces/carrier-adapter.interface';
import { FrenetAdapter } from './adapters/frenet.adapter';
import { CircuitBreakerService } from './circuit-breaker.service';

@Injectable()
export class CarriersService {
  private readonly logger = new Logger(CarriersService.name);
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly adapters: Map<string, CarrierAdapter> = new Map();

  constructor(
    private configService: ConfigService,
    private frenetAdapter: FrenetAdapter,
    private circuitBreakerService: CircuitBreakerService,
  ) {
    this.timeout =
      this.configService.get<number>('CARRIER_TIMEOUT_MS', 10000) || 10000;
    this.retryAttempts =
      this.configService.get<number>('CARRIER_RETRY_ATTEMPTS', 1) || 1;

    // Register adapters
    this.adapters.set('frenet', this.frenetAdapter);
  }

  /**
   * Get quote from carrier with timeout, retry, and circuit breaker
   */
  async getQuote(
    carrierName: string,
    request: QuoteRequestDto,
    correlationId: string,
  ): Promise<NormalizedCarrierResponse> {
    const adapter = this.adapters.get(carrierName.toLowerCase());
    if (!adapter) {
      throw new HttpException(
        `Carrier ${carrierName} not supported`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check circuit breaker
    if (this.circuitBreakerService.isOpen(carrierName)) {
      this.logger.warn(
        `[${correlationId}] Circuit breaker is OPEN for carrier: ${carrierName}`,
      );
      throw new HttpException(
        `Carrier ${carrierName} is temporarily unavailable`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const normalizedRequest = adapter.normalizeRequest(request);

    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          const backoffDelay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          this.logger.log(
            `[${correlationId}] Retrying carrier call (attempt ${attempt + 1}/${this.retryAttempts + 1}) after ${backoffDelay}ms`,
          );
          await this.sleep(backoffDelay);
        }

        // Call with timeout
        const response = await Promise.race([
          adapter.callCarrier(normalizedRequest),
          this.createTimeoutPromise(),
        ]);

        // Normalize response
        const normalizedResponse = adapter.normalizeResponse(
          response,
          request,
        );

        // Record success
        this.circuitBreakerService.recordSuccess(carrierName);

        this.logger.log(
          `[${correlationId}] Successfully got quote from ${carrierName}: ${normalizedResponse.negotiatedCost}`,
        );

        return normalizedResponse;
      } catch (error: any) {
        lastError = error;
        this.logger.error(
          `[${correlationId}] Carrier call failed (attempt ${attempt + 1}): ${error.message}`,
        );

        // If it's the last attempt, record failure
        if (attempt === this.retryAttempts) {
          const circuitOpened = this.circuitBreakerService.recordFailure(
            carrierName,
          );
          if (circuitOpened) {
            this.logger.warn(
              `[${correlationId}] Circuit breaker opened for carrier: ${carrierName}`,
            );
          }
        }
      }
    }

    // All retries failed
    throw new HttpException(
      {
        code: 'CARRIER_TIMEOUT',
        message: `Failed to get quote from ${carrierName} after ${this.retryAttempts + 1} attempts: ${lastError?.message}`,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Carrier API timeout after ${this.timeout}ms`));
      }, this.timeout);
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get available carriers
   */
  getAvailableCarriers(): string[] {
    return Array.from(this.adapters.keys());
  }
}

