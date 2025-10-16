/**
 * useChat Hook
 * 
 * Example hook demonstrating how to use the chat service with React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage as sendMessageService, sendStreamingMessageFetch, SendMessageRequest } from '../services';
import { useState } from 'react';

export function useChat() {
  const queryClient = useQueryClient();
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  /**
   * Send message mutation (non-streaming)
   */
  const sendMessageMutation = useMutation({
    mutationFn: (data: SendMessageRequest) => sendMessageService(data),
    onSuccess: (data) => {
      // Invalidate relevant queries after successful message
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });

  /**
   * Send streaming message
   */
  const sendStreamingMessage = async (data: SendMessageRequest) => {
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const stream = sendStreamingMessageFetch(data);
      
      for await (const chunk of stream) {
        setStreamingContent((prev) => prev + chunk);
      }
      
      // Invalidate queries after streaming completes
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    } catch (error) {
      console.error('Error in streaming:', error);
      throw error;
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    // Non-streaming
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
    data: sendMessageMutation.data,
    
    // Streaming
    sendStreamingMessage,
    streamingContent,
    isStreaming,
    resetStream: () => setStreamingContent(''),
  };
}

