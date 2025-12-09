import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().default('http://localhost:5173'),

  // JWT Configuration
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  // Firebase Configuration
  // If FIREBASE_CREDENTIALS_PATH is provided, these are optional
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  FIREBASE_CREDENTIALS_PATH: Joi.string().default('serviceAccountKey.json'),

  // Carrier API Keys
  CARRIER_FRENET_APIKEY: Joi.string().optional(),
  CARRIER_FRENET_TOKEN: Joi.string().optional(),

  // Carrier Configuration
  CARRIER_TIMEOUT_MS: Joi.number().default(10000),
  CARRIER_RETRY_ATTEMPTS: Joi.number().default(1),
  CARRIER_CIRCUIT_BREAKER_THRESHOLD: Joi.number().default(5),

  // Billing Configuration
  BILLING_MARKUP_PERCENT: Joi.number().default(20),
  BILLING_FIXED_FEE: Joi.number().default(5.0),
});

