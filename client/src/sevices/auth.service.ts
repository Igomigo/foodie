import axios from "axios";
import type { LoginFormData, SignupFormData } from "@/lib/auth-validation";
import { normalizePhone } from "@/lib/auth-validation";
import { toSavedLocation } from "@/lib/location-validation";
import { loginUser, logoutUser } from "@/config/axios";

// Public auth requests must not trigger the signed-in session refresh interceptor.
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export async function signUp(data: SignupFormData) {
  const response = await authApi.post("/auth/user-signup", {
    username: data.username,
    email: data.email,
    password: data.password,
    phoneNumber: normalizePhone(data.phoneNumber),
    location: toSavedLocation(data),
    role: "user",
  });
  return response.data;
}

export async function signIn(data: LoginFormData) {
  const response = await authApi.post("/auth/login", data);
  loginUser(response.data.data);
  return response.data;
}

export async function forgotPassword(email: string) {
  const response = await authApi.post("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
) {
  const response = await authApi.post("/auth/reset-password", {
    token,
    password,
    confirmPassword,
  });
  return response.data;
}

export async function signOut() {
  await authApi.post("/auth/logout");
  logoutUser();
}
