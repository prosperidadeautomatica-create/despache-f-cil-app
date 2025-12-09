export type QuoteStatus = 'pending' | 'success' | 'error' | 'processing' | 'carrier_timeout';

export interface Quote {
  quoteId: string;
  clientId: string;
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
  carrierResponse?: Record<string, any>;
  requestPayload?: Record<string, any>;
  metadata?: {
    carrier: string;
    serviceType: string;
  };
  labelGenerated?: boolean;
  labelId?: string;
  labelGeneratedAt?: string;
  updatedAt?: string;
}

