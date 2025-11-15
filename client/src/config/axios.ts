import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * =============================================================================
 * AXIOS INSTANCE CONFIGURATION
 * =============================================================================
 * This file contains the main axios instance with interceptors for:
 * 1. Automatic token attachment to requests
 * 2. Token refresh on 401 errors with request queuing
 * 3. Automatic redirect to login when refresh fails
 */

// =============================================================================
// AXIOS INSTANCES
// =============================================================================

/**
 * Main axios instance for all API calls
 * - Includes request/response interceptors
 * - Handles token refresh automatically
 */
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Important: Sends cookies (refresh token) with every request
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Separate axios instance for refresh token endpoint
 * - Does NOT have interceptors
 * - Prevents infinite loops if refresh endpoint returns 401
 * - Only used internally for token refresh
 */
const axiosRefreshInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API URL from env:", process.env.NEXT_PUBLIC_API_URL);
console.log("axiosInstance.defaults.baseURL", axiosInstance.defaults.baseURL);

// =============================================================================
// USER & TOKEN MANAGEMENT
// =============================================================================

/**
 * Retrieves user data from localStorage
 * Only runs on client-side (browser)
 */
export const getUser = () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

/**
 * Gets the current access token from localStorage
 */
export const getAccessToken = () => {
  const user = getUser();
  return user?.accessToken || null;
};

/**
 * Updates the stored user data with a new access token
 */
const updateStoredAccessToken = (newAccessToken: string) => {
  const user = getUser();
  if (user) {
    user.accessToken = newAccessToken;
    localStorage.setItem("user", JSON.stringify(user));
  }
};

// =============================================================================
// TOKEN REFRESH QUEUE MECHANISM
// =============================================================================

/**
 * REQUEST QUEUE EXPLANATION:
 *
 * Problem: When multiple API calls fail simultaneously with 401 errors,
 * we don't want each one to trigger a separate token refresh.
 *
 * Solution: Use a queue to handle all failed requests together:
 * 1. First 401 triggers token refresh
 * 2. Subsequent 401s are queued while refresh is in progress
 * 3. After refresh succeeds/fails, all queued requests are resolved/rejected
 *
 * Benefits:
 * - Only one refresh call happens at a time
 * - All failed requests are retried with the new token
 * - More efficient and prevents race conditions
 */

let isRefreshing = false; // Flag to track if token refresh is in progress
let failedRequestsQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = []; // Queue to store failed requests during refresh

/**
 * Processes all queued requests after token refresh completes
 * @param error - If present, all queued requests will be rejected
 * @param token - If present, all queued requests will be resolved with new token
 */
const processQueue = (error: any = null, token: string | null = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedRequestsQueue = []; // Clear the queue after processing
};

// =============================================================================
// REQUEST INTERCEPTOR
// =============================================================================

/**
 * Attaches the access token to every outgoing request
 * This runs BEFORE every API call
 */
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

// =============================================================================
// RESPONSE INTERCEPTOR (TOKEN REFRESH LOGIC)
// =============================================================================

/**
 * Handles 401 errors and automatically refreshes tokens
 * This runs AFTER every API call
 */
axiosInstance.interceptors.response.use(
  (response) => response, // If successful, just return the response
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 errors, and only if we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if a token refresh is already in progress
      if (isRefreshing) {
        /**
         * QUEUEING LOGIC:
         * A refresh is already happening, so we queue this failed request
         * It will be retried once the refresh completes
         */
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Refresh succeeded, retry with new token
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            // Refresh failed, reject this request too
            return Promise.reject(err);
          });
      }

      // Mark this request as already retried to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true; // Set the refresh flag

      try {
        /**
         * TOKEN REFRESH:
         * Using separate axios instance to prevent interceptor recursion
         * The refresh token is automatically sent via httpOnly cookie
         */
        const response = await axiosRefreshInstance.post("/auth/refresh-token");
        const { accessToken } = response.data;

        // Update the stored access token
        updateStoredAccessToken(accessToken);

        // Process all queued requests with the new token
        processQueue(null, accessToken);

        // Retry the original request with the new token
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        /**
         * REFRESH FAILED:
         * The refresh token is invalid/expired
         * Reject all queued requests and redirect to login
         */
        processQueue(refreshError, null);

        // Redirect to login and save the current URL for post-login redirect
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname + window.location.search;

          // Don't save auth pages as redirect targets
          if (
            !currentPath.startsWith("/auth/login") &&
            !currentPath.startsWith("/auth/signup") &&
            !currentPath.startsWith("/auth/logout")
          ) {
            localStorage.setItem("redirectAfterLogin", currentPath);
          }

          // Clear user data since session is invalid
          localStorage.removeItem("user");

          // Redirect to login page
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Reset the refresh flag
      }
    }

    // For all other errors, just reject
    return Promise.reject(error);
  }
);

// =============================================================================
// AUTH MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Stores user data and access token after successful login
 * @param userData - User information including accessToken, userId, role, etc.
 */
export const loginUser = (userData: {
  accessToken: string;
  userId: string;
  role: string;
  [key: string]: any; // For any additional user data
}) => {
  localStorage.setItem("user", JSON.stringify(userData));
};

/**
 * Clears user data from localStorage on logout
 * Note: The refresh token cookie will be cleared by the server
 */
export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("redirectAfterLogin");
};

/**
 * Helper function to get user role
 */
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

/**
 * Helper function to get user ID
 */
export const getUserId = () => {
  const user = getUser();
  return user?.userId || null;
};

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = () => {
  return getAccessToken() !== null;
};
