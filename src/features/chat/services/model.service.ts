/**
 * Model Service
 * 
 * Handles all model-related API calls
 */

import { apiRequest, handleApiError } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import type { Model } from '../types';
import type { ApiResponse } from '@/types/api';

/**
 * Models List Response
 */
export interface ModelsListResponse {
  models: Model[];
}

/**
 * Model Details
 */
export interface ModelDetails extends Model {
  description?: string;
  parameters?: Record<string, any>;
  capabilities?: string[];
}

/**
 * Get all available models
 */
export async function getModels(): Promise<Model[]> {
  try {
    const response = await apiRequest<ModelsListResponse>({
      method: 'GET',
      url: API_ENDPOINTS.MODELS.LIST,
    });
    return response.models || [];
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get details of a specific model
 */
export async function getModelDetails(modelName: string): Promise<ModelDetails> {
  try {
    return await apiRequest<ModelDetails>({
      method: 'GET',
      url: `${API_ENDPOINTS.MODELS.BASE}/${modelName}`,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Check if a model is available
 */
export async function isModelAvailable(modelName: string): Promise<boolean> {
  try {
    const models = await getModels();
    return models.some((model) => model.name === modelName);
  } catch (error) {
    console.error('Error checking model availability:', error);
    return false;
  }
}

