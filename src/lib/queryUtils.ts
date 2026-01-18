'use client';

import { QueryClient, QueryKey } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * Các giá trị stale time cho React Query (tính bằng milliseconds)
 */
export const STALE_TIME = {
  SHORT: 1 * 60 * 1000,    // 1 phút
  MEDIUM: 5 * 60 * 1000,   // 5 phút
  LONG: 10 * 60 * 1000,     // 10 phút
  VERY_LONG: 30 * 60 * 1000, // 30 phút
} as const;

/**
 * Context type cho optimistic update
 */
export interface OptimisticUpdateContext<T> {
  previousData: T | undefined;
}

/**
 * Xử lý khi mutation thành công
 * @param message - Thông báo thành công
 */
export function handleMutationSuccess(message: string): void {
  toast.success(message);
}

/**
 * Xử lý khi mutation lỗi
 * @param error - Lỗi xảy ra
 * @param defaultMessage - Thông báo lỗi mặc định
 */
export function handleMutationError(error: unknown, defaultMessage: string): void {
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  toast.error(errorMessage);
}

/**
 * Thực hiện optimistic update cho query
 * @param queryClient - QueryClient instance
 * @param queryKey - Query key cần cập nhật
 * @param updater - Hàm cập nhật dữ liệu
 * @returns Context chứa previousData để rollback nếu cần
 */
export async function optimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: (old: T | undefined) => T
): Promise<OptimisticUpdateContext<T>> {
  // Cancel outgoing refetches để tránh overwrite optimistic update
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update
  queryClient.setQueryData<T>(queryKey, updater);

  return { previousData };
}

/**
 * Rollback optimistic update khi có lỗi
 * @param queryClient - QueryClient instance
 * @param queryKey - Query key cần rollback
 * @param previousData - Dữ liệu trước đó
 */
export function rollbackOptimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  previousData: T | undefined
): void {
  queryClient.setQueryData(queryKey, previousData);
}

