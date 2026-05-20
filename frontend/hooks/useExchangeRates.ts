import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const FALLBACK_RATES: Record<string, number> = { USD: 1.0, EUR: 0.92, GBP: 0.79, CHF: 0.88 };

export function useExchangeRates(): Record<string, number> {
  const { data } = useQuery({
    queryKey: ["exchangeRates"],
    queryFn: async () => {
      const res = await api.getExchangeRates();
      const rates = res.rates ?? FALLBACK_RATES;
      if (process.env.NODE_ENV === "development") {
        console.log(`[exchange-rates] source: ${res.source ?? "unknown"}`, rates);
      }
      return rates;
    },
    staleTime: 24 * 60 * 60 * 1000,
    placeholderData: FALLBACK_RATES,
  });
  return data ?? FALLBACK_RATES;
}
