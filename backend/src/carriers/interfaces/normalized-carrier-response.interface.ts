export interface NormalizedCarrierResponse {
  negotiatedCost: number;
  carrierServiceId: string;
  estimatedDelivery?: string;
  serviceName?: string;
  raw: Record<string, any>;
}

