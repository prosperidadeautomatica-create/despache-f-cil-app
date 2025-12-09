import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                BILLING_MARKUP_PERCENT: 20,
                BILLING_FIXED_FEE: 5.0,
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateFinalPrice', () => {
    it('should calculate final price correctly with default values', () => {
      // Formula: P_venda = negotiated_cost * 1.20 + 5.00
      const negotiatedCost = 10.0;
      const expected = 10.0 * 1.2 + 5.0; // 17.0
      const result = service.calculateFinalPrice(negotiatedCost);
      expect(result).toBe(17.0);
    });

    it('should handle zero negotiated cost', () => {
      const result = service.calculateFinalPrice(0);
      expect(result).toBe(5.0); // Only fixed fee
    });

    it('should round to 2 decimal places', () => {
      const negotiatedCost = 12.345;
      const result = service.calculateFinalPrice(negotiatedCost);
      // 12.345 * 1.2 + 5.0 = 19.814 -> 19.81
      expect(result).toBe(19.81);
    });

    it('should throw error for negative negotiated cost', () => {
      expect(() => service.calculateFinalPrice(-10)).toThrow(
        'Negotiated cost cannot be negative',
      );
    });

    it('should handle large values', () => {
      const negotiatedCost = 1000.0;
      const expected = 1000.0 * 1.2 + 5.0; // 1205.0
      const result = service.calculateFinalPrice(negotiatedCost);
      expect(result).toBe(1205.0);
    });

    it('should handle decimal values correctly', () => {
      const negotiatedCost = 12.34;
      const expected = 12.34 * 1.2 + 5.0; // 19.808 -> 19.81
      const result = service.calculateFinalPrice(negotiatedCost);
      expect(result).toBe(19.81);
    });
  });

  describe('getBillingConfig', () => {
    it('should return billing configuration', () => {
      const config = service.getBillingConfig();
      expect(config).toEqual({
        markupPercent: 20,
        fixedFee: 5.0,
      });
    });
  });
});

