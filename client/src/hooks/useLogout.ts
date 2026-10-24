"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "@/config/axios";
import { signOut } from "@/sevices/auth.service";

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      await client.cancelQueries();
      logoutUser();
      client.clear();
    },
  });
}
