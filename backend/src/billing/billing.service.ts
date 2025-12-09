import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BillingService {
  private readonly markupPercent: number;
  private readonly fixedFee: number;

  constructor(private configService: ConfigService) {
    this.markupPercent =
      this.configService.get<number>('BILLING_MARKUP_PERCENT', 20) / 100;
    this.fixedFee = this.configService.get<number>('BILLING_FIXED_FEE', 5.0);
  }

  /**
   * Calculate final sale price based on negotiated cost
   * Formula: P_venda = negotiated_cost * 1.20 + 5.00
   * @param negotiatedCost - The cost negotiated with the carrier
   * @returns Final price to charge the client
   */
  calculateFinalPrice(negotiatedCost: number): number {
    if (negotiatedCost < 0) {
      throw new Error('Negotiated cost cannot be negative');
    }

    // Formula: P_venda = negotiated_cost * (1 + markup_percent) + fixed_fee
    const finalPrice = negotiatedCost * (1 + this.markupPercent) + this.fixedFee;

    // Round to 2 decimal places
    return Math.round(finalPrice * 100) / 100;
  }

  /**
   * Get billing configuration
   */
  getBillingConfig() {
    return {
      markupPercent: this.markupPercent * 100,
      fixedFee: this.fixedFee,
    };
  }
}

