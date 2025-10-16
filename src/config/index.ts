/**
 * Configuration Module
 * 
 * Central export for all configuration
 */

export { env, publicEnv, validateEnv } from './env';

/**
 * Application Constants
 */
export const APP_CONFIG = {
  name: 'Cognix',
  version: '1.0.0',
  description: 'AI Chat Interface with Memory',
  
  // Chat Configuration
  chat: {
    maxMessageLength: 4000,
    streamingEnabled: true,
    defaultStreamingMode: true,
  },
  
  // UI Configuration
  ui: {
    defaultTheme: 'system' as const,
    themes: ['light', 'dark', 'system'] as const,
  },
  
  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
  },
} as const;

