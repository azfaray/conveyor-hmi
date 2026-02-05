// File: app/providers.tsx
'use client';

import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MqttProvider } from '@/hooks/use-mqtt'; // <--- The New Provider

// 1. Keep your exact original Query configuration
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
  return (
    // 2. Wrap everything in QueryClient (Standard Data)
    <QueryClientProvider client={query_client}>
      
      {/* 3. Wrap everything in MqttProvider (Real-time Connection) */}
      {/* This keeps the WebSocket alive even when you change pages */}
      <MqttProvider>
         {children}
      </MqttProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}