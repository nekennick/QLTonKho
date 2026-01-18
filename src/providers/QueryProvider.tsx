'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: thời gian data được coi là "fresh" (5 phút)
            staleTime: 5 * 60 * 1000,
            // Cache time: thời gian giữ data trong cache sau khi không còn component nào sử dụng (30 phút)
            gcTime: 30 * 60 * 1000,
            // Retry: số lần retry khi fetch thất bại
            retry: 1,
            // Refetch on window focus: tự động refetch khi user quay lại tab
            refetchOnWindowFocus: false,
            // Refetch on reconnect: tự động refetch khi mạng kết nối lại
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry mutations khi thất bại
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

