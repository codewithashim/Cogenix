/**
 * Memory Service
 * 
 * Handles all memory/context-related API calls
 */

import { apiRequest, handleApiError } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import type { MemoryContext } from '../types';
import type { ApiResponse } from '@/types/api';

/**
 * Memory Response
 */
export interface MemoryResponse {
  contexts: MemoryContext[];
  total: number;
}

/**
 * Clear Memory Response
 */
export interface ClearMemoryResponse {
  success: boolean;
  message: string;
}

/**
 * Get all memory contexts
 */
export async function getMemoryContexts(): Promise<MemoryContext[]> {
  try {
    const response = await apiRequest<MemoryResponse>({
      method: 'GET',
      url: API_ENDPOINTS.MEMORY.BASE,
    });
    return response.contexts || [];
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Clear all memory contexts
 */
export async function clearMemory(): Promise<ClearMemoryResponse> {
  try {
    return await apiRequest<ClearMemoryResponse>({
      method: 'POST',
      url: API_ENDPOINTS.MEMORY.CLEAR,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Add a new memory context
 */
export async function addMemoryContext(context: Omit<MemoryContext, 'id'>): Promise<MemoryContext> {
  try {
    return await apiRequest<MemoryContext>({
      method: 'POST',
      url: API_ENDPOINTS.MEMORY.BASE,
      data: context,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Update a memory context
 */
export async function updateMemoryContext(
  id: string,
  context: Partial<MemoryContext>
): Promise<MemoryContext> {
  try {
    return await apiRequest<MemoryContext>({
      method: 'PUT',
      url: `${API_ENDPOINTS.MEMORY.BASE}/${id}`,
      data: context,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Delete a memory context
 */
export async function deleteMemoryContext(id: string): Promise<void> {
  try {
    await apiRequest<void>({
      method: 'DELETE',
      url: `${API_ENDPOINTS.MEMORY.BASE}/${id}`,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

