/**
 * Chat Service
 * 
 * Handles all chat-related API calls
 */

import axiosInstance, { apiRequest, handleApiError } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants/api';
import type { Message, ChatResponse } from '../types';
import type { ApiResponse } from '@/types/api';

/**
 * Send Message Request
 */
export interface SendMessageRequest {
  messages: Message[];
  model?: string;
  stream?: boolean;
  threadId?: string;
}

/**
 * Send Message Response
 */
export interface SendMessageResponse {
  content: string;
  model: string;
  context?: any[];
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

/**
 * Send a message to the chat API
 */
export async function sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
  try {
    return await apiRequest<SendMessageResponse>({
      method: 'POST',
      url: API_ENDPOINTS.CHAT.SEND_MESSAGE,
      data,
    });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Send a streaming message to the chat API
 * Returns an async generator that yields message chunks
 */
export async function* sendStreamingMessage(
  data: SendMessageRequest
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await axiosInstance.post(
      API_ENDPOINTS.CHAT.SEND_MESSAGE,
      { ...data, stream: true },
      {
        responseType: 'stream',
        headers: {
          Accept: 'text/event-stream',
        },
      }
    );

    // For browser environment, handle ReadableStream
    if (typeof window !== 'undefined' && response.data instanceof ReadableStream) {
      const reader = response.data.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                yield parsed.content;
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }
    }
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Send a fetch-based streaming message (alternative for browser)
 * This is the preferred method for browser-based streaming
 */
export async function* sendStreamingMessageFetch(
  data: SendMessageRequest
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              yield parsed.content;
            }
          } catch (e) {
            console.error('Error parsing streaming data:', e);
          }
        }
      }
    }
  } catch (error) {
    throw handleApiError(error);
  }
}

