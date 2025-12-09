import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

@Injectable()
export class CircuitBreakerService {
  private breakers: Map<string, CircuitBreakerState> = new Map();
  private readonly threshold: number;
  private readonly resetTimeout: number = 60000; // 1 minute

  constructor(private configService: ConfigService) {
    this.threshold =
      this.configService.get<number>(
        'CARRIER_CIRCUIT_BREAKER_THRESHOLD',
        5,
      ) || 5;
  }

  /**
   * Record a successful call
   */
  recordSuccess(carrierName: string): void {
    const breaker = this.breakers.get(carrierName);
    if (breaker) {
      breaker.failures = 0;
      breaker.isOpen = false;
    }
  }

  /**
   * Record a failure and check if circuit should open
   */
  recordFailure(carrierName: string): boolean {
    let breaker = this.breakers.get(carrierName);
    if (!breaker) {
      breaker = {
        failures: 0,
        lastFailureTime: 0,
        isOpen: false,
      };
      this.breakers.set(carrierName, breaker);
    }

    breaker.failures++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failures >= this.threshold) {
      breaker.isOpen = true;
      return true;
    }

    return false;
  }

  /**
   * Check if circuit breaker is open
   */
  isOpen(carrierName: string): boolean {
    const breaker = this.breakers.get(carrierName);
    if (!breaker || !breaker.isOpen) {
      return false;
    }

    // Check if reset timeout has passed
    if (Date.now() - breaker.lastFailureTime > this.resetTimeout) {
      breaker.isOpen = false;
      breaker.failures = 0;
      return false;
    }

    return true;
  }

  /**
   * Get circuit breaker state
   */
  getState(carrierName: string): CircuitBreakerState | null {
    return this.breakers.get(carrierName) || null;
  }
}

