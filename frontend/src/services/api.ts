import { Quote, QuoteRequest } from '@/types/quote';

// API base URL configuration
// Automatically detects if served from same origin (backend) and uses relative path
// Otherwise uses full URL for development
const getApiBase = () => {
  // Check for environment variable override
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // If we're on the same origin as the backend (production build served from backend)
  // Use relative path - this works because frontend and backend are on same port
  // In development mode, Vite runs on different port, so use full URL
  if (typeof window !== 'undefined') {
    // Check if we're likely being served from the backend (same origin)
    // Backend typically runs on port 3000, frontend dev on 5173
    const isProduction = window.location.port === '' || 
                        window.location.port === '3000' ||
                        window.location.hostname !== 'localhost';
    
    if (isProduction || import.meta.env.PROD) {
      return '/api';
    }
  }
  
  // Development mode - use full URL
  return 'http://localhost:3000/api';
};

const API_BASE = getApiBase();

interface ApiError {
  code: string;
  message: string;
  correlationId?: string;
}

// Global handler for 401 errors
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Initialize token from localStorage
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Always try to get token from localStorage in case it was updated elsewhere
    const token = this.token || localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('clientId');
        if (onUnauthorized) {
          onUnauthorized();
        }
        const error: ApiError = await response.json().catch(() => ({
          code: 'UNAUTHORIZED',
          message: 'Session expired. Please login again.',
        }));
        throw error;
      }

      const error: ApiError = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      }));
      throw error;
    }

    return response.json();
  }

  async postQuote(payload: QuoteRequest): Promise<Quote> {
    return this.request<Quote>('/quotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getQuotes(params?: {
    limit?: number;
    cursor?: string;
    status?: string;
    carrier?: string;
    startDate?: string;
    endDate?: string;
    enableRealtime?: boolean; // Frontend-only option, filtered out before sending
  }): Promise<{ quotes: Quote[]; nextCursor?: string }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Filter out frontend-only options that shouldn't be sent to backend
        if (key === 'enableRealtime') return;
        if (value) searchParams.append(key, value.toString());
      });
    }

    return this.request<{ quotes: Quote[]; nextCursor?: string }>(
      `/quotes?${searchParams.toString()}`
    );
  }

  async getQuote(id: string): Promise<Quote> {
    return this.request<Quote>(`/quotes/${id}`);
  }

  async signup(credentials: {
    email: string;
    name: string;
    password: string;
  }): Promise<{ token: string; clientId: string; name: string }> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ token: string; clientId: string; name: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async generateLabel(quoteId: string): Promise<{
    labelId: string;
    labelUrl: string;
    pdfBase64?: string;
  }> {
    return this.request('/labels', {
      method: 'POST',
      body: JSON.stringify({ quoteId }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE);
export type { ApiError };