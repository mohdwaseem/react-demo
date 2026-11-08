"use client";
// =====================================================================================
//  App-wide "providers": wrappers that make shared services available to every component.
//  Comparable to registering singletons in Program.cs (builder.Services.Add...).
// =====================================================================================
import { useState } from "react";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import { signalUnauthorized } from "@/lib/auth/session";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // data is "fresh" for 30s → no refetch when you come back to a page
        retry: (failureCount, error) =>
          // don't retry 4xx errors (they will fail again), retry network/5xx once
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 1,
        refetchOnWindowFocus: false,
      },
    },
    // Global handler for ALL mutations: 401 = token missing/expired → AuthProvider sends you to /login.
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) signalUnauthorized();
      },
    }),
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // useState(initializer) → the QueryClient is created once per browser tab, not on every render.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
