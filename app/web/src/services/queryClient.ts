import { QueryClient } from '@tanstack/react-query'

// Default query options
const defaultQueryOptions = {
  queries: {
    // Stale time - how long data stays fresh
    staleTime: 5 * 60 * 1000, // 5 minutes

    // Cache time - how long data stays in cache after component unmounts
    cacheTime: 10 * 60 * 1000, // 10 minutes

    // Retry configuration
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors except 408 (timeout)
      if (
        error?.response?.status >= 400 &&
        error?.response?.status < 500 &&
        error?.response?.status !== 408
      ) {
        return false
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch on window focus
    refetchOnWindowFocus: true,

    // Refetch on reconnect
    refetchOnReconnect: true,

    // Background refetch interval
    refetchInterval: undefined, // Disable by default, enable per query as needed
  },

  mutations: {
    // Retry mutations once
    retry: 1,

    // Retry delay for mutations
    retryDelay: 1000,
  },
}

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
})

// Error handling for the query client
queryClient.setMutationDefaults(['lists', 'create'], {
  onError: (error: any) => {
    console.error('List creation failed:', error)
  },
})

queryClient.setMutationDefaults(['lists', 'update'], {
  onError: (error: any) => {
    console.error('List update failed:', error)
  },
})

queryClient.setMutationDefaults(['lists', 'delete'], {
  onError: (error: any) => {
    console.error('List deletion failed:', error)
  },
})

queryClient.setMutationDefaults(['tasks', 'create'], {
  onError: (error: any) => {
    console.error('Task creation failed:', error)
  },
})

queryClient.setMutationDefaults(['tasks', 'update'], {
  onError: (error: any) => {
    console.error('Task update failed:', error)
  },
})

queryClient.setMutationDefaults(['tasks', 'delete'], {
  onError: (error: any) => {
    console.error('Task deletion failed:', error)
  },
})

// Global error handler
queryClient.setDefaultOptions({
  queries: {
    ...defaultQueryOptions.queries,
  },
})
