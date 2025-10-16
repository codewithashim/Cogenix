/**
 * Thread Service
 * 
 * Handles all thread-related API calls
 */

import { apiRequest, handleApiError } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import type { Message } from '../types';

/**
 * Create Thread Request
 */
export interface CreateThreadRequest {
  title?: string;
  firstMessage?: string;
}

/**
 * Update Thread Request
 */
export interface UpdateThreadRequest {
  title?: string;
  lastMessageAt?: Date;
}

/**
 * Thread Response (matching your model)
 */
export interface ThreadResponse {
  _id: string;
  title: string;
  model?: string;
  aiModel?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

/**
 * Get Messages Response
 */
export interface GetMessagesResponse {
  messages: Message[];
  threadId: string;
}

/**
 * Get all threads
 */
export async function getAllThreads(): Promise<ThreadResponse[]> {
  try {
    return await apiRequest<ThreadResponse[]>({
      method: 'GET',
      url: API_ENDPOINTS.THREADS.BASE,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get a single thread by ID
 */
export async function getThreadById(id: string): Promise<ThreadResponse> {
  try {
    return await apiRequest<ThreadResponse>({
      method: 'GET',
      url: API_ENDPOINTS.THREADS.BY_ID(id),
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Create a new thread
 */
export async function createThread(data: CreateThreadRequest): Promise<ThreadResponse> {
  try {
    return await apiRequest<ThreadResponse>({
      method: 'POST',
      url: API_ENDPOINTS.THREADS.BASE,
      data,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Update an existing thread
 */
export async function updateThread(
  id: string,
  data: UpdateThreadRequest
): Promise<ThreadResponse> {
  try {
    return await apiRequest<ThreadResponse>({
      method: 'PUT',
      url: API_ENDPOINTS.THREADS.BY_ID(id),
      data,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Delete a thread
 */
export async function deleteThread(id: string): Promise<void> {
  try {
    await apiRequest<void>({
      method: 'DELETE',
      url: API_ENDPOINTS.THREADS.BY_ID(id),
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get messages for a thread
 */
export async function getThreadMessages(id: string): Promise<GetMessagesResponse> {
  try {
    return await apiRequest<GetMessagesResponse>({
      method: 'GET',
      url: API_ENDPOINTS.THREADS.MESSAGES(id),
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Add a message to a thread
 */
export async function addMessageToThread(
  id: string,
  message: Partial<Message>
): Promise<ThreadResponse> {
  try {
    return await apiRequest<ThreadResponse>({
      method: 'POST',
      url: API_ENDPOINTS.THREADS.MESSAGES(id),
      data: message,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

