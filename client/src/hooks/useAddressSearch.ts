"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@/config/axios";
import { searchAddresses } from "@/sevices/location.service";

export function useAddressSearch(text: string) {
  const search = text.trim();
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(search), 500);
    return () => clearTimeout(timeout);
  }, [search]);
  const userId = getUserId();
  const query = useQuery({
    queryKey: ["address-search", userId, debounced],
    queryFn: ({ signal }) => searchAddresses(debounced, signal),
    enabled:
      !!userId &&
      debounced === search &&
      debounced.length >= 3 &&
      debounced.length <= 200,
    gcTime: 0,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  return {
    ...query,
    data: debounced === search ? query.data : undefined,
    isDebouncing: debounced !== search,
  };
}
