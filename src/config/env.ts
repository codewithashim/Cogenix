/**
 * Environment Configuration
 * 
 * Centralized access to environment variables.
 * All environment variables should be accessed through this file.
 */

// Server-side environment variables
export const env = {
  // Backend URLs
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  
  // Model Configuration
  defaultModel: process.env.DEFAULT_MODEL || 'llama2:latest',
  
  // Node Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Database
  mongodbUri: process.env.MONGODB_URI,
  
  // API Keys (optional)
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  
  // Security (optional)
  jwtSecret: process.env.JWT_SECRET,
} as const;

// Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const required: (keyof typeof env)[] = [
    // Add required env vars here
    // 'ollamaUrl',
  ];

  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }
}

// Validate on import (only in production)
if (env.isProduction) {
  validateEnv();
}

