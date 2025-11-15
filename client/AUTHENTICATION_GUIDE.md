# Authentication & Route Protection Guide

This document explains the authentication architecture implemented for Foodie application.

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Axios Configuration](#axios-configuration)
3. [Route Protection Middleware](#route-protection-middleware)
4. [How to Use](#how-to-use)
5. [Future Enhancement: Zustand State Management](#future-enhancement-zustand-state-management)
6. [Security Considerations](#security-considerations)

---

## Overview

Your authentication system uses a **dual-token approach**:

- **Access Token**: Short-lived (5 minutes), stored in localStorage
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookies

### Key Features

✅ Automatic token refresh when access token expires  
✅ Request queuing to prevent multiple simultaneous refresh calls  
✅ Automatic redirect to login when refresh fails  
✅ Post-login redirect to intended page  
✅ Role-based access control (RBAC) ready  
✅ Centralized authentication logic

---

## Axios Configuration

**Location**: `client/src/config/axios.ts`

### What Was Fixed

#### ❌ **Before (Problems)**

1. **Infinite Loop Risk**: Refresh endpoint used the same axios instance with interceptors
2. **Race Conditions**: Multiple 401s triggered multiple refresh calls
3. **Redundant Code**: Headers set in two places
4. **Security Issue**: Access tokens in localStorage (acceptable for now, but noted)

#### ✅ **After (Solutions)**

1. **Separate Axios Instance for Refresh**

   ```typescript
   const axiosRefreshInstance = axios.create({...});
   ```

   - No interceptors = no recursion
   - If `/auth/refresh-token` returns 401, it won't trigger the interceptor again

2. **Request Queueing Mechanism**

   ```typescript
   let isRefreshing = false;
   let failedRequestsQueue = [];
   ```

   **How It Works:**

   **Scenario**: User opens 3 tabs, all making API calls. Access token expires.

   - **Without Queue**: All 3 tabs try to refresh simultaneously → 3 refresh API calls
   - **With Queue**:
     1. First 401 triggers refresh, sets `isRefreshing = true`
     2. Other 401s see `isRefreshing = true`, add themselves to queue
     3. When refresh completes, all queued requests retry with new token

   **Benefits:**

   - Only ONE refresh call at a time
   - All failed requests eventually succeed
   - Prevents race conditions
   - More efficient

3. **Clean Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│ User Makes API Request (e.g., GET /api/user/profile)       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Request        │  ← Adds Authorization: Bearer <token>
         │ Interceptor    │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │   API Server   │
         └────────┬───────┘
                  │
          ┌───────┴────────┐
          │                │
  ┌───────▼─────┐   ┌─────▼──────┐
  │  Success    │   │  401 Error  │
  │  (200-299)  │   │             │
  └───────┬─────┘   └─────┬──────┘
          │               │
          │               ▼
          │    ┌──────────────────────┐
          │    │ Response Interceptor │
          │    └──────────┬───────────┘
          │               │
          │               ▼
          │    ┌──────────────────────┐
          │    │ Is Refreshing?       │
          │    └──────────┬───────────┘
          │               │
          │        ┌──────┴──────┐
          │        │             │
          │   ┌────▼───┐   ┌────▼────┐
          │   │  YES   │   │   NO    │
          │   └────┬───┘   └────┬────┘
          │        │            │
          │        │            ▼
          │        │   ┌────────────────┐
          │        │   │ Set isRefreshing│
          │        │   │    = true       │
          │        │   └────────┬───────┘
          │        │            │
          │        │            ▼
          │        │   ┌────────────────┐
          │        │   │ Call Refresh   │
          │        │   │ Token API      │
          │        │   └────────┬───────┘
          │        │            │
          │        │     ┌──────┴───────┐
          │        │     │              │
          │        │ ┌───▼────┐   ┌────▼─────┐
          │        │ │Success │   │  Failed   │
          │        │ └───┬────┘   └────┬─────┘
          │        │     │             │
          │        │     │             ▼
          │        │     │    ┌────────────────┐
          │        │     │    │ Clear User Data│
          │        │     │    │ Save Redirect  │
          │        │     │    │ Go to Login    │
          │        │     │    └────────────────┘
          │        │     │
          │        │     ▼
          │        │  ┌─────────────────┐
          │        │  │ Process Queue   │
          │        │  │ (resolve all    │
          │        │  │  with new token)│
          │        │  └────────┬────────┘
          │        │           │
          │    ┌───▼───────────▼────┐
          │    │ Add to Queue       │
          │    │ Wait for refresh   │
          │    └───────┬────────────┘
          │            │
          ▼            ▼
  ┌────────────────────────────┐
  │  Return Response/Retry     │
  │  Original Request          │
  └────────────────────────────┘
```

4. **Improved Redirect Logic**
   - Excludes all `/auth/*` pages from redirect targets
   - Clears user data when session expires
   - Cleans up redirect URL on logout

---

## Route Protection Middleware

**Location**: `client/src/middleware/withAuth.tsx`

### What It Does

This is a **Higher-Order Component (HOC)** that wraps your protected pages.

**Think of it like a security guard at a door:**

- Checks ID (access token) before letting anyone in
- If no ID → "Please go to reception (login) first"
- If ID is valid → "Welcome, come in!"

### How It Works

```tsx
export default function withAuth(Component, options) {
  return function ProtectedRoute(props) {
    // 1. Check authentication on mount
    useEffect(() => {
      if (!isAuthenticated()) {
        // Save where they wanted to go
        localStorage.setItem("redirectAfterLogin", currentPath);
        // Send to login
        router.replace("/auth/login");
        return;
      }

      // 2. Optional: Check role
      if (requiredRole && userRole !== requiredRole) {
        router.replace("/unauthorized");
        return;
      }

      // 3. All good, stop showing loading
      setIsChecking(false);
    }, []);

    // Show loading while checking
    if (isChecking) return <LoadingSpinner />;

    // Render the protected component
    return <Component {...props} />;
  };
}
```

### Why We Use It

**Without Middleware (Bad):**

```tsx
// Dashboard.tsx
function Dashboard() {
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, []);

  return <div>Dashboard</div>;
}

// Profile.tsx
function Profile() {
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, []);

  return <div>Profile</div>;
}

// ... repeat for every protected page 😫
```

**With Middleware (Good):**

```tsx
// Dashboard.tsx
function Dashboard() {
  return <div>Dashboard</div>;
}
export default withAuth(Dashboard);

// Profile.tsx
function Profile() {
  return <div>Profile</div>;
}
export default withAuth(Profile);

// Clean! No repeated code! 🎉
```

---

## How to Use

### 1. Protecting a Basic Page

```tsx
// app/dashboard/page.tsx
"use client";

import withAuth from "@/middleware/withAuth";

function DashboardPage() {
  return (
    <div>
      <h1>Welcome to Dashboard</h1>
      <p>This page is protected!</p>
    </div>
  );
}

export default withAuth(DashboardPage);
```

### 2. Protecting with Role Requirements

```tsx
// app/admin/page.tsx
"use client";

import withAuth from "@/middleware/withAuth";

function AdminPage() {
  return <div>Admin Only Content</div>;
}

export default withAuth(AdminPage, { requiredRole: "admin" });
```

**Or use the convenience wrapper:**

```tsx
import { withAdminAuth } from "@/middleware/withAuth";

function AdminPage() {
  return <div>Admin Only Content</div>;
}

export default withAdminAuth(AdminPage);
```

### 3. Making Protected API Calls

```tsx
// services/user.service.ts
import { axiosInstance } from "@/config/axios";

export const getUserProfile = async () => {
  const response = await axiosInstance.get("/user/profile");
  return response.data;
};

// In your component
const profile = await getUserProfile();
// If token expires, it will:
// 1. Automatically refresh
// 2. Retry the request
// 3. You never even know it happened! ✨
```

### 4. The Complete Login-Redirect Flow

**User Journey:**

1. **User tries to access** → `/dashboard`
2. **Not logged in** → Redirected to `/auth/login`
   - `localStorage.setItem("redirectAfterLogin", "/dashboard")`
3. **User logs in successfully**
4. **Login page checks** → `localStorage.getItem("redirectAfterLogin")`
5. **User redirected to** → `/dashboard` (where they wanted to go!)

**Already implemented in your login page** ✅ (lines 48-55)

---

## Future Enhancement: Zustand State Management

### Why Zustand is NOT Implemented Yet

Right now, you're using **localStorage** directly for auth state. This works but has limitations:

**Current Limitations:**

- ❌ Components don't automatically re-render when auth state changes
- ❌ Need to manually read from localStorage in every component
- ❌ No centralized auth state accessible everywhere
- ❌ Can't easily share user data across components without prop drilling

### How Zustand Will Fix This

**Zustand** is a lightweight state management library (simpler than Redux).

### The Future Architecture (with Zustand)

```tsx
// stores/authStore.ts (FUTURE IMPLEMENTATION)
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  userId: string;
  role: string;
  accessToken: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  updateAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      updateAccessToken: (token) =>
        set((state) => ({
          user: state.user ? { ...state.user, accessToken: token } : null,
        })),
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
```

### What Zustand Will Handle

1. **User Authentication State**

   - User info (name, email, role, etc.)
   - Access token
   - Authentication status

2. **Automatic Component Updates**

   ```tsx
   // Any component can use this hook
   const { user, isAuthenticated } = useAuthStore();

   // When user logs in/out, ALL components using this hook
   // automatically re-render with the new state! 🎉
   ```

3. **Centralized Access**

   ```tsx
   // Before (localStorage)
   const user = JSON.parse(localStorage.getItem("user"));
   const username = user?.username;

   // After (Zustand)
   const { user } = useAuthStore();
   const username = user?.username;
   ```

4. **Integration with Axios**

   ```tsx
   // In axios.ts, instead of:
   localStorage.setItem("user", JSON.stringify(userData));

   // We'll use:
   useAuthStore.getState().setUser(userData);
   ```

### What Zustand Will NOT Handle

- ❌ API calls (that's axios's job)
- ❌ Route protection (that's the middleware's job)
- ❌ Token refresh logic (that's axios interceptor's job)

**Zustand's ONLY job**: Store and share authentication state across components efficiently.

### Why Wait to Implement Zustand?

Your current implementation works perfectly fine! Zustand is an **enhancement, not a fix**.

**When to add Zustand:**

- When you have many components that need user data
- When you want real-time auth state updates across the app
- When you want to avoid prop drilling
- When you want cleaner, more maintainable code

**For now:** Focus on making sure the axios + middleware pattern works well. Add Zustand later as a refinement.

---

## Security Considerations

### Current Security Measures ✅

1. **HttpOnly Cookies for Refresh Token**

   - Cannot be accessed by JavaScript
   - Protected from XSS attacks
   - Automatically sent with requests

2. **Short-Lived Access Tokens**

   - 5 minutes expiry
   - Limits damage if compromised
   - Automatically refreshed

3. **Separate Refresh Instance**
   - Prevents infinite loops
   - Clean separation of concerns

### Known Trade-offs ⚠️

1. **Access Token in localStorage**

   - Vulnerable to XSS attacks
   - **Mitigation**: Sanitize all user inputs, use Content Security Policy (CSP)
   - **Alternative**: In-memory storage (loses token on page refresh)

2. **Client-Side Authentication Checks**
   - User can bypass if they modify localStorage
   - **Mitigation**: Server ALWAYS validates tokens, client checks are just for UX

### Best Practices

✅ **Always validate tokens on the server**  
✅ **Use HTTPS in production**  
✅ **Implement rate limiting on auth endpoints**  
✅ **Log security events (failed logins, token refreshes)**  
✅ **Implement CSRF protection if using cookies for access tokens**

---

## Testing Scenarios

Test these scenarios to ensure everything works:

### ✅ **Scenario 1: Normal Login**

1. User logs in
2. Access token stored
3. User redirected to home or intended page

### ✅ **Scenario 2: Access Protected Page (Not Logged In)**

1. User visits `/dashboard` directly
2. Redirected to `/auth/login`
3. After login, redirected back to `/dashboard`

### ✅ **Scenario 3: Token Expiry During Use**

1. User is on the app, makes an API call
2. Access token expired (401 error)
3. Token automatically refreshed
4. Original request retried with new token
5. User never notices anything! ✨

### ✅ **Scenario 4: Multiple Simultaneous 401s**

1. User has multiple tabs open
2. Access token expires
3. All tabs make API calls → all get 401
4. Only ONE refresh call is made
5. All failed requests are queued and retried together

### ✅ **Scenario 5: Refresh Token Expired**

1. User is on the app, makes an API call
2. Access token expired (401)
3. Try to refresh, but refresh token also expired
4. User redirected to login
5. Current URL saved for post-login redirect

### ✅ **Scenario 6: Logout**

1. User clicks logout
2. User data cleared from localStorage
3. Refresh token cookie cleared by server
4. User redirected to login

---

## Summary

### What We Built

1. **Robust Axios Configuration** (`config/axios.ts`)

   - ✅ Separate refresh instance (no infinite loops)
   - ✅ Request queuing (one refresh at a time)
   - ✅ Automatic token refresh
   - ✅ Intelligent redirect logic

2. **Route Protection Middleware** (`middleware/withAuth.tsx`)

   - ✅ Simple HOC pattern
   - ✅ Prevents unauthorized access
   - ✅ Role-based access control
   - ✅ Works seamlessly with axios

3. **Clean Redirect Flow**
   - ✅ Saves intended URL
   - ✅ Redirects after login
   - ✅ No duplicate code

### What's Next (When You're Ready)

- **Add Zustand**: Centralized auth state management
- **Server-Side Middleware**: Next.js 15 middleware for server protection
- **Better Loading States**: Custom loading components
- **Error Boundaries**: Graceful error handling
- **Security Enhancements**: CSP, rate limiting, etc.

---

**Everything is simple, professional, and follows industry standards. No over-engineering, just solid architecture.** 🎉
