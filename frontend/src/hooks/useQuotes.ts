import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { QuoteRequest, Quote } from '@/types/quote';

export function useQuotes(filters?: {
  status?: string;
  carrier?: string;
  startDate?: string;
  endDate?: string;
  enableRealtime?: boolean;
}) {
  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: () => apiClient.getQuotes(filters),
    // Enable real-time updates by refetching every 5 seconds when enabled
    refetchInterval: filters?.enableRealtime ? 5000 : false,
    refetchIntervalInBackground: true,
  });
}

export function useQuote(quoteId: string | null) {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => (quoteId ? apiClient.getQuote(quoteId) : null),
    enabled: !!quoteId,
  });
}

export function useSubmitQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuoteRequest) => apiClient.postQuote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

// Placeholder for real-time subscription
export function useRealtimeQuotes(clientId: string) {
  const queryClient = useQueryClient();

  // In production, this would connect to WebSocket/SSE
  // For now, it's a placeholder that can be implemented later
  const subscribeToRealtime = () => {
    // Example: WebSocket connection
    // const ws = new WebSocket(`wss://api.example.com/realtime?clientId=${clientId}`);
    // ws.onmessage = (event) => {
    //   const quote = JSON.parse(event.data);
    //   queryClient.setQueryData(['quotes'], (old: any) => {
    //     return {
    //       ...old,
    //       quotes: [quote, ...(old?.quotes || [])],
    //     };
    //   });
    // };
    // return () => ws.close();
  };

  return { subscribeToRealtime };
}
