export type QuoteStatus = 'pending' | 'success' | 'error' | 'processing';

export interface Quote {
  quoteId: string;
  carrier: string;
  service: string;
  negotiatedCost: number;
  finalPrice: number;
  status: QuoteStatus;
  createdAt: string;
  correlationId: string;
  estimatedDelivery?: string;
  originPostal: string;
  destinationPostal: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  serviceOptions?: string[];
  declaredValue?: number;
  carrierResponse?: Record<string, unknown>;
}

export interface QuoteRequest {
  originPostal: string;
  destinationPostal: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  serviceOptions?: string[];
  declaredValue?: number;
}

export interface PriceBreakdown {
  negotiatedCost: number;
  markupPercent: number;
  fixedFee: number;
  finalPrice: number;
  currency: 'BRL' | 'USD';
}
