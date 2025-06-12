import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management functions
const getAccessToken = () => localStorage.getItem("accessToken");

const setAuthHeader = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // The refresh token is automatically sent in the cookie
        const response = await axiosInstance.post('/auth/refresh-token');
        const { accessToken } = response.data;

        // Update the access token
        localStorage.setItem("accessToken", accessToken);
        setAuthHeader(accessToken);

        // Retry the original request with the new token
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname + window.location.search;
          if (currentPath !== "/auth/login" && currentPath !== "/auth/logout") {
            localStorage.setItem("redirectAfterLogin", currentPath);
          }
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth management functions
export const loginUser = (accessToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  setAuthHeader(accessToken);
};

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  setAuthHeader(null);
  // The refresh token cookie will be cleared by the server
};
