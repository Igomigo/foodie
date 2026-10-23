import { isAxiosError } from "axios";

export function apiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const message =
      error.response?.data?.errors || error.response?.data?.message;
    if (typeof message === "string") return message;
    if (!error.response)
      return "We couldn’t connect. Check your connection and try again";
  }
  return fallback;
}
