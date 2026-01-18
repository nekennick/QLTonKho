'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook generic để thay thế useSmartCache
 * Sử dụng TanStack Query để quản lý cache
 */
export function useQueryData<T = any>(
  key: string | readonly unknown[],
  fetcher: () => Promise<T> | T,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }
) {
  return useQuery({
    queryKey: typeof key === 'string' ? queryKeys.custom(key) : key,
    queryFn: async () => {
      const result = await fetcher();
      return result;
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 phút mặc định
    gcTime: options?.gcTime ?? 30 * 60 * 1000, // 30 phút mặc định
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
}

/**
 * Hook để invalidate và refetch query
 */
export function useInvalidateQuery() {
  const queryClient = useQueryClient();

  return {
    invalidate: (key: string | readonly unknown[]) => {
      const queryKey = typeof key === 'string' ? queryKeys.custom(key) : key;
      return queryClient.invalidateQueries({ queryKey });
    },
    refetch: (key: string | readonly unknown[]) => {
      const queryKey = typeof key === 'string' ? queryKeys.custom(key) : key;
      return queryClient.refetchQueries({ queryKey });
    },
    remove: (key: string | readonly unknown[]) => {
      const queryKey = typeof key === 'string' ? queryKeys.custom(key) : key;
      return queryClient.removeQueries({ queryKey });
    },
  };
}

