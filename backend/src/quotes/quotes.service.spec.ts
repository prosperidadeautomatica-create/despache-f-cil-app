import { Test, TestingModule } from '@nestjs/testing';
import { QuotesService } from './quotes.service';
import { FirestoreService } from '../firestore/firestore.service';
import { CarriersService } from '../carriers/carriers.service';
import { BillingService } from '../billing/billing.service';

describe('QuotesService', () => {
  let service: QuotesService;
  let firestoreService: jest.Mocked<FirestoreService>;
  let carriersService: jest.Mocked<CarriersService>;
  let billingService: jest.Mocked<BillingService>;

  beforeEach(async () => {
    const mockFirestoreService = {
      createQuote: jest.fn(),
      getQuote: jest.fn(),
      getQuotes: jest.fn(),
    };

    const mockCarriersService = {
      getQuote: jest.fn(),
    };

    const mockBillingService = {
      calculateFinalPrice: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        {
          provide: FirestoreService,
          useValue: mockFirestoreService,
        },
        {
          provide: CarriersService,
          useValue: mockCarriersService,
        },
        {
          provide: BillingService,
          useValue: mockBillingService,
        },
      ],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
    firestoreService = module.get(FirestoreService);
    carriersService = module.get(CarriersService);
    billingService = module.get(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createQuote', () => {
    it('should create a quote successfully', async () => {
      const request = {
        originPostal: '01310100',
        destinationPostal: '04547000',
        weight: 5.5,
        length: 30,
        width: 20,
        height: 10,
      };

      const carrierResponse = {
        negotiatedCost: 10.0,
        carrierServiceId: 'service123',
        serviceName: 'Express',
        estimatedDelivery: new Date().toISOString(),
        raw: {},
      };

      carriersService.getQuote.mockResolvedValue(carrierResponse);
      billingService.calculateFinalPrice.mockReturnValue(17.0);
      firestoreService.createQuote.mockResolvedValue(undefined);

      const result = await service.createQuote(
        'client123',
        request as any,
        'corr123',
      );

      expect(result).toHaveProperty('quoteId');
      expect(result.negotiatedCost).toBe(10.0);
      expect(result.finalPrice).toBe(17.0);
      expect(result.status).toBe('success');
      expect(firestoreService.createQuote).toHaveBeenCalled();
    });

    it('should handle carrier errors', async () => {
      const request = {
        originPostal: '01310100',
        destinationPostal: '04547000',
        weight: 5.5,
        length: 30,
        width: 20,
        height: 10,
      };

      carriersService.getQuote.mockRejectedValue(
        new Error('Carrier timeout'),
      );
      firestoreService.createQuote.mockResolvedValue(undefined);

      await expect(
        service.createQuote('client123', request as any, 'corr123'),
      ).rejects.toThrow();

      expect(firestoreService.createQuote).toHaveBeenCalled();
    });
  });
});

