import { CorsOptions } from 'cors';

/**
 * CORS configuration for the API
 * Configures Cross-Origin Resource Sharing settings
 */
export const corsConfig: CorsOptions = {
  // Allow origins based on environment
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Development environment - allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Production environment - check allowed origins
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Origin not allowed
    const message = `CORS policy: Origin ${origin} is not allowed`;
    return callback(new Error(message), false);
  },

  // Allowed HTTP methods
  methods: process.env.CORS_METHODS?.split(',') || [
    'GET',
    'HEAD',
    'PUT',
    'PATCH',
    'POST',
    'DELETE',
    'OPTIONS'
  ],

  // Allowed headers
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',') || [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key'
  ],

  // Headers exposed to the client
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Page-Size', 'X-Current-Page', 'Link'],

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Preflight request cache time (in seconds)
  maxAge: 86400, // 24 hours

  // Handle preflight requests
  preflightContinue: false,

  // Provide successful OPTIONS response
  optionsSuccessStatus: 204
};

/**
 * CORS configuration for development environment
 * More permissive settings for development
 */
export const devCorsConfig: CorsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key',
    'Cache-Control'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Page-Size', 'X-Current-Page', 'Link'],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

/**
 * CORS configuration for production environment
 * More restrictive settings for production
 */
export const prodCorsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400,
  optionsSuccessStatus: 204
};

/**
 * Get CORS configuration based on environment
 */
export const getCorsConfig = (): CorsOptions => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return prodCorsConfig;
    case 'development':
      return devCorsConfig;
    default:
      return corsConfig;
  }
};
