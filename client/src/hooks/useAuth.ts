"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser, logoutUser } from "@/config/axios";
import { getSavedProfile } from "@/lib/profile-session";
import {
  signIn,
  signUp,
  forgotPassword,
  resetPassword,
} from "@/sevices/auth.service";
import type { LoginFormData } from "@/lib/auth-validation";
import { profileKey } from "./useProfile";

export function useLogin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      const user = await signIn(credentials);
      await client.cancelQueries();
      client.clear();
      loginUser(user);
      client.setQueryData(profileKey(user.userId), getSavedProfile());
    },
  });
}

export function useSignup() {
  return useMutation({ mutationFn: signUp });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useResetPassword() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      token,
      password,
      confirmPassword,
    }: {
      token: string;
      password: string;
      confirmPassword: string;
    }) => resetPassword(token, password, confirmPassword),
    onSuccess: async () => {
      await client.cancelQueries();
      logoutUser();
      client.clear();
    },
  });
}
