import { QuoteRequestDto } from '../../quotes/dto/quote-request.dto';
import { NormalizedCarrierResponse } from './normalized-carrier-response.interface';

export interface CarrierAdapter {
  /**
   * Normalize user request to carrier-specific request format
   */
  normalizeRequest(request: QuoteRequestDto): any;

  /**
   * Call carrier API with the normalized request
   */
  callCarrier(carrierRequest: any): Promise<any>;

  /**
   * Normalize carrier response to standard format
   */
  normalizeResponse(
    carrierResponse: any,
    originalRequest: QuoteRequestDto,
  ): NormalizedCarrierResponse;

  /**
   * Get carrier name
   */
  getCarrierName(): string;
}

