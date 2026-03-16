'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { queryOptions } from '@/lib/tanstackQueryClient';

// Create a client
export const queryClient = new QueryClient(queryOptions);

interface TanStackProviderProps {
  children: React.ReactNode;
}

export default function TanStackProvider({ children }: TanStackProviderProps) {
  const [client] = useState(() => queryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}