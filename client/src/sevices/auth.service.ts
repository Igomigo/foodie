import axios from "axios";
import type { LoginFormData, SignupFormData } from "@/lib/auth-validation";
import { normalizePhone } from "@/lib/auth-validation";
import { toSavedLocation } from "@/lib/location-validation";
import type { StoredUser } from "@/types/user";

// Public auth requests must not trigger the signed-in session refresh interceptor.
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export async function signUp(data: SignupFormData) {
  await authApi.post("/auth/user-signup", {
    username: data.username,
    email: data.email,
    password: data.password,
    phoneNumber: normalizePhone(data.phoneNumber),
    location: toSavedLocation(data),
    role: "user",
  });
}

export async function signIn(data: LoginFormData): Promise<StoredUser> {
  const response = await authApi.post("/auth/login", data);
  return response.data.data;
}

export async function forgotPassword(email: string) {
  await authApi.post("/auth/forgot-password", { email });
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
) {
  await authApi.post("/auth/reset-password", {
    token,
    password,
    confirmPassword,
  });
}

export async function signOut() {
  await authApi.post("/auth/logout");
}
