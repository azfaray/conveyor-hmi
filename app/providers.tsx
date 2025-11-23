// File: src/app/providers.tsx (Client Component)
'use client';

import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMQTT } from '@/hooks/use-mqtt';

const query_client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 100,
      gcTime: 300,
      retry: 1,
      refetchInterval: 500,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useMQTT();
  return (
    <QueryClientProvider client={query_client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
