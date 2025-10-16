/**
 * useModels Hook
 * 
 * Example hook demonstrating how to use the model service with React Query
 */

import { useQuery } from '@tanstack/react-query';
import { getModels, isModelAvailable as checkModelAvailability } from '../services';

/**
 * Hook to fetch available models
 */
export function useModels() {
  const {
    data: models = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['models'],
    queryFn: () => getModels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    models,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to check if a specific model is available
 */
export function useModelAvailability(modelName: string) {
  const { data: isAvailable = false, isLoading } = useQuery({
    queryKey: ['model-availability', modelName],
    queryFn: () => checkModelAvailability(modelName),
    enabled: !!modelName,
    staleTime: 5 * 60 * 1000,
  });

  return {
    isAvailable,
    isLoading,
  };
}

