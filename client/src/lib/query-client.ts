import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failures, error) =>
          failures < 1 &&
          (!isAxiosError(error) ||
            !error.response ||
            error.response.status >= 500),
      },
      mutations: {
        retry: false,
        // Actions fail immediately offline; never queue passwords or device positions.
        networkMode: "always",
        gcTime: 0,
      },
    },
  });
}
