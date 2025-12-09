import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CarrierAdapter } from '../interfaces/carrier-adapter.interface';
import { QuoteRequestDto } from '../../quotes/dto/quote-request.dto';
import { NormalizedCarrierResponse } from '../interfaces/normalized-carrier-response.interface';

@Injectable()
export class FrenetAdapter implements CarrierAdapter {
  private readonly apiKey: string;
  private readonly token: string | undefined;
  private readonly baseUrl = 'https://api.frenet.com.br';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('CARRIER_FRENET_APIKEY') || '';
    this.token = this.configService.get<string>('CARRIER_FRENET_TOKEN');
  }

  getCarrierName(): string {
    return 'frenet';
  }

  normalizeRequest(request: QuoteRequestDto): any {
    // Frenet API request format
    return {
      zipCodeOrigin: request.originPostal.replace(/\D/g, ''),
      zipCodeDestination: request.destinationPostal.replace(/\D/g, ''),
      products: [
        {
          weight: request.weight,
          height: request.height,
          width: request.width,
          length: request.length,
          quantity: 1,
        },
      ],
      declaredValue: request.declaredValue || 0,
      services: request.serviceOptions || [],
    };
  }

  async callCarrier(carrierRequest: any): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      token: this.token || this.apiKey,
    };

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/shipping/quote`,
        carrierRequest,
        { headers },
      ),
    );

    return response.data;
  }

  normalizeResponse(
    carrierResponse: any,
    originalRequest: QuoteRequestDto,
  ): NormalizedCarrierResponse {
    // Frenet returns an array of shipping options
    // For MVP, we'll take the first available option
    if (!carrierResponse || !Array.isArray(carrierResponse) || carrierResponse.length === 0) {
      throw new Error('No shipping options available from Frenet');
    }

    const firstOption = carrierResponse[0];
    const shippingServices = firstOption.shippingServices || [];

    if (shippingServices.length === 0) {
      throw new Error('No shipping services available from Frenet');
    }

    // Get the first service (or best service based on price)
    const bestService = shippingServices.reduce((prev: any, curr: any) => {
      return prev.shippingPrice < curr.shippingPrice ? prev : curr;
    });

    return {
      negotiatedCost: bestService.shippingPrice || 0,
      carrierServiceId: bestService.serviceCode || '',
      estimatedDelivery: bestService.deliveryTime
        ? this.calculateEstimatedDelivery(bestService.deliveryTime)
        : undefined,
      serviceName: bestService.serviceName || bestService.serviceCode || '',
      raw: bestService,
    };
  }

  private calculateEstimatedDelivery(deliveryTime: number): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryTime);
    return deliveryDate.toISOString();
  }
}

